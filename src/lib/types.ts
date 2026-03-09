export type ProjectStatus = "active" | "awaiting" | "expired";

export type Project = {
  id: string;
  code: string;
  name: string;
  clientName: string;
  eventType: string;
  createdAt: string;
  expiresAt: string;
  selectionLimit: number;
  selectedCount: number;
  selectedIds?: string[];
  folderCount: number;
  photoCount: number;
  driveLink: string;
  driveFolderId: string;
  whatsapp: string;
  status: ProjectStatus;
  passwordProtected: boolean;
  password: string;
  allowDownloads: boolean;
  welcomeMessage: string;
  lastActivity: string;
};

export type NewProjectInput = {
  name: string;
  clientName: string;
  eventType: string;
  driveLink: string;
  selectionLimit: number;
  expiresAt: string;
  whatsapp: string;
  welcomeMessage: string;
  clientCode?: string;
  password?: string;
  passwordProtected: boolean;
  allowDownloads: boolean;
};

export type Folder = {
  id: string;
  name: string;
  photoCount: number;
  cover: string;
  highlight?: string;
};

export type Photo = {
  id: string;
  title: string;
  folderId: string;
  src: string;
  selected?: boolean;
  favorite?: boolean;
};

export type ProjectSelectionPayload = {
  selectedIds: string[];
  selectedCount: number;
};

export type ProjectGallery = {
  folders: Folder[];
  photos: Photo[];
  source: "drive_api" | "apps_script" | "fallback";
  totalPhotoCount: number;
  totalFolderCount: number;
};
