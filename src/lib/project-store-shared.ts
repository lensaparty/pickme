import "server-only";

import { randomUUID } from "node:crypto";

import { encryptSecretValue, hashPassword, isEncryptedValue, isPasswordHash } from "@/lib/secrets";
import { NewProjectInput, NewUserInput, Project, User, UserUpdateInput } from "@/lib/types";
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
    ownerUserId: input.ownerUserId,
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildUserRecord(existingUsers: User[], input: NewUserInput): User {
  const email = normalizeEmail(input.email);
  const duplicate = existingUsers.some((user) => normalizeEmail(user.email) === email);
  if (duplicate) {
    throw new Error("A user with this email already exists.");
  }

  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password.trim()),
    role: input.role || "admin",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function applyUserUpdates(existingUser: User, updates: UserUpdateInput): User {
  return {
    ...existingUser,
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
    ...(updates.password !== undefined
      ? { passwordHash: isPasswordHash(updates.password) ? updates.password : hashPassword(updates.password.trim()) }
      : {}),
    updatedAt: new Date().toISOString(),
  };
}
