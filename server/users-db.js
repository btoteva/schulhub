export async function ensureUsersTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function findUserByUsername(sql, username) {
  const rows = await sql`
    SELECT id, username, password_hash, role FROM schulhub_users WHERE username = ${username} LIMIT 1
  `;
  return rows[0] || null;
}

export async function createUser(sql, username, passwordHash, role = "user") {
  await sql`
    INSERT INTO schulhub_users (username, password_hash, role) VALUES (${username}, ${passwordHash}, ${role})
  `;
}
