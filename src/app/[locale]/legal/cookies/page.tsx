import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { buildAlternateLanguages } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cookies");
  return { title: t("title"), alternates: { languages: buildAlternateLanguages("/legal/cookies") } };
}

export default async function CookiesPolicyPage() {
  const t = await getTranslations("legal.cookies");

  return <LegalPageLayout title={t("title")} content={t("content")} />;
}
