import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/motion/FadeIn";
import { buildAlternateLanguages } from "@/lib/seo/alternates";
import { urlForImage } from "@/lib/sanity/image";
import { getHomePage } from "@/lib/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { languages: buildAlternateLanguages("") },
  };
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const cms = await getHomePage();
  // Placeholder until real photography is uploaded in Sanity — swap by setting the Home page's hero image there.
  const heroImageUrl = cms?.heroImage
    ? urlForImage(cms.heroImage)?.width(2400).height(1400).fit("crop").url()
    : "/hero-placeholder.jpg";

  return (
    <div
      className={`relative mx-auto flex max-w-none flex-col items-center px-6 text-center ${
        heroImageUrl ? "min-h-[560px] justify-end pb-16 pt-24 sm:pb-24" : "max-w-6xl py-24"
      }`}
    >
      {heroImageUrl && (
        <>
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            className="-z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        </>
      )}
      <FadeIn onMount>
        <h1
          className={`text-4xl font-bold tracking-tight sm:text-5xl ${
            heroImageUrl ? "text-white" : "text-accent"
          }`}
        >
          {t("title")}
        </h1>
      </FadeIn>
      <FadeIn onMount delay={0.15}>
        <p className={`mx-auto mt-6 max-w-2xl text-lg ${heroImageUrl ? "text-white/85" : "text-foreground/80"}`}>
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
            className={`rounded-2xl border px-6 py-3 text-sm font-medium transition ${
              heroImageUrl
                ? "border-white/50 text-white hover:border-white/80"
                : "border-border/35 text-foreground hover:border-border/60"
            }`}
          >
            {t("ctaShop")}
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
