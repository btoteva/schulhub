const { neon } = require("@neondatabase/serverless");

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureUsersTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS schulhub_users_email_key ON schulhub_users (email) WHERE email IS NOT NULL`;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS school TEXT`;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS class_name TEXT`;
}

async function findUserByUsername(sql, username) {
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name FROM schulhub_users WHERE username = ${username} LIMIT 1
  `;
  return rows[0] || null;
}

async function findUserByEmail(sql, email) {
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name FROM schulhub_users WHERE LOWER(TRIM(email)) = LOWER(TRIM(${email})) LIMIT 1
  `;
  return rows[0] || null;
}

async function findUserByUsernameOrEmail(sql, identifier) {
  const trimmed = (identifier || "").trim();
  if (!trimmed) return null;
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name FROM schulhub_users
    WHERE username = ${trimmed} OR LOWER(TRIM(email)) = LOWER(${trimmed})
    LIMIT 1
  `;
  return rows[0] || null;
}

async function createUser(sql, username, passwordHash, role = "user", email = null, school = null, className = null) {
  await sql`
    INSERT INTO schulhub_users (username, email, password_hash, role, school, class_name)
    VALUES (${username}, ${email || null}, ${passwordHash}, ${role}, ${school || null}, ${className || null})
  `;
}

async function listUsers(sql) {
  const rows = await sql`
    SELECT id, username, email, role, school, class_name, created_at FROM schulhub_users ORDER BY created_at DESC
  `;
  return rows;
}

async function updateUserRole(sql, id, role) {
  await sql`
    UPDATE schulhub_users SET role = ${role} WHERE id = ${id}
  `;
}

async function updateUserPassword(sql, id, passwordHash) {
  await sql`
    UPDATE schulhub_users SET password_hash = ${passwordHash} WHERE id = ${id}
  `;
}

async function updateUserEmail(sql, id, email) {
  await sql`
    UPDATE schulhub_users SET email = ${email} WHERE id = ${id}
  `;
}

async function updateUserSchoolClass(sql, id, school, className) {
  await sql`
    UPDATE schulhub_users SET school = ${school ?? null}, class_name = ${className ?? null} WHERE id = ${id}
  `;
}

async function deleteUser(sql, id) {
  await sql`DELETE FROM schulhub_users WHERE id = ${id}`;
}

module.exports = { getSql, ensureUsersTable, findUserByUsername, findUserByEmail, findUserByUsernameOrEmail, createUser, listUsers, updateUserRole, updateUserPassword, updateUserEmail, updateUserSchoolClass, deleteUser };
