import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isClerkConfigured } from "@/lib/env";
import { isThreadUnread, listThreadsForBuyer } from "@/lib/messages/store";

export default async function AccountMessagesPage() {
  if (!isClerkConfigured()) redirect("/account");

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const t = await getTranslations("account.messages");
  const threads = await listThreadsForBuyer(user.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {threads.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">{t("empty")}</p>
      ) : (
        <ul className="mt-6 divide-y divide-black/10 rounded-xl border border-black/10">
          {threads.map((thread) => {
            const unread = isThreadUnread(thread, "buyer");
            return (
              <li key={thread.id}>
                <Link
                  href={`/account/messages/${thread.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-black/[0.02]"
                >
                  <div className="min-w-0">
                    <p className={`truncate text-sm ${unread ? "font-semibold" : "font-medium"}`}>
                      {thread.customerNumber && (
                        <span className="mr-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                          {thread.customerNumber}
                        </span>
                      )}
                      {thread.productName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-black/60">
                      {thread.lastMessagePreview || t("noMessagesYet")}
                    </p>
                  </div>
                  {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
