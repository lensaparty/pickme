"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { deleteProjectByCode, getProjectByCode, updateProjectByCode } from "@/lib/project-store";
import { buildClientPath } from "@/lib/project-utils";

export type ManageProjectFormState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function updateProjectSettingsAction(
  code: string,
  _prevState: ManageProjectFormState,
  formData: FormData,
): Promise<ManageProjectFormState> {
  await requireAdminAccess(`/projects/${code}`);

  const values = {
    name: readString(formData, "name"),
    clientName: readString(formData, "clientName"),
    eventType: readString(formData, "eventType"),
    expiresAt: readString(formData, "expiresAt"),
    selectionLimit: readString(formData, "selectionLimit"),
    whatsapp: readString(formData, "whatsapp"),
    password: readString(formData, "password"),
    welcomeMessage: readString(formData, "welcomeMessage"),
  };

  const selectionLimit = Number(values.selectionLimit);
  const passwordProtected = formData.get("passwordProtected") === "on";
  const allowDownloads = formData.get("allowDownloads") === "on";

  if (!values.name || !values.clientName || !values.expiresAt || !values.whatsapp) {
    await logWarn("project.update.validation_failed", { code, reason: "missing_fields" });
    return { error: "Keep the core project details complete before saving changes." };
  }

  if (!Number.isFinite(selectionLimit) || selectionLimit <= 0) {
    await logWarn("project.update.validation_failed", { code, reason: "invalid_selection_limit" });
    return { error: "Selection limit needs to stay above zero." };
  }

  const existingProject = await getProjectByCode(code);
  if (!existingProject) {
    await logWarn("project.update.not_found", { code });
    return { error: "Project could not be found while saving updates." };
  }

  if (passwordProtected && !values.password && !existingProject.password) {
    await logWarn("project.update.validation_failed", { code, reason: "missing_password" });
    return { error: "Add a password if private access is enabled." };
  }

  let project;
  try {
    project = await updateProjectByCode(code, {
      name: values.name,
      clientName: values.clientName,
      eventType: values.eventType || "Photo Session",
      expiresAt: values.expiresAt,
      selectionLimit,
      whatsapp: values.whatsapp,
      passwordProtected,
      ...(values.password ? { password: values.password } : {}),
      ...(!passwordProtected ? { password: "" } : {}),
      allowDownloads,
      welcomeMessage: values.welcomeMessage,
    });
  } catch (error) {
    await logError("project.update.failed", error, { code });
    return { error: "Project settings could not be saved right now." };
  }

  if (!project) {
    await logWarn("project.update.not_found_after_write", { code });
    return { error: "Project could not be found while saving updates." };
  }

  await logInfo("project.update.success", {
    code: project.code,
    passwordProtected: project.passwordProtected,
    selectionLimit: project.selectionLimit,
  });

  revalidatePath("/");
  revalidatePath(`/projects/${project.code}`);
  revalidatePath("/projects/new");
  revalidatePath(buildClientPath(project.code));
  revalidatePath(`${buildClientPath(project.code)}/password`);
  revalidatePath(`${buildClientPath(project.code)}/gallery`);
  revalidatePath(`${buildClientPath(project.code)}/review`);

  return { success: "Project settings updated." };
}

export async function deleteProjectAction(code: string) {
  await requireAdminAccess(`/projects/${code}`);
  const deleted = await deleteProjectByCode(code);
  if (!deleted) {
    await logWarn("project.delete.not_found", { code });
    redirect("/");
  }

  await logInfo("project.delete.success", { code });
  revalidatePath("/");
  redirect("/");
}
