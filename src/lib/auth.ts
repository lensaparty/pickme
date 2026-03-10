import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Project, AuthActor, User } from "@/lib/types";
import { createSignedToken, decryptSecretValue, secureCompare, verifyPasswordHash } from "@/lib/secrets";
import { getUserById } from "@/lib/user-store";

const ADMIN_COOKIE = "pickme_admin";
const USER_COOKIE = "pickme_user";
const GALLERY_COOKIE_PREFIX = "pickme_gallery_";

export function isSuperAdminAuthEnabled() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

function normalizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/")) return "/";
  return nextPath;
}

function buildAdminCookieValue() {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "";
  return createSignedToken("admin", adminPassword);
}

function buildUserCookieValue(user: User) {
  const signature = createSignedToken("user", `${user.id}:${user.passwordHash}`);
  return `${user.id}.${signature}`;
}

function parseUserCookieValue(value: string) {
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;
  return { userId, signature };
}

export function getAdminLoginPath(nextPath?: string) {
  const next = normalizeNextPath(nextPath);
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

export async function isSuperAdminAuthenticated() {
  if (!isSuperAdminAuthEnabled()) return false;

  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  return secureCompare(token, buildAdminCookieValue());
}

export async function getAuthenticatedAdminUser() {
  const cookieValue = (await cookies()).get(USER_COOKIE)?.value || "";
  const parsed = parseUserCookieValue(cookieValue);
  if (!parsed) return null;

  const user = await getUserById(parsed.userId);
  if (!user || !user.isActive) return null;

  const expected = buildUserCookieValue(user);
  return secureCompare(cookieValue, expected) ? user : null;
}

export async function isAdminAuthenticated() {
  return Boolean((await getAuthActor()) !== null);
}

export async function getAuthActor(): Promise<AuthActor | null> {
  if (!isSuperAdminAuthEnabled() && process.env.NODE_ENV !== "production") {
    return {
      kind: "super_admin",
      id: "super_admin",
      name: "Super admin",
      email: "",
    };
  }

  if (await isSuperAdminAuthenticated()) {
    return {
      kind: "super_admin",
      id: "super_admin",
      name: "Super admin",
      email: "",
    };
  }

  const user = await getAuthenticatedAdminUser();
  if (!user) return null;

  return {
    kind: "admin",
    id: user.id,
    name: user.name,
    email: user.email,
    user,
  };
}

export async function requireAdminAccess(nextPath?: string) {
  const actor = await getAuthActor();
  if (actor) return actor;
  redirect(getAdminLoginPath(nextPath));
}

export async function requireSuperAdminAccess(nextPath?: string) {
  const actor = await requireAdminAccess(nextPath);
  if (actor.kind === "super_admin") return actor;
  redirect("/");
}

export async function createAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, buildAdminCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function createUserSession(user: User) {
  (await cookies()).set(USER_COOKIE, buildUserCookieValue(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function clearUserSession() {
  (await cookies()).set(USER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export function verifyAdminPassword(input: string) {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "";
  if (!adminPassword) return false;
  return secureCompare(input, adminPassword);
}

export function verifyUserPassword(input: string, user: User) {
  return verifyPasswordHash(input, user.passwordHash);
}

function getGalleryCookieName(code: string) {
  return `${GALLERY_COOKIE_PREFIX}${code}`;
}

function getGalleryCookieValue(project: Project) {
  return createSignedToken("gallery", `${project.code}:${project.password}`);
}

export async function grantGalleryAccess(project: Project) {
  const expiresAt = new Date(project.expiresAt);
  const fallbackExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiry = Number.isNaN(expiresAt.getTime()) ? fallbackExpiry : expiresAt;

  (await cookies()).set(getGalleryCookieName(project.code), getGalleryCookieValue(project), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/client/${project.code}`,
    expires: expiry,
  });
}

export async function hasGalleryAccess(project: Project) {
  if (!project.passwordProtected) return true;

  const token = (await cookies()).get(getGalleryCookieName(project.code))?.value || "";
  return secureCompare(token, getGalleryCookieValue(project));
}

export async function requireGalleryAccess(project: Project) {
  if (await hasGalleryAccess(project)) return;
  redirect(`/client/${project.code}/password`);
}

export function readProjectPassword(project: Project) {
  return decryptSecretValue(project.password);
}

export function canAccessProject(actor: AuthActor, project: Project) {
  if (actor.kind === "super_admin") return true;
  return Boolean(project.ownerUserId && project.ownerUserId === actor.user.id);
}

export function getActorLabel(actor: AuthActor) {
  return actor.kind === "super_admin" ? "Super admin" : actor.user.name;
}
