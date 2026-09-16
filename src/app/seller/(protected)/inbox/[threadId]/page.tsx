import Link from "next/link";
import { notFound } from "next/navigation";
import ChatThread from "@/components/messages/ChatThread";
import TrackingNumberForm from "@/components/seller/TrackingNumberForm";
import { getThread, listMessages } from "@/lib/messages/store";

const KIND_LABELS: Record<string, string> = {
  commission: "オーダーメイド",
  preorder: "セミオーダー",
  shop: "ショップ",
  contact: "お問い合わせ",
};

type PageParams = { params: Promise<{ threadId: string }> };

export default async function SellerInboxThreadPage({ params }: PageParams) {
  const { threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread) notFound();

  const messages = await listMessages(threadId);

  return (
    <div>
      <Link href="/seller/inbox" className="text-sm text-foreground/60 hover:underline">
        ← メッセージ一覧に戻る
      </Link>
      <h1 className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
        {thread.customerNumber && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-sm font-semibold text-accent">
            {thread.customerNumber}
          </span>
        )}
        {thread.buyerName ?? thread.buyerEmail ?? thread.buyerUserId}
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        {KIND_LABELS[thread.kind]} ・ {thread.productName}
        {thread.referenceCode ? ` ・ ${thread.referenceCode}` : ""}
      </p>

      {thread.trackingNumber && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="font-semibold">📦 発送済み</p>
          <p className="mt-1">
            追跡番号: <span className="font-mono">{thread.trackingNumber}</span>
          </p>
        </div>
      )}

      {thread.kind !== "contact" && (
        <div className="mt-6">
          <TrackingNumberForm threadId={threadId} initialTrackingNumber={thread.trackingNumber} />
        </div>
      )}

      <div className="mt-6">
        <ChatThread
          threadId={threadId}
          role="seller"
          apiBase="/api/seller/messages/threads"
          initialThread={thread}
          initialMessages={messages}
          labels={{
            inputPlaceholder: "メッセージを入力",
            send: "送信",
            sending: "送信中...",
            read: "既読",
            attachImage: "画像を添付",
            sendError: "送信に失敗しました。もう一度お試しください。",
            imageTooLarge: "画像が大きすぎます。別の画像でお試しください。",
          }}
        />
      </div>
    </div>
  );
}
