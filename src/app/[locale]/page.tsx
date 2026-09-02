import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-black/70 dark:text-white/70">
        {t("subtitle")}
      </p>
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
    </div>
  );
}
