import { Photo, Project } from "@/lib/types";

export type ProjectWorkflowState =
  | "awaiting_client"
  | "in_progress"
  | "submitted"
  | "expired";

export function normalizeShareCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function generateShareCode(...parts: string[]) {
  const joined = parts
    .map((part) => normalizeShareCode(part))
    .filter(Boolean)
    .join("-");

  return normalizeShareCode(joined || `PICKME-${Date.now()}`);
}

export function extractDriveFolderId(link: string) {
  if (!link) return "";
  const patterns = [/folders\/([a-zA-Z0-9_-]+)/, /open\?id=([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/];
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

export function buildClientPath(code: string) {
  return `/client/${normalizeShareCode(code)}`;
}

export function sanitizeWhatsappNumber(number: string) {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function formatDisplayDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeActivity(value: string) {
  if (!value) return "No recent activity";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function getDaysUntilExpiry(project: Project) {
  const expiry = new Date(project.expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / 86400000);
}

export function isExpiringSoon(project: Project, withinDays = 3) {
  const days = getDaysUntilExpiry(project);
  return days !== null && days >= 0 && days <= withinDays;
}

export function deriveProjectStatus(project: Project): Project["status"] {
  const expiry = new Date(project.expiresAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!Number.isNaN(expiry.getTime()) && expiry < today) {
    return "expired";
  }
  return project.status || "active";
}

export function getProjectWorkflowState(project: Project): ProjectWorkflowState {
  const status = deriveProjectStatus(project);
  if (status === "expired") return "expired";
  if (status === "awaiting" || project.selectedCount >= project.selectionLimit) return "submitted";
  if (project.selectedCount > 0) return "in_progress";
  return "awaiting_client";
}

export function getProjectWorkflowLabel(state: ProjectWorkflowState) {
  switch (state) {
    case "awaiting_client":
      return "Awaiting client action";
    case "in_progress":
      return "Client selecting";
    case "submitted":
      return "Submitted";
    case "expired":
      return "Expired";
  }
}

export function getProjectWorkflowHint(project: Project) {
  const state = getProjectWorkflowState(project);
  switch (state) {
    case "awaiting_client":
      return "Client has not started the shortlist yet.";
    case "in_progress":
      return `${project.selectedCount} photos chosen so far. Waiting for final send.`;
    case "submitted":
      return `Shortlist received with ${project.selectedCount} selected photos.`;
    case "expired":
      return "This link is no longer active and needs admin attention.";
  }
}

export function getProjectPrimaryActionLabel(project: Project) {
  const state = getProjectWorkflowState(project);
  switch (state) {
    case "awaiting_client":
      return "Open client link";
    case "in_progress":
      return "Continue review";
    case "submitted":
      return "Review submission";
    case "expired":
      return "Manage project";
  }
}

export function getProjectSecondaryActionLabel(project: Project) {
  const state = getProjectWorkflowState(project);
  switch (state) {
    case "awaiting_client":
      return "Preview gallery";
    case "in_progress":
      return "Preview gallery";
    case "submitted":
      return "Preview gallery";
    case "expired":
      return "Preview gallery";
  }
}

export function buildProjectInviteMessage(project: Project, clientLink: string) {
  return [
    `Hi ${project.clientName},`,
    "",
    `Your PickMe gallery is ready: ${project.name}`,
    `Open here: ${clientLink}`,
    `Selection limit: ${project.selectionLimit} photos`,
    `Expires: ${formatDisplayDate(project.expiresAt)}`,
    project.passwordProtected ? "Password protected. Share the gallery password separately." : "No password required.",
    "",
    "Please review the gallery and send your final selection through the built-in WhatsApp handoff.",
  ].join("\n");
}

export function buildProjectInviteUrl(project: Project, clientLink: string) {
  const text = encodeURIComponent(buildProjectInviteMessage(project, clientLink));
  return `https://wa.me/${sanitizeWhatsappNumber(project.whatsapp)}?text=${text}`;
}

export function buildWhatsAppSelectionMessage(project: Project, photos: Photo[]) {
  const lines = [
    `Halo admin, berikut pilihan final dari ${project.clientName}.`,
    "",
    `Project: ${project.name}`,
    `Code: ${project.code}`,
    `Selected: ${photos.length}/${project.selectionLimit} photos`,
    `Drive: ${project.driveLink}`,
    "",
    "Photo shortlist:",
  ];

  photos.forEach((photo, index) => {
    lines.push(`${index + 1}. ${photo.id} - ${photo.title}`);
  });

  lines.push("", "Dikirim dari PickMe.");
  return lines.join("\n");
}

export function buildWhatsAppUrl(project: Project, photos: Photo[]) {
  const phone = sanitizeWhatsappNumber(project.whatsapp);
  const text = encodeURIComponent(buildWhatsAppSelectionMessage(project, photos));
  return `https://wa.me/${phone}?text=${text}`;
}
