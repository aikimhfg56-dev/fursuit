import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isClerkConfigured } from "@/lib/env";
import ChatThread from "@/components/messages/ChatThread";
import { getThread, listMessages } from "@/lib/messages/store";

type PageParams = { params: Promise<{ threadId: string }> };

export default async function AccountMessageThreadPage({ params }: PageParams) {
  if (!isClerkConfigured()) redirect("/account");

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread || thread.buyerUserId !== user.id) notFound();

  const messages = await listMessages(threadId);
  const t = await getTranslations("account.messages");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/account/messages" className="text-sm text-black/60 hover:underline">
        {t("back")}
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{thread.productName}</h1>

      {thread.trackingNumber && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="font-semibold">📦 {t("shipped")}</p>
          <p className="mt-1">
            {t("trackingNumber")}: <span className="font-mono">{thread.trackingNumber}</span>
          </p>
        </div>
      )}

      <div className="mt-6">
        <ChatThread
          threadId={threadId}
          role="buyer"
          apiBase="/api/messages/threads"
          initialThread={thread}
          initialMessages={messages}
          labels={{
            inputPlaceholder: t("chat.inputPlaceholder"),
            send: t("chat.send"),
            sending: t("chat.sending"),
            read: t("chat.read"),
            attachImage: t("chat.attachImage"),
            sendError: t("chat.sendError"),
            imageTooLarge: t("chat.imageTooLarge"),
          }}
        />
      </div>
    </div>
  );
}
