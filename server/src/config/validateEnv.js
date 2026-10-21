/**
 * Validates required environment variables at startup.
 * If any is missing or too short, the process exits with a clear error.
 */

const REQUIRED = [
  { key: "PORT", minLength: 2 },
  { key: "MONGO_URI", minLength: 10 },
  { key: "JWT_SECRET", minLength: 32 },
  { key: "CLIENT_URL", minLength: 10 },
];

export const validateEnv = () => {
  const missing = [];
  const tooShort = [];

  for (const { key, minLength } of REQUIRED) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else if (value.length < minLength) {
      tooShort.push(`${key} (min ${minLength} chars, got ${value.length})`);
    }
  }

  if (missing.length || tooShort.length) {
    console.error("\n❌ ENVIRONMENT VALIDATION FAILED\n");
    if (missing.length) console.error("Missing:", missing.join(", "));
    if (tooShort.length) console.error("Too short:", tooShort.join(", "));
    console.error("\n💡 Check your .env file or hosting platform env vars\n");
    process.exit(1);
  }

  console.log("✅ Environment validated");
};
