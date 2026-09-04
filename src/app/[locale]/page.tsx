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
        <h1 className="text-4xl font-bold tracking-tight text-accent sm:text-5xl">
          {t("title")}
        </h1>
      </FadeIn>
      <FadeIn onMount delay={0.15}>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80">
          {t("subtitle")}
        </p>
      </FadeIn>
      <FadeIn onMount delay={0.3}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/commission"
            className="rounded-2xl bg-cta-background px-6 py-3 text-sm font-medium text-cta-foreground transition hover:opacity-90"
          >
            {t("ctaCommission")}
          </Link>
          <Link
            href="/shop"
            className="rounded-2xl border border-border/35 px-6 py-3 text-sm font-medium text-foreground transition hover:border-border/60"
          >
            {t("ctaShop")}
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
