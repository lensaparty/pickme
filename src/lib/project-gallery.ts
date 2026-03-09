import "server-only";

import { galleryFolders, galleryPhotos } from "@/lib/mock-data";
import { logWarn } from "@/lib/logger";
import { Folder, Photo, Project, ProjectGallery } from "@/lib/types";

const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]);
const APPS_SCRIPT_URL = process.env.GOOGLE_DRIVE_APPS_SCRIPT_URL?.trim() || "";
const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY?.trim() || "";

type DriveItem = {
  id: string;
  name: string;
  mimeType?: string;
};

function isImageItem(item: DriveItem) {
  const mime = (item.mimeType || "").toLowerCase();
  if (ALLOWED_IMAGE_TYPES.has(mime)) return true;
  return /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(item.name || "");
}

function toPhoto(item: DriveItem, folderId: string): Photo {
  return {
    id: item.id,
    title: item.name,
    folderId,
    src: `https://drive.google.com/thumbnail?id=${item.id}&sz=w1600`,
  };
}

function buildAllFolder(photos: Photo[], cover?: string): Folder {
  return {
    id: "all",
    name: "All Photos",
    photoCount: photos.length,
    cover: cover || galleryFolders[0]?.cover || "",
    highlight: "Everything in one calm visual stream",
  };
}

function fallbackGallery(project: Project): ProjectGallery {
  const photos = galleryPhotos.map((photo, index) => ({
    ...photo,
    id: `${project.code}-${photo.id}`,
    title: index < 3 ? `${project.clientName} ${photo.title}` : photo.title,
  }));

  const folders = [
    buildAllFolder(photos, galleryFolders[0]?.cover),
    ...galleryFolders.filter((folder) => folder.id !== "all"),
  ];

  return {
    folders,
    photos,
    source: "fallback",
    totalPhotoCount: photos.length,
    totalFolderCount: Math.max(1, folders.length - 1),
  };
}

async function fetchAppsScriptGallery(folderId: string): Promise<ProjectGallery | null> {
  if (!APPS_SCRIPT_URL) return null;

  const response = await fetch(`${APPS_SCRIPT_URL}?folderId=${encodeURIComponent(folderId)}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Apps Script gallery request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { files?: DriveItem[] };
  const files = Array.isArray(payload.files) ? payload.files.filter(isImageItem) : [];
  if (!files.length) return null;

  const photos = files.map((file) => toPhoto(file, "gallery"));
  const firstCover = photos[0]?.src || galleryFolders[0]?.cover;
  const folders: Folder[] = [
    buildAllFolder(photos, firstCover),
    {
      id: "gallery",
      name: "Gallery",
      photoCount: photos.length,
      cover: firstCover,
      highlight: "Imported directly from Google Drive",
    },
  ];

  return {
    folders,
    photos,
    source: "apps_script",
    totalPhotoCount: photos.length,
    totalFolderCount: 1,
  };
}

async function listDriveChildren(folderId: string) {
  if (!DRIVE_API_KEY) return [] as DriveItem[];

  const query = `'${folderId}' in parents and trashed=false`;
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "files(id,name,mimeType)");
  url.searchParams.set("pageSize", "1000");
  url.searchParams.set("orderBy", "folder,name");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("key", DRIVE_API_KEY);

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Drive API request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { files?: DriveItem[] };
  return Array.isArray(payload.files) ? payload.files : [];
}

async function fetchDriveApiGallery(folderId: string): Promise<ProjectGallery | null> {
  if (!DRIVE_API_KEY) return null;

  const children = await listDriveChildren(folderId);
  const nestedFolders = children.filter((item) => item.mimeType === DRIVE_FOLDER_MIME);
  const rootImages = children.filter((item) => item.mimeType !== DRIVE_FOLDER_MIME).filter(isImageItem);

  const folderEntries = await Promise.all(
    nestedFolders.map(async (folder) => {
      const folderChildren = await listDriveChildren(folder.id);
      const imageChildren = folderChildren.filter(isImageItem);
      return {
        folder,
        images: imageChildren,
      };
    }),
  );

  const photos: Photo[] = [];
  if (rootImages.length) {
    photos.push(...rootImages.map((item) => toPhoto(item, "root")));
  }

  folderEntries.forEach(({ folder, images }) => {
    photos.push(...images.map((item) => toPhoto(item, folder.id)));
  });

  if (!photos.length) return null;

  const rootCover = photos[0]?.src || galleryFolders[0]?.cover;
  const folders: Folder[] = [buildAllFolder(photos, rootCover)];

  if (rootImages.length) {
    folders.push({
      id: "root",
      name: "Main Gallery",
      photoCount: rootImages.length,
      cover: rootImages[0] ? toPhoto(rootImages[0], "root").src : rootCover,
      highlight: "Files placed directly in the shared folder",
    });
  }

  folderEntries.forEach(({ folder, images }) => {
    if (!images.length) return;
    folders.push({
      id: folder.id,
      name: folder.name,
      photoCount: images.length,
      cover: toPhoto(images[0], folder.id).src,
      highlight: "Imported directly from Google Drive",
    });
  });

  return {
    folders,
    photos,
    source: "drive_api",
    totalPhotoCount: photos.length,
    totalFolderCount: Math.max(1, folders.length - 1),
  };
}

export async function getProjectGallery(project: Project): Promise<ProjectGallery> {
  if (!project.driveFolderId) {
    return fallbackGallery(project);
  }

  try {
    const appsScriptGallery = await fetchAppsScriptGallery(project.driveFolderId);
    if (appsScriptGallery) return appsScriptGallery;
  } catch (error) {
    await logWarn("gallery.apps_script.failed", {
      code: project.code,
      folderId: project.driveFolderId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  try {
    const driveApiGallery = await fetchDriveApiGallery(project.driveFolderId);
    if (driveApiGallery) return driveApiGallery;
  } catch (error) {
    await logWarn("gallery.drive_api.failed", {
      code: project.code,
      folderId: project.driveFolderId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return fallbackGallery(project);
}
