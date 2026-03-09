import "server-only";

import { randomUUID } from "node:crypto";

import { encryptSecretValue, isEncryptedValue } from "@/lib/secrets";
import { NewProjectInput, Project } from "@/lib/types";
import { extractDriveFolderId, generateShareCode, normalizeShareCode } from "@/lib/project-utils";

export function storeProjectPassword(password: string) {
  if (!password) return "";
  if (isEncryptedValue(password)) return password;
  return encryptSecretValue(password);
}

export function buildProjectRecord(existingProjects: Project[], input: NewProjectInput) {
  const candidateCode = normalizeShareCode(input.clientCode || generateShareCode(input.clientName, input.name));
  let code = candidateCode;
  let suffix = 2;

  while (existingProjects.some((project) => normalizeShareCode(project.code) === code)) {
    code = normalizeShareCode(`${candidateCode}-${suffix}`);
    suffix += 1;
  }

  return {
    id: randomUUID(),
    code,
    name: input.name,
    clientName: input.clientName,
    eventType: input.eventType,
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
    selectionLimit: input.selectionLimit,
    selectedCount: 0,
    selectedIds: [],
    folderCount: 5,
    photoCount: 1284,
    driveLink: input.driveLink,
    driveFolderId: extractDriveFolderId(input.driveLink),
    whatsapp: input.whatsapp,
    status: "active" as const,
    passwordProtected: input.passwordProtected,
    password: storeProjectPassword(input.password?.trim() || ""),
    allowDownloads: input.allowDownloads,
    welcomeMessage: input.welcomeMessage,
    lastActivity: new Date().toISOString(),
  } satisfies Project;
}

