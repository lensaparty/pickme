import { notFound } from "next/navigation";

import { ReviewExperience } from "@/components/client/review-experience";
import { AppShell } from "@/components/layout/app-shell";
import { requireGalleryAccess } from "@/lib/auth";
import { getProjectGallery } from "@/lib/project-gallery";
import { getProjectByCode } from "@/lib/project-store";

export default async function ClientReviewPage({
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
    <AppShell className="max-w-7xl">
      <ReviewExperience project={project} photos={gallery.photos} gallerySource={gallery.source} />
    </AppShell>
  );
}
