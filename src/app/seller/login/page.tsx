import { connection } from "next/server";
import SellerLoginForm from "./SellerLoginForm";

/**
 * This page has no data to fetch, so Next.js would otherwise prerender it as
 * static HTML — but Clerk's strict CSP stamps a fresh per-request nonce onto
 * every script tag, and a statically cached page can never carry that nonce.
 * `connection()` forces per-request rendering so the nonce always matches.
 */
export default async function SellerLoginPage() {
  await connection();
  return <SellerLoginForm />;
}
