/**
 * Recursively strips dangerous keys ($ prefix and . dots)
 * from req.body to prevent NoSQL injection.
 *
 * Note: We skip req.query because Express 5 makes it read-only.
 */

const sanitizeValue = (value) => {
  if (value === null || value === undefined) return value;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return value;

  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (typeof value === "object") {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }

  return value;
};

export const sanitizeMongo = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};
