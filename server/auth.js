import jwt from "jsonwebtoken";

const JWT_SECRET = (process.env.JWT_SECRET || "").trim();
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();

export function getBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (typeof auth !== "string" || !auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice(7).trim();
}

export function verifyToken(req) {
  const token = getBearerToken(req);
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function isAdmin(req) {
  const payload = verifyToken(req);
  return payload && (payload.role === "admin" || payload.role === "superadmin");
}

export function isSuperAdmin(req) {
  const payload = verifyToken(req);
  return payload && payload.role === "superadmin";
}

export function createAdminToken(username) {
  return createToken(username, "admin");
}

export function createSuperAdminToken(username) {
  return createToken(username, "superadmin");
}

export function createToken(sub, role) {
  if (!JWT_SECRET) return null;
  return jwt.sign({ sub, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function checkAdminCredentials(username, password) {
  if (!ADMIN_PASSWORD) return false;
  const u = (username || "").trim();
  const p = (password || "").trim();
  return u === ADMIN_USERNAME && p === ADMIN_PASSWORD;
}

export const hasAuthConfigured = !!JWT_SECRET && !!ADMIN_PASSWORD;
