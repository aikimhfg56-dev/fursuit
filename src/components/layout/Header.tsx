import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isClerkConfigured } from "@/lib/env";
import AuthNav from "./AuthNav";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";
import ResponsiveOnly from "./ResponsiveOnly";

export default async function Header() {
  const t = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/preorder", label: t("preorder") },
    { href: "/commission", label: t("commission") },
    { href: "/contact", label: t("contact") },
  ];

  const brand = (
    <Link
      href="/"
      className="flex items-center gap-2 whitespace-nowrap text-base font-semibold tracking-tight text-accent md:text-lg"
    >
      <Image src="/logo.png" alt="" width={32} height={32} className="rounded-md shrink-0" priority />
      R Furstudio
    </Link>
  );

  const searchLink = (
    <Link
      href="/search"
      aria-label={tCommon("search")}
      className="flex h-9 w-9 items-center justify-center"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
      </svg>
    </Link>
  );

  return (
    <header className="border-b border-border/15 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 md:hidden">
          <div className="flex items-center">
            <MobileMenu links={links}>
              {isClerkConfigured() && <AuthNav />}
              <LocaleSwitcher />
            </MobileMenu>
          </div>
          <div className="flex min-w-0 items-center justify-center">{brand}</div>
          <div className="flex items-center justify-end">{searchLink}</div>
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          {brand}
          <nav className="flex flex-wrap items-center gap-6 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {searchLink}
            {isClerkConfigured() && (
              <ResponsiveOnly query="(min-width: 768px)">
                <AuthNav />
              </ResponsiveOnly>
            )}
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
