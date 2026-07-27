export function getTursoConfig() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not configured");
  }

  if (!authToken) {
    throw new Error("TURSO_AUTH_TOKEN is not configured");
  }

  if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    throw new Error("TURSO_DATABASE_URL must use the libsql:// or https:// protocol");
  }

  return { url, authToken };
}
