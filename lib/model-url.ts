export function normalizeModelIdentifier(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._/-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function withLocalePrefix(path: string, locale?: string): string {
  if (!locale) {
    return path;
  }
  if (path === "/") {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

export function getModelDetailPath(modelId: string, locale?: string): string {
  const encodedId = modelId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return withLocalePrefix(`/models/${encodedId}`, locale);
}
