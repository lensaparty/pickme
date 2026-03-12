import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { applyUserUpdates, buildUserRecord } from "@/lib/project-store-shared";
import { NewUserInput, User, UserUpdateInput } from "@/lib/types";

const dataDir = process.env.PICKME_DATA_DIR?.trim()
  ? path.resolve(process.env.PICKME_DATA_DIR)
  : path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function ensureUsersFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(usersFile, "utf8");
  } catch {
    await writeFile(usersFile, "[]\n", "utf8");
  }
}

async function writeUsers(users: User[]) {
  await ensureUsersFile();
  const tempFile = `${usersFile}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await rename(tempFile, usersFile);
}

export async function readUsersSnapshot(): Promise<User[]> {
  try {
    const raw = await readFile(usersFile, "utf8");
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export async function readUsersFromFileStore(): Promise<User[]> {
  await ensureUsersFile();
  const raw = await readFile(usersFile, "utf8");
  return JSON.parse(raw) as User[];
}

export async function getUsersFromFileStore() {
  const users = await readUsersFromFileStore();
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getUserByIdFromFileStore(id: string) {
  const users = await readUsersFromFileStore();
  return users.find((user) => user.id === id) ?? null;
}

export async function getUserByEmailFromFileStore(email: string) {
  const normalized = email.trim().toLowerCase();
  const users = await readUsersFromFileStore();
  return users.find((user) => user.email.trim().toLowerCase() === normalized) ?? null;
}

export async function createUserInFileStore(input: NewUserInput) {
  const users = await readUsersFromFileStore();
  const user = buildUserRecord(users, input);
  users.unshift(user);
  await writeUsers(users);
  return user;
}

export async function updateUserInFileStore(id: string, updates: UserUpdateInput) {
  const users = await readUsersFromFileStore();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) return null;

  users[index] = applyUserUpdates(users[index], updates);
  await writeUsers(users);
  return users[index];
}
