import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import { buildAlternateLanguages } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title"), alternates: { languages: buildAlternateLanguages("/about") } };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return <ContentPageLayout title={t("title")} content={t("content")} />;
}
