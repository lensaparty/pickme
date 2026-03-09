import { notFound } from "next/navigation";

import { GalleryExperience } from "@/components/client/gallery-experience";
import { AppShell } from "@/components/layout/app-shell";
import { requireGalleryAccess } from "@/lib/auth";
import { getProjectGallery } from "@/lib/project-gallery";
import { getProjectByCode } from "@/lib/project-store";

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const project = await getProjectByCode(shareCode);

  if (!project) {
    notFound();
  }

  await requireGalleryAccess(project);

  const gallery = await getProjectGallery(project);

  return (
    <AppShell>
      <GalleryExperience
        project={project}
        folders={gallery.folders}
        photos={gallery.photos}
        gallerySource={gallery.source}
        totalPhotoCount={gallery.totalPhotoCount}
      />
    </AppShell>
  );
}
