"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminAccess } from "@/lib/auth";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { createProject } from "@/lib/project-store";
import { extractDriveFolderId, generateShareCode } from "@/lib/project-utils";
import { NewProjectInput } from "@/lib/types";

export type CreateProjectFormState = {
  error?: string;
  values?: Record<string, string>;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createProjectAction(
  _prevState: CreateProjectFormState,
  formData: FormData,
): Promise<CreateProjectFormState> {
  await requireAdminAccess("/projects/new");

  const values = {
    name: readString(formData, "name"),
    clientName: readString(formData, "clientName"),
    eventType: readString(formData, "eventType"),
    driveLink: readString(formData, "driveLink"),
    selectionLimit: readString(formData, "selectionLimit"),
    expiresAt: readString(formData, "expiresAt"),
    whatsapp: readString(formData, "whatsapp"),
    welcomeMessage: readString(formData, "welcomeMessage"),
    clientCode: readString(formData, "clientCode"),
    password: readString(formData, "password"),
  };

  const selectionLimit = Number(values.selectionLimit);
  const passwordProtected = formData.get("passwordProtected") === "on";
  const allowDownloads = formData.get("allowDownloads") === "on";

  if (!values.name || !values.clientName || !values.driveLink || !values.expiresAt || !values.whatsapp) {
    await logWarn("project.create.validation_failed", { reason: "missing_fields" });
    return { error: "Fill the essential project fields before generating a link.", values };
  }

  if (!extractDriveFolderId(values.driveLink)) {
    await logWarn("project.create.validation_failed", { reason: "invalid_drive_link" });
    return { error: "Use a valid Google Drive folder link so PickMe can keep the delivery source clean.", values };
  }

  if (!Number.isFinite(selectionLimit) || selectionLimit <= 0) {
    await logWarn("project.create.validation_failed", { reason: "invalid_selection_limit" });
    return { error: "Selection limit needs to be a positive number.", values };
  }

  if (passwordProtected && !values.password) {
    await logWarn("project.create.validation_failed", { reason: "missing_password" });
    return { error: "Password protection is enabled, so a password is required.", values };
  }

  const input: NewProjectInput = {
    name: values.name,
    clientName: values.clientName,
    eventType: values.eventType || "Photo Session",
    driveLink: values.driveLink,
    selectionLimit,
    expiresAt: values.expiresAt,
    whatsapp: values.whatsapp,
    welcomeMessage:
      values.welcomeMessage ||
      `Hi ${values.clientName}, please select your favorite photos and send the final shortlist through WhatsApp once you're done.`,
    clientCode: values.clientCode || generateShareCode(values.clientName, values.name),
    password: values.password,
    passwordProtected,
    allowDownloads,
  };

  try {
    const project = await createProject(input);
    await logInfo("project.create.success", {
      code: project.code,
      passwordProtected: project.passwordProtected,
      selectionLimit: project.selectionLimit,
    });
    revalidatePath("/");
    revalidatePath("/projects/new");
    redirect(`/projects/success?code=${encodeURIComponent(project.code)}`);
  } catch (error) {
    await logError("project.create.failed", error, {
      clientCode: input.clientCode,
      clientName: input.clientName,
    });
    return { error: "Project could not be created right now. Please try again." };
  }
}
