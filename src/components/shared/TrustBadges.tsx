import { useTranslations } from "next-intl";

const BADGE_KEYS = ["shipping", "payment", "support"] as const;

export default function TrustBadges() {
  const t = useTranslations("trustBadges");

  return (
    <div className="grid gap-6 border-y border-black/10 py-8 text-center sm:grid-cols-3">
      {BADGE_KEYS.map((key) => (
        <div key={key}>
          <p className="text-sm font-semibold">{t(`${key}.title`)}</p>
          <p className="mt-1 text-xs text-black/60">{t(`${key}.description`)}</p>
        </div>
      ))}
    </div>
  );
}
