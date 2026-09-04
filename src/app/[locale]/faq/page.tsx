import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import { buildAlternateLanguages } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return { title: t("title"), alternates: { languages: buildAlternateLanguages("/faq") } };
}

export default async function FaqPage() {
  const t = await getTranslations("faq");

  return <ContentPageLayout title={t("title")} content={t("content")} />;
}
