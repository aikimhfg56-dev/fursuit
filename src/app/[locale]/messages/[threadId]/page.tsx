import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ChatThread from "@/components/messages/ChatThread";
import { getThread, isValidThreadToken, listMessages } from "@/lib/messages/store";

type PageParams = {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function AnonymousMessageThreadPage({ params, searchParams }: PageParams) {
  const { threadId } = await params;
  const { token } = await searchParams;

  const thread = await getThread(threadId);
  if (!thread || !token || !isValidThreadToken(thread, token)) notFound();

  const messages = await listMessages(threadId);
  const t = await getTranslations("account.messages");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{thread.productName}</h1>

      <div className="mt-6">
        <ChatThread
          threadId={threadId}
          role="buyer"
          apiBase="/api/messages/anon"
          token={token}
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
