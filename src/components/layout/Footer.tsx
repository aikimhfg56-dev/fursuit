import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LEGAL_LINKS = [
  { href: "/legal/privacy", key: "privacy" },
  { href: "/legal/terms", key: "terms" },
  { href: "/legal/shipping", key: "shipping" },
  { href: "/legal/returns", key: "returns" },
  { href: "/legal/cookies", key: "cookies" },
] as const;

export default function Footer() {
  const t = useTranslations("footer");
  const tLegal = useTranslations("legal.footerNav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-black/60 sm:flex-row sm:items-center sm:justify-between dark:text-white/60">
        <p>
          © {year} Fursuit Studio. {t("rights")}
        </p>
        <nav className="flex flex-wrap gap-4">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {tLegal(link.key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
