import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const BRAND_LINKS = [
  { href: "/", key: "home" },
  { href: "/commission", key: "commission" },
  { href: "/shop", key: "shop" },
  { href: "/preorder", key: "preorder" },
] as const;

const HELP_LINKS = [
  { href: "/faq", key: "faq" },
  { href: "/fursuit-care", key: "fursuitCare" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/privacy", key: "privacy" },
  { href: "/legal/terms", key: "terms" },
  { href: "/legal/shipping", key: "shipping" },
  { href: "/legal/returns", key: "returns" },
  { href: "/legal/cookies", key: "cookies" },
] as const;

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tLegal = useTranslations("legal.footerNav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 text-sm text-black/60 sm:grid-cols-3 dark:text-white/60">
        <div>
          <h2 className="font-semibold text-black dark:text-white">{t("brandHeading")}</h2>
          <nav className="mt-3 flex flex-col gap-2">
            {BRAND_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {tNav(link.key)}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="font-semibold text-black dark:text-white">{t("helpHeading")}</h2>
          <nav className="mt-3 flex flex-col gap-2">
            {HELP_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="font-semibold text-black dark:text-white">{t("legalHeading")}</h2>
          <nav className="mt-3 flex flex-col gap-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {tLegal(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-black/10 px-6 py-6 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
        <p className="mx-auto max-w-6xl">
          © {year} Fursuit Studio. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
