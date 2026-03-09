"use server";

import { redirect } from "next/navigation";

import { grantGalleryAccess, readProjectPassword } from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/logger";
import { getProjectByCode } from "@/lib/project-store";
import { secureCompare } from "@/lib/secrets";

export type UnlockGalleryState = {
  error?: string;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function unlockGalleryAction(
  shareCode: string,
  _prevState: UnlockGalleryState,
  formData: FormData,
): Promise<UnlockGalleryState> {
  const password = readString(formData, "password");
  const project = await getProjectByCode(shareCode);

  if (!project) {
    await logWarn("gallery.unlock.not_found", { shareCode });
    return { error: "This gallery could not be found." };
  }

  if (!password) {
    await logWarn("gallery.unlock.validation_failed", { code: project.code, reason: "missing_password" });
    return { error: "Enter the gallery password to continue." };
  }

  const expectedPassword = readProjectPassword(project);
  if (!secureCompare(password, expectedPassword)) {
    await logWarn("gallery.unlock.failed", { code: project.code, reason: "invalid_password" });
    return { error: "That password does not match this gallery." };
  }

  await grantGalleryAccess(project);
  await logInfo("gallery.unlock.success", { code: project.code });
  redirect(`/client/${project.code}/gallery`);
}
