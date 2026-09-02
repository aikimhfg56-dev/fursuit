import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import type { CommissionStep } from "@/lib/sanity/queries";

type ProcessStepsProps = {
  steps?: CommissionStep[];
  locale: Locale;
};

type StepItem = {
  number: number;
  title: string;
  description: string;
};

export default async function ProcessSteps({ steps, locale }: ProcessStepsProps) {
  const t = await getTranslations("commission.steps");

  const items: StepItem[] =
    steps && steps.length > 0
      ? [...steps]
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => ({
            number: step.stepNumber,
            title: pickLocaleValue(step.title, locale),
            description: pickLocaleValue(step.description, locale),
          }))
      : (t.raw("items") as { title: string; description: string }[]).map((item, index) => ({
          number: index + 1,
          title: item.title,
          description: item.description,
        }));

  return (
    <div>
      <h2 className="text-center text-xl font-semibold">{t("heading")}</h2>
      <ol className="mt-8 space-y-6">
        {items.map((item) => (
          <li key={item.number} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
              {item.number}
            </span>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-black/70 dark:text-white/70">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
