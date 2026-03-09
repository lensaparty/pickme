import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Project } from "@/lib/types";
import { createSignedToken, decryptSecretValue, secureCompare } from "@/lib/secrets";

const ADMIN_COOKIE = "pickme_admin";
const GALLERY_COOKIE_PREFIX = "pickme_gallery_";

export function isAdminAuthEnabled() {
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

export function getAdminLoginPath(nextPath?: string) {
  const next = normalizeNextPath(nextPath);
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

export async function isAdminAuthenticated() {
  if (!isAdminAuthEnabled()) return true;

  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  return secureCompare(token, buildAdminCookieValue());
}

export async function requireAdminAccess(nextPath?: string) {
  if (await isAdminAuthenticated()) return;
  redirect(getAdminLoginPath(nextPath));
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

export async function clearAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, "", {
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

