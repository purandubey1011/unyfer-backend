const crypto = require("crypto");

const DEFAULT_SESSION_HOURS = 24;

const toBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const getTokenSecret = () => {
  if (process.env.ADMIN_TOKEN_SECRET) {
    return process.env.ADMIN_TOKEN_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_TOKEN_SECRET is required in production.");
  }

  return "unyfer-admin-secret";
};

const signAdminToken = ({ email }) => {
  const sessionHours = Number(process.env.ADMIN_SESSION_HOURS || DEFAULT_SESSION_HOURS);
  const exp = Math.floor(Date.now() / 1000) + sessionHours * 60 * 60;

  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      sub: "admin",
      email,
      exp,
    })
  );

  const signature = crypto
    .createHmac("sha256", getTokenSecret())
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${header}.${payload}.${signature}`;
};

const verifyAdminToken = (token) => {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "Missing token" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "Invalid token format" };
  }

  const [header, payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getTokenSecret())
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (signature !== expectedSignature) {
    return { valid: false, reason: "Invalid token signature" };
  }

  try {
    const parsedPayload = JSON.parse(fromBase64Url(payload));

    if (parsedPayload.sub !== "admin") {
      return { valid: false, reason: "Invalid token subject" };
    }

    if (!parsedPayload.exp || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: "Token expired" };
    }

    return { valid: true, payload: parsedPayload };
  } catch (error) {
    return { valid: false, reason: "Invalid token payload" };
  }
};

module.exports = {
  signAdminToken,
  verifyAdminToken,
};
