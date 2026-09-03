/** Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL once a production domain exists. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
