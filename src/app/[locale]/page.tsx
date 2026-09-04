import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/motion/FadeIn";
import { buildAlternateLanguages } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { languages: buildAlternateLanguages("") },
  };
}

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <FadeIn onMount>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
      </FadeIn>
      <FadeIn onMount delay={0.15}>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-black/70 dark:text-white/70">
          {t("subtitle")}
        </p>
      </FadeIn>
      <FadeIn onMount delay={0.3}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/commission"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            {t("ctaCommission")}
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-black/20 px-6 py-3 text-sm font-medium dark:border-white/20"
          >
            {t("ctaShop")}
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
