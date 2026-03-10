import "server-only";

import {
  createUserInFileStore,
  getUserByEmailFromFileStore,
  getUserByIdFromFileStore,
  getUsersFromFileStore,
  updateUserInFileStore,
} from "@/lib/user-store-file";
import {
  createUserInPostgres,
  getUserByEmailFromPostgres,
  getUserByIdFromPostgres,
  getUsersFromPostgres,
  updateUserInPostgres,
} from "@/lib/user-store-postgres";
import { NewUserInput, UserUpdateInput } from "@/lib/types";

function shouldUseDatabaseStore() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function getUsers() {
  return shouldUseDatabaseStore() ? getUsersFromPostgres() : getUsersFromFileStore();
}

export async function getUserById(id: string) {
  return shouldUseDatabaseStore() ? getUserByIdFromPostgres(id) : getUserByIdFromFileStore(id);
}

export async function getUserByEmail(email: string) {
  return shouldUseDatabaseStore() ? getUserByEmailFromPostgres(email) : getUserByEmailFromFileStore(email);
}

export async function createUser(input: NewUserInput) {
  return shouldUseDatabaseStore() ? createUserInPostgres(input) : createUserInFileStore(input);
}

export async function updateUser(id: string, updates: UserUpdateInput) {
  return shouldUseDatabaseStore() ? updateUserInPostgres(id, updates) : updateUserInFileStore(id, updates);
}
