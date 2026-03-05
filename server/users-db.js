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
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS schulhub_users_email_key ON schulhub_users (email) WHERE email IS NOT NULL`;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS school TEXT`;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS class_name TEXT`;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS profile_type TEXT`;
  await sql`ALTER TABLE schulhub_users ADD COLUMN IF NOT EXISTS gender TEXT`;
}

export async function ensureUserChildrenTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_user_children (
      id SERIAL PRIMARY KEY,
      parent_username TEXT NOT NULL,
      child_name TEXT NOT NULL,
      school TEXT NOT NULL,
      class_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE schulhub_user_children ADD COLUMN IF NOT EXISTS student_username TEXT`;
  await sql`ALTER TABLE schulhub_user_children ALTER COLUMN school DROP NOT NULL`;
  await sql`ALTER TABLE schulhub_user_children ALTER COLUMN class_name DROP NOT NULL`;
}

export async function findUserById(sql, id) {
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name, profile_type, gender FROM schulhub_users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

export async function findUserByUsername(sql, username) {
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name, profile_type, gender FROM schulhub_users WHERE username = ${username} LIMIT 1
  `;
  return rows[0] || null;
}

export async function findUserByEmail(sql, email) {
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name, profile_type, gender FROM schulhub_users WHERE LOWER(TRIM(email)) = LOWER(TRIM(${email})) LIMIT 1
  `;
  return rows[0] || null;
}

export async function findUserByUsernameOrEmail(sql, identifier) {
  const trimmed = (identifier || "").trim();
  if (!trimmed) return null;
  const rows = await sql`
    SELECT id, username, email, password_hash, role, school, class_name, profile_type, gender FROM schulhub_users
    WHERE username = ${trimmed} OR LOWER(TRIM(email)) = LOWER(${trimmed})
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createUser(sql, username, passwordHash, role = "user", email = null, school = null, className = null, profileType = null, gender = null) {
  await sql`
    INSERT INTO schulhub_users (username, email, password_hash, role, school, class_name, profile_type, gender)
    VALUES (${username}, ${email || null}, ${passwordHash}, ${role}, ${school || null}, ${className || null}, ${profileType ?? null}, ${gender ?? null})
  `;
}

export async function listUsers(sql) {
  const rows = await sql`
    SELECT id, username, email, role, school, class_name, profile_type, gender, created_at FROM schulhub_users ORDER BY created_at DESC
  `;
  return rows;
}

export async function updateUserRole(sql, id, role) {
  await sql`
    UPDATE schulhub_users SET role = ${role} WHERE id = ${id}
  `;
}

export async function updateUserPassword(sql, id, passwordHash) {
  await sql`
    UPDATE schulhub_users SET password_hash = ${passwordHash} WHERE id = ${id}
  `;
}

export async function updateUserEmail(sql, id, email) {
  await sql`
    UPDATE schulhub_users SET email = ${email} WHERE id = ${id}
  `;
}

export async function updateUserSchoolClass(sql, id, school, className) {
  await sql`
    UPDATE schulhub_users SET school = ${school ?? null}, class_name = ${className ?? null} WHERE id = ${id}
  `;
}

export async function updateUserProfileType(sql, id, profileType) {
  await sql`
    UPDATE schulhub_users SET profile_type = ${profileType ?? null} WHERE id = ${id}
  `;
}

export async function updateUserGender(sql, id, gender) {
  await sql`
    UPDATE schulhub_users SET gender = ${gender ?? null} WHERE id = ${id}
  `;
}

export async function listUserChildren(sql, parentUsername) {
  const rows = await sql`
    SELECT id, child_name, school, class_name, student_username, created_at FROM schulhub_user_children
    WHERE parent_username = ${parentUsername}
    ORDER BY created_at DESC
  `;
  return rows;
}

export async function addUserChild(sql, parentUsername, childName, school, className, studentUsername = null) {
  const rows = await sql`
    INSERT INTO schulhub_user_children (parent_username, child_name, school, class_name, student_username)
    VALUES (${parentUsername}, ${childName}, ${school}, ${className}, ${studentUsername || null})
    RETURNING id, child_name, school, class_name, student_username, created_at
  `;
  return rows[0];
}

export async function getParentInfoForStudent(sql, studentUsername) {
  const trimmed = (studentUsername || "").trim();
  if (!trimmed) return null;
  const rows = await sql`
    SELECT c.parent_username, u.gender
    FROM schulhub_user_children c
    JOIN schulhub_users u ON u.username = c.parent_username
    WHERE c.student_username = ${trimmed}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return { parent_username: rows[0].parent_username, parent_gender: rows[0].gender ?? null };
}

export async function getUserChild(sql, id, parentUsername) {
  const rows = await sql`
    SELECT id, child_name, school, class_name, student_username FROM schulhub_user_children
    WHERE id = ${id} AND parent_username = ${parentUsername}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function updateUserChild(sql, id, parentUsername, childName, school, className, studentUsername = undefined) {
  if (studentUsername !== undefined) {
    await sql`
      UPDATE schulhub_user_children
      SET child_name = ${childName}, school = ${school}, class_name = ${className}, student_username = ${studentUsername || null}
      WHERE id = ${id} AND parent_username = ${parentUsername}
    `;
  } else {
    await sql`
      UPDATE schulhub_user_children
      SET child_name = ${childName}, school = ${school}, class_name = ${className}
      WHERE id = ${id} AND parent_username = ${parentUsername}
    `;
  }
}

export async function deleteUserChild(sql, id, parentUsername) {
  await sql`
    DELETE FROM schulhub_user_children WHERE id = ${id} AND parent_username = ${parentUsername}
  `;
}

export async function deleteUser(sql, id) {
  await sql`DELETE FROM schulhub_users WHERE id = ${id}`;
}
