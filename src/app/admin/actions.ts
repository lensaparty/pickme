"use server";

import { redirect } from "next/navigation";

import { clearAdminSession, createAdminSession, getAdminLoginPath, verifyAdminPassword } from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/logger";

export type AdminLoginState = {
  error?: string;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function loginAdminAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = readString(formData, "password");
  const nextPath = readString(formData, "next") || "/";

  if (!verifyAdminPassword(password)) {
    await logWarn("admin.login.failed", { reason: "invalid_password" });
    return { error: "That admin password is not correct." };
  }

  await createAdminSession();
  await logInfo("admin.login.success", { nextPath });
  redirect(nextPath.startsWith("/") ? nextPath : "/");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  await logInfo("admin.logout.success");
  redirect(getAdminLoginPath("/"));
}
