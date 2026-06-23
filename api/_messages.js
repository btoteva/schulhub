const { findUserByUsername } = require("./_users");

const MAX_BODY_LENGTH = 4000;

async function ensureMessagesTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_messages (
      id BIGSERIAL PRIMARY KEY,
      sender_username TEXT NOT NULL,
      recipient_username TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      read_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS schulhub_messages_recipient_idx
      ON schulhub_messages (recipient_username, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS schulhub_messages_sender_idx
      ON schulhub_messages (sender_username, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS schulhub_messages_thread_idx
      ON schulhub_messages (
        LEAST(sender_username, recipient_username),
        GREATEST(sender_username, recipient_username),
        created_at DESC
      )
  `;
}

async function ensurePushSubscriptionsTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_push_subscriptions (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS schulhub_push_subs_user_idx
      ON schulhub_push_subscriptions (username)
  `;
}

async function ensureSpacesTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_spaces (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_space_members (
      space_id BIGINT NOT NULL REFERENCES schulhub_spaces(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (space_id, username)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS schulhub_space_members_user_idx
      ON schulhub_space_members (username)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_space_messages (
      id BIGSERIAL PRIMARY KEY,
      space_id BIGINT NOT NULL REFERENCES schulhub_spaces(id) ON DELETE CASCADE,
      sender_username TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS schulhub_space_messages_space_idx
      ON schulhub_space_messages (space_id, created_at ASC)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_space_read_cursors (
      space_id BIGINT NOT NULL REFERENCES schulhub_spaces(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      last_read_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (space_id, username)
    )
  `;
}

function isTeacherRole(role) {
  return role === "admin" || role === "superadmin";
}

/**
 * Permission check: can `sender` send a message to `recipient`?
 * Rules:
 *   - Either party is a teacher (admin/superadmin) -> allowed
 *   - Parent <-> own linked child (via schulhub_user_children.student_username) -> allowed
 *   - Otherwise -> denied
 *
 * Returns { allowed: boolean, reason?: string, sender?, recipient? }.
 */
async function canMessage(sql, senderUsername, recipientUsername) {
  const senderName = (senderUsername || "").trim();
  const recipientName = (recipientUsername || "").trim();
  if (!senderName || !recipientName) {
    return { allowed: false, reason: "missing-username" };
  }
  if (senderName.toLowerCase() === recipientName.toLowerCase()) {
    return { allowed: false, reason: "self-message" };
  }
  const [sender, recipient] = await Promise.all([
    findUserByUsername(sql, senderName),
    findUserByUsername(sql, recipientName),
  ]);
  if (!sender) return { allowed: false, reason: "sender-not-found" };
  if (!recipient) return { allowed: false, reason: "recipient-not-found" };

  if (isTeacherRole(sender.role) || isTeacherRole(recipient.role)) {
    return { allowed: true, sender, recipient, scope: "teacher" };
  }

  const rows = await sql`
    SELECT 1 FROM schulhub_user_children
    WHERE (parent_username = ${sender.username} AND student_username = ${recipient.username})
       OR (parent_username = ${recipient.username} AND student_username = ${sender.username})
    LIMIT 1
  `;
  if (rows.length > 0) {
    return { allowed: true, sender, recipient, scope: "family" };
  }

  return { allowed: false, reason: "not-allowed", sender, recipient };
}

/**
 * List the users the given username is allowed to message.
 * - For teachers: all non-self users
 * - For non-teachers: family links + users you can still message (incl. existing threads)
 * Returns an array of { username, role, profile_type, school, class_name, gender, display_name }.
 */
async function listAllowedContacts(sql, username) {
  const me = await findUserByUsername(sql, username);
  if (!me) return [];

  if (isTeacherRole(me.role)) {
    const rows = await sql`
      SELECT id, username, email, role, profile_type, school, class_name, gender
      FROM schulhub_users
      WHERE username <> ${me.username}
      ORDER BY username
    `;
    return rows.map((r) => ({ ...r, display_name: r.username }));
  }

  const contacts = [];
  const seen = new Set();

  const familyLinks = await sql`
    SELECT u.id, u.username, u.email, u.role, u.profile_type, u.school, u.class_name, u.gender, c.child_name
    FROM schulhub_user_children c
    JOIN schulhub_users u ON (
      (c.parent_username = ${me.username} AND u.username = c.student_username) OR
      (c.student_username = ${me.username} AND u.username = c.parent_username)
    )
    WHERE u.username <> ${me.username}
  `;
  for (const f of familyLinks) {
    if (!seen.has(f.username)) {
      seen.add(f.username);
      contacts.push({
        id: f.id,
        username: f.username,
        email: f.email,
        role: f.role,
        profile_type: f.profile_type,
        school: f.school,
        class_name: f.class_name,
        gender: f.gender,
        display_name: f.child_name || f.username,
      });
    }
  }

  const partnerRows = await sql`
    SELECT DISTINCT
      CASE WHEN sender_username = ${me.username} THEN recipient_username ELSE sender_username END AS partner
    FROM schulhub_messages
    WHERE sender_username = ${me.username} OR recipient_username = ${me.username}
  `;
  for (const row of partnerRows) {
    const partner = (row.partner || "").trim();
    if (!partner || seen.has(partner)) continue;
    const perm = await canMessage(sql, me.username, partner);
    if (!perm.allowed) continue;
    const other = perm.sender.username === me.username ? perm.recipient : perm.sender;
    seen.add(partner);
    contacts.push({
      id: other.id,
      username: other.username,
      email: other.email,
      role: other.role,
      profile_type: other.profile_type,
      school: other.school,
      class_name: other.class_name,
      gender: other.gender,
      display_name: other.username,
    });
  }

  return contacts;
}

/** Search allowed contacts by email, username or display name (for space invites). */
async function searchAllowedContacts(sql, username, query) {
  const q = (query || "").trim().toLowerCase();
  const all = await listAllowedContacts(sql, username);
  if (!q) return all.slice(0, 20);
  return all
    .filter((c) => {
      const email = (c.email || "").toLowerCase();
      const uname = (c.username || "").toLowerCase();
      const name = (c.display_name || "").toLowerCase();
      return email.includes(q) || uname.includes(q) || name.includes(q);
    })
    .slice(0, 20);
}

async function isSpaceMember(sql, spaceId, username) {
  const rows = await sql`
    SELECT 1 FROM schulhub_space_members
    WHERE space_id = ${spaceId} AND username = ${username}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function getSpaceForMember(sql, spaceId, username) {
  const rows = await sql`
    SELECT s.id, s.name, s.created_by, s.created_at
    FROM schulhub_spaces s
    JOIN schulhub_space_members m ON m.space_id = s.id AND m.username = ${username}
    WHERE s.id = ${spaceId}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function listSpaceMembers(sql, spaceId) {
  const rows = await sql`
    SELECT u.username, u.email, u.profile_type, u.gender,
           COALESCE(c.child_name, u.username) AS display_name
    FROM schulhub_space_members m
    JOIN schulhub_users u ON u.username = m.username
    LEFT JOIN schulhub_user_children c ON c.student_username = u.username
    WHERE m.space_id = ${spaceId}
    ORDER BY m.joined_at ASC
  `;
  return rows;
}

async function createSpace(sql, creatorUsername, name, memberUsernames) {
  const spaceName = (name || "").trim();
  if (!spaceName) return { error: "name required" };
  const allowed = await listAllowedContacts(sql, creatorUsername);
  const allowedSet = new Set(allowed.map((c) => c.username));
  const members = new Set([creatorUsername]);
  for (const u of memberUsernames || []) {
    const trimmed = String(u || "").trim();
    if (!trimmed || trimmed === creatorUsername) continue;
    if (!allowedSet.has(trimmed)) {
      return { error: "not-allowed", username: trimmed };
    }
    members.add(trimmed);
  }
  if (members.size < 2) {
    return { error: "members required" };
  }
  const spaceRows = await sql`
    INSERT INTO schulhub_spaces (name, created_by)
    VALUES (${spaceName}, ${creatorUsername})
    RETURNING id, name, created_by, created_at
  `;
  const space = spaceRows[0];
  for (const username of members) {
    await sql`
      INSERT INTO schulhub_space_members (space_id, username)
      VALUES (${space.id}, ${username})
    `;
    await sql`
      INSERT INTO schulhub_space_read_cursors (space_id, username, last_read_at)
      VALUES (${space.id}, ${username}, NOW())
      ON CONFLICT (space_id, username) DO NOTHING
    `;
  }
  return { space, member_count: members.size };
}

async function listSpaceThreads(sql, username) {
  const rows = await sql`
    WITH latest AS (
      SELECT DISTINCT ON (m.space_id)
        m.space_id,
        m.body AS last_message,
        m.created_at AS last_at,
        m.sender_username AS last_sender
      FROM schulhub_space_messages m
      JOIN schulhub_space_members mem ON mem.space_id = m.space_id AND mem.username = ${username}
      ORDER BY m.space_id, m.created_at DESC
    ),
    unread AS (
      SELECT m.space_id, COUNT(*)::int AS unread_count
      FROM schulhub_space_messages m
      JOIN schulhub_space_members mem ON mem.space_id = m.space_id AND mem.username = ${username}
      LEFT JOIN schulhub_space_read_cursors c
        ON c.space_id = m.space_id AND c.username = ${username}
      WHERE m.sender_username <> ${username}
        AND m.created_at > COALESCE(c.last_read_at, '1970-01-01'::timestamptz)
      GROUP BY m.space_id
    )
    SELECT
      s.id AS space_id,
      s.name AS space_name,
      s.created_at,
      l.last_message,
      l.last_at,
      (l.last_sender = ${username}) AS last_from_me,
      COALESCE(u.unread_count, 0) AS unread_count
    FROM schulhub_spaces s
    JOIN schulhub_space_members mem ON mem.space_id = s.id AND mem.username = ${username}
    LEFT JOIN latest l ON l.space_id = s.id
    LEFT JOIN unread u ON u.space_id = s.id
    ORDER BY COALESCE(l.last_at, s.created_at) DESC
    LIMIT 200
  `;
  return rows;
}

async function listSpaceMessages(sql, spaceId, limit = 200) {
  const rows = await sql`
    SELECT id, space_id, sender_username, body, created_at
    FROM schulhub_space_messages
    WHERE space_id = ${spaceId}
    ORDER BY created_at ASC
    LIMIT ${Math.min(Math.max(parseInt(limit, 10) || 200, 1), 500)}
  `;
  return rows;
}

async function insertSpaceMessage(sql, spaceId, senderUsername, body) {
  const trimmed = (body || "").trim();
  if (!trimmed) return null;
  const truncated = trimmed.length > MAX_BODY_LENGTH ? trimmed.slice(0, MAX_BODY_LENGTH) : trimmed;
  const rows = await sql`
    INSERT INTO schulhub_space_messages (space_id, sender_username, body)
    VALUES (${spaceId}, ${senderUsername}, ${truncated})
    RETURNING id, space_id, sender_username, body, created_at
  `;
  return rows[0] || null;
}

async function markSpaceRead(sql, spaceId, username) {
  await sql`
    INSERT INTO schulhub_space_read_cursors (space_id, username, last_read_at)
    VALUES (${spaceId}, ${username}, NOW())
    ON CONFLICT (space_id, username) DO UPDATE SET last_read_at = NOW()
  `;
}

async function countSpaceUnread(sql, username) {
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM schulhub_space_messages m
    JOIN schulhub_space_members mem ON mem.space_id = m.space_id AND mem.username = ${username}
    LEFT JOIN schulhub_space_read_cursors c
      ON c.space_id = m.space_id AND c.username = ${username}
    WHERE m.sender_username <> ${username}
      AND m.created_at > COALESCE(c.last_read_at, '1970-01-01'::timestamptz)
  `;
  return rows[0]?.n ?? 0;
}

async function listSpaceMemberUsernames(sql, spaceId, excludeUsername) {
  const rows = await sql`
    SELECT username FROM schulhub_space_members
    WHERE space_id = ${spaceId} AND username <> ${excludeUsername}
  `;
  return rows.map((r) => r.username);
}

/**
 * Get the most recent message threads for a user.
 * Returns an array of { partner, last_message, last_at, unread_count, last_from_me }.
 */
async function listThreads(sql, username) {
  await ensureSpacesTables(sql);
  const [directRows, spaceRows] = await Promise.all([
    sql`
      WITH ordered AS (
        SELECT
          id,
          sender_username,
          recipient_username,
          body,
          created_at,
          read_at,
          CASE WHEN sender_username = ${username} THEN recipient_username ELSE sender_username END AS partner,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN sender_username = ${username} THEN recipient_username ELSE sender_username END
            ORDER BY created_at DESC
          ) AS rn
        FROM schulhub_messages
        WHERE sender_username = ${username} OR recipient_username = ${username}
      ),
      unread AS (
        SELECT sender_username AS partner, COUNT(*)::int AS unread_count
        FROM schulhub_messages
        WHERE recipient_username = ${username} AND read_at IS NULL
        GROUP BY sender_username
      )
      SELECT
        o.partner,
        o.body AS last_message,
        o.created_at AS last_at,
        (o.sender_username = ${username}) AS last_from_me,
        COALESCE(u.unread_count, 0) AS unread_count
      FROM ordered o
      LEFT JOIN unread u ON u.partner = o.partner
      WHERE o.rn = 1
    `,
    listSpaceThreads(sql, username),
  ]);

  const direct = directRows.map((r) => ({
    type: "direct",
    partner: r.partner,
    space_id: null,
    space_name: null,
    last_message: r.last_message,
    last_at: r.last_at,
    last_from_me: !!r.last_from_me,
    unread_count: r.unread_count || 0,
  }));

  const spaces = spaceRows.map((r) => ({
    type: "space",
    partner: null,
    space_id: String(r.space_id),
    space_name: r.space_name,
    last_message: r.last_message || "",
    last_at: r.last_at || r.created_at,
    last_from_me: !!r.last_from_me,
    unread_count: r.unread_count || 0,
  }));

  return [...direct, ...spaces]
    .sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime())
    .slice(0, 200);
}

async function listMessagesBetween(sql, userA, userB, limit = 200) {
  const rows = await sql`
    SELECT id, sender_username, recipient_username, body, created_at, read_at
    FROM schulhub_messages
    WHERE (sender_username = ${userA} AND recipient_username = ${userB})
       OR (sender_username = ${userB} AND recipient_username = ${userA})
    ORDER BY created_at ASC
    LIMIT ${Math.min(Math.max(parseInt(limit, 10) || 200, 1), 500)}
  `;
  return rows;
}

async function insertMessage(sql, senderUsername, recipientUsername, body) {
  const trimmed = (body || "").trim();
  if (!trimmed) return null;
  const truncated = trimmed.length > MAX_BODY_LENGTH ? trimmed.slice(0, MAX_BODY_LENGTH) : trimmed;
  const rows = await sql`
    INSERT INTO schulhub_messages (sender_username, recipient_username, body)
    VALUES (${senderUsername}, ${recipientUsername}, ${truncated})
    RETURNING id, sender_username, recipient_username, body, created_at, read_at
  `;
  return rows[0] || null;
}

async function markThreadRead(sql, ownerUsername, partnerUsername) {
  const result = await sql`
    UPDATE schulhub_messages
    SET read_at = NOW()
    WHERE recipient_username = ${ownerUsername}
      AND sender_username = ${partnerUsername}
      AND read_at IS NULL
    RETURNING id
  `;
  return result.length;
}

async function countUnread(sql, username) {
  await ensureSpacesTables(sql);
  const [directRows, spaceN] = await Promise.all([
    sql`
      SELECT COUNT(*)::int AS n
      FROM schulhub_messages
      WHERE recipient_username = ${username} AND read_at IS NULL
    `,
    countSpaceUnread(sql, username),
  ]);
  return (directRows[0]?.n ?? 0) + (spaceN || 0);
}

module.exports = {
  MAX_BODY_LENGTH,
  ensureMessagesTable,
  ensurePushSubscriptionsTable,
  ensureSpacesTables,
  isTeacherRole,
  canMessage,
  listAllowedContacts,
  searchAllowedContacts,
  createSpace,
  getSpaceForMember,
  listSpaceMembers,
  isSpaceMember,
  listSpaceMessages,
  insertSpaceMessage,
  markSpaceRead,
  listSpaceMemberUsernames,
  listThreads,
  listMessagesBetween,
  insertMessage,
  markThreadRead,
  countUnread,
};
