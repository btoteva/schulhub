const { createAdminToken, checkAdminCredentials, hasAuthConfigured } = require("./_auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!hasAuthConfigured) {
    return res.status(503).json({ error: "Login not configured (set JWT_SECRET and ADMIN_PASSWORD)" });
  }
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }
  if (!checkAdminCredentials(username, password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = createAdminToken(username);
  if (!token) {
    return res.status(500).json({ error: "Could not create token" });
  }
  res.status(200).json({
    token,
    user: { username, role: "admin" },
  });
};
