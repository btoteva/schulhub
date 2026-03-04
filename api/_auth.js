const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function getBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (typeof auth !== "string" || !auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice(7).trim();
}

function verifyToken(req) {
  const token = getBearerToken(req);
  if (!token || !JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

function isAdmin(req) {
  const payload = verifyToken(req);
  return payload && payload.role === "admin";
}

function createAdminToken(username) {
  if (!JWT_SECRET) return null;
  return jwt.sign(
    { sub: username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function checkAdminCredentials(username, password) {
  if (!ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

module.exports = {
  getBearerToken,
  verifyToken,
  isAdmin,
  createAdminToken,
  checkAdminCredentials,
  hasAuthConfigured: !!JWT_SECRET && !!ADMIN_PASSWORD,
};
