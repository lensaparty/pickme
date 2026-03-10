"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  clearUserSession,
  createAdminSession,
  createUserSession,
  getAdminLoginPath,
  requireSuperAdminAccess,
  verifyAdminPassword,
  verifyUserPassword,
} from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/logger";
import { createUser, getUserByEmail, updateUser } from "@/lib/user-store";

export type AdminLoginState = {
  error?: string;
};

export type AdminUserState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function loginWorkspaceAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const mode = readString(formData, "mode") || "account";
  const nextPath = readString(formData, "next") || "/";

  await clearAdminSession();
  await clearUserSession();

  if (mode === "super_admin") {
    const password = readString(formData, "password");
    if (!verifyAdminPassword(password)) {
      await logWarn("admin.login.failed", { mode, reason: "invalid_password" });
      return { error: "Super admin password tidak cocok." };
    }

    await createAdminSession();
    await logInfo("admin.login.success", { mode: "super_admin", nextPath });
    redirect(nextPath.startsWith("/") ? nextPath : "/");
  }

  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  if (!email || !password) {
    return { error: "Masukkan email dan password admin." };
  }

  const user = await getUserByEmail(email);
  if (!user || !user.isActive || !verifyUserPassword(password, user)) {
    await logWarn("admin.login.failed", { mode: "account", email, reason: "invalid_credentials" });
    return { error: "Email atau password admin tidak cocok." };
  }

  await createUserSession(user);
  await logInfo("admin.login.success", { mode: "account", email: user.email, nextPath });
  redirect(nextPath.startsWith("/") ? nextPath : "/");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  await clearUserSession();
  await logInfo("admin.logout.success");
  redirect(getAdminLoginPath("/"));
}

export async function createAdminUserAction(
  _prevState: AdminUserState,
  formData: FormData,
): Promise<AdminUserState> {
  await requireSuperAdminAccess("/admin/users");

  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  if (!name || !email || !password) {
    return { error: "Nama, email, dan password admin wajib diisi." };
  }

  try {
    const user = await createUser({ name, email, password, role: "admin" });
    await logInfo("admin.user.create.success", { userId: user.id, email: user.email });
    revalidatePath("/admin/users");
    return { success: "Admin baru berhasil dibuat." };
  } catch (error) {
    await logWarn("admin.user.create.failed", { email, message: error instanceof Error ? error.message : "Unknown error" });
    return { error: error instanceof Error ? error.message : "Admin baru belum bisa dibuat." };
  }
}

export async function toggleAdminUserStatusAction(userId: string, makeActive: boolean) {
  await requireSuperAdminAccess("/admin/users");
  const user = await updateUser(userId, { isActive: makeActive });
  if (!user) {
    await logWarn("admin.user.toggle.not_found", { userId, makeActive });
    return;
  }

  await logInfo("admin.user.toggle.success", { userId, isActive: user.isActive });
  revalidatePath("/admin/users");
}

export async function resetAdminUserPasswordAction(
  userId: string,
  _prevState: AdminUserState,
  formData: FormData,
): Promise<AdminUserState> {
  await requireSuperAdminAccess("/admin/users");
  const password = readString(formData, "password");

  if (!password) {
    return { error: "Password baru wajib diisi." };
  }

  const user = await updateUser(userId, { password });
  if (!user) {
    await logWarn("admin.user.password.not_found", { userId });
    return { error: "Admin tidak ditemukan." };
  }

  await logInfo("admin.user.password.success", { userId });
  revalidatePath("/admin/users");
  return { success: "Password admin berhasil direset." };
}
