import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header() {
  const t = useTranslations("nav");

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Fursuit Studio
        </Link>
        <nav className="flex flex-wrap items-center gap-6 text-sm">
          <Link href="/commission">{t("commission")}</Link>
          <Link href="/shop">{t("shop")}</Link>
          <Link href="/preorder">{t("preorder")}</Link>
          <Link href="/contact">{t("contact")}</Link>
        </nav>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
