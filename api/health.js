const { neon } = require("@neondatabase/serverless");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    return res.status(500).json({ status: "error", message: "DATABASE_URL not set" });
  }
  try {
    const sql = neon(url);
    const r = await sql`SELECT 1 as ok`;
    res.json({ status: "ok", db: r[0]?.ok === 1 ? "connected" : "error" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
};
