import "server-only";

import postgres from "postgres";

import { applyUserUpdates, buildUserRecord } from "@/lib/project-store-shared";
import { readUsersSnapshot } from "@/lib/user-store-file";
import { NewUserInput, User, UserUpdateInput } from "@/lib/types";

const DATABASE_URL = process.env.DATABASE_URL?.trim() || "";

const sql = postgres(DATABASE_URL, {
  max: 1,
  prepare: false,
});

let initPromise: Promise<void> | null = null;

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    role: String(row.role) as User["role"],
    isActive: Boolean(row.is_active),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function insertUser(user: User) {
  await sql`
    insert into users (
      id,
      name,
      email,
      password_hash,
      role,
      is_active,
      created_at,
      updated_at
    ) values (
      ${user.id},
      ${user.name},
      ${user.email},
      ${user.passwordHash},
      ${user.role},
      ${user.isActive},
      ${user.createdAt},
      ${user.updatedAt}
    )
    on conflict (email) do nothing
  `;
}

async function ensureDatabaseReady() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await sql`
      create table if not exists users (
        id text primary key,
        name text not null,
        email text not null unique,
        password_hash text not null,
        role text not null,
        is_active boolean not null default true,
        created_at timestamptz not null,
        updated_at timestamptz not null
      )
    `;

    const existing = await sql<{ count: string }[]>`select count(*) as count from users`;
    if (Number(existing[0]?.count || 0) > 0) return;

    const fileUsers = await readUsersSnapshot();
    for (const user of fileUsers) {
      await insertUser(user);
    }
  })();

  return initPromise;
}

export async function getUsersFromPostgres() {
  await ensureDatabaseReady();
  const rows = await sql`select * from users order by name asc`;
  return rows.map(mapUser);
}

export async function getUserByIdFromPostgres(id: string) {
  await ensureDatabaseReady();
  const rows = await sql`select * from users where id = ${id} limit 1`;
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function getUserByEmailFromPostgres(email: string) {
  await ensureDatabaseReady();
  const normalized = email.trim().toLowerCase();
  const rows = await sql`select * from users where lower(email) = ${normalized} limit 1`;
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function createUserInPostgres(input: NewUserInput) {
  await ensureDatabaseReady();
  const users = await getUsersFromPostgres();
  const user = buildUserRecord(users, input);
  await insertUser(user);
  return user;
}

export async function updateUserInPostgres(id: string, updates: UserUpdateInput) {
  await ensureDatabaseReady();
  const existing = await getUserByIdFromPostgres(id);
  if (!existing) return null;

  const nextUser = applyUserUpdates(existing, updates);
  const rows = await sql`
    update users
    set
      name = ${nextUser.name},
      password_hash = ${nextUser.passwordHash},
      is_active = ${nextUser.isActive},
      updated_at = ${nextUser.updatedAt}
    where id = ${id}
    returning *
  `;

  return rows[0] ? mapUser(rows[0]) : null;
}
