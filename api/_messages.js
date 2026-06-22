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
 * - For non-teachers: all teachers + own linked children/parent
 * Returns an array of { username, role, profile_type, school, class_name, gender, display_name }.
 */
async function listAllowedContacts(sql, username) {
  const me = await findUserByUsername(sql, username);
  if (!me) return [];

  if (isTeacherRole(me.role)) {
    const rows = await sql`
      SELECT id, username, role, profile_type, school, class_name, gender
      FROM schulhub_users
      WHERE username <> ${me.username}
      ORDER BY
        CASE WHEN role IN ('admin','superadmin') THEN 0 ELSE 1 END,
        username
    `;
    return rows.map((r) => ({ ...r, display_name: r.username }));
  }

  const contacts = [];
  const seen = new Set();
  const teachers = await sql`
    SELECT id, username, role, profile_type, school, class_name, gender
    FROM schulhub_users
    WHERE role IN ('admin','superadmin')
    ORDER BY username
  `;
  for (const t of teachers) {
    if (!seen.has(t.username)) {
      seen.add(t.username);
      contacts.push({ ...t, display_name: t.username });
    }
  }

  const familyLinks = await sql`
    SELECT u.id, u.username, u.role, u.profile_type, u.school, u.class_name, u.gender, c.child_name
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
        role: f.role,
        profile_type: f.profile_type,
        school: f.school,
        class_name: f.class_name,
        gender: f.gender,
        display_name: f.child_name || f.username,
      });
    }
  }

  return contacts;
}

/**
 * Get the most recent message threads for a user.
 * Returns an array of { partner, last_message, last_at, unread_count, last_from_me }.
 */
async function listThreads(sql, username) {
  const rows = await sql`
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
    ORDER BY o.created_at DESC
    LIMIT 200
  `;
  return rows;
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
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM schulhub_messages
    WHERE recipient_username = ${username} AND read_at IS NULL
  `;
  return rows[0]?.n ?? 0;
}

module.exports = {
  MAX_BODY_LENGTH,
  ensureMessagesTable,
  ensurePushSubscriptionsTable,
  isTeacherRole,
  canMessage,
  listAllowedContacts,
  listThreads,
  listMessagesBetween,
  insertMessage,
  markThreadRead,
  countUnread,
};
