import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import { buildAlternateLanguages } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("fursuitCare");
  return { title: t("title"), alternates: { languages: buildAlternateLanguages("/fursuit-care") } };
}

export default async function FursuitCarePage() {
  const t = await getTranslations("fursuitCare");

  return <ContentPageLayout title={t("title")} content={t("content")} />;
}
