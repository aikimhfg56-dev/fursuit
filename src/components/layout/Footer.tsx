import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-black/60 dark:text-white/60">
        © {year} Fursuit Studio. {t("rights")}
      </div>
    </footer>
  );
}
