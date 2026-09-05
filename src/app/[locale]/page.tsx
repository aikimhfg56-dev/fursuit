import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/motion/FadeIn";
import { buildAlternateLanguages } from "@/lib/seo/alternates";
import { urlForImage } from "@/lib/sanity/image";
import { getHomePage } from "@/lib/sanity/queries";
import type { SanityImageRef } from "@/lib/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { languages: buildAlternateLanguages("") },
  };
}

function resolveImageUrl(image: SanityImageRef | undefined) {
  return image ? urlForImage(image)?.width(2400).height(1400).fit("crop").url() : "/hero-placeholder.jpg";
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const tShop = await getTranslations("shop");
  const tPreorder = await getTranslations("preorder");
  const tCommission = await getTranslations("commission");
  const tContact = await getTranslations("contact");
  const cms = await getHomePage();

  // Placeholder until real photography is uploaded in Sanity — swap by setting the Home page's images there.
  const heroImageUrl = resolveImageUrl(cms?.heroImage);

  const sections = [
    { title: tShop("title"), href: "/shop", image: cms?.shopImage },
    { title: tPreorder("title"), href: "/preorder", image: cms?.preorderImage },
    { title: tCommission("title"), href: "/commission", image: cms?.commissionImage },
    { title: tContact("title"), href: "/contact", image: cms?.contactImage },
  ] as const;

  return (
    <>
      <div
        className={`relative mx-auto flex w-full max-w-none flex-col items-center px-6 text-center ${
          heroImageUrl
            ? "aspect-[4/5] max-h-[720px] min-h-[480px] justify-end pb-16 pt-24 sm:aspect-video sm:pb-24 lg:aspect-[21/9]"
            : "max-w-6xl py-24"
        }`}
      >
        {heroImageUrl && (
          <>
            <Image src={heroImageUrl} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          </>
        )}
        <div className="relative z-10 flex flex-col items-center">
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
      </div>

      {sections.map((section) => {
        const imageUrl = resolveImageUrl(section.image);
        return (
          <FadeIn key={section.href} className="block w-full">
            <div className="relative flex aspect-[4/5] max-h-[640px] min-h-[420px] w-full flex-col items-center justify-end px-6 pb-16 pt-24 text-center sm:aspect-video sm:pb-20 lg:aspect-[21/9]">
              {imageUrl && (
                <>
                  <Image src={imageUrl} alt="" fill className="object-cover" sizes="100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/5" />
                </>
              )}
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
                <Link
                  href={section.href}
                  className="mt-6 rounded-2xl bg-cta-background px-6 py-3 text-sm font-medium text-cta-foreground transition hover:opacity-90"
                >
                  {t("seeMore")}
                </Link>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </>
  );
}
