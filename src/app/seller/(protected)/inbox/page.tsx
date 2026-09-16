import Link from "next/link";
import { isThreadUnread, listThreadsForSeller, type ThreadRecord } from "@/lib/messages/store";

const KIND_LABELS: Record<string, string> = {
  commission: "オーダーメイド",
  preorder: "セミオーダー",
  shop: "ショップ",
  contact: "お問い合わせ",
};

export default async function SellerInboxPage() {
  const threads = await listThreadsForSeller();
  const contactThreads = threads.filter((thread) => thread.kind === "contact");
  const orderThreads = threads.filter((thread) => thread.kind === "commission" || thread.kind === "preorder");
  const shopThreads = threads.filter((thread) => thread.kind === "shop");

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-bold tracking-tight">メッセージ</h1>

      <ThreadSection title="お問い合わせ" threads={contactThreads} />
      <ThreadSection title="オーダーメイド・セミオーダー" threads={orderThreads} />
      <ThreadSection title="ショップ" threads={shopThreads} />
    </div>
  );
}

function ThreadSection({ title, threads }: { title: string; threads: ThreadRecord[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {threads.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">まだメッセージはありません。</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/10 rounded-xl border border-black/10">
          {threads.map((thread) => {
            const unread = isThreadUnread(thread, "seller");
            return (
              <li key={thread.id}>
                <Link
                  href={`/seller/inbox/${thread.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-black/[0.02]"
                >
                  <div className="min-w-0">
                    <p className={`truncate text-sm ${unread ? "font-semibold" : "font-medium"}`}>
                      {thread.customerNumber && (
                        <span className="mr-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                          {thread.customerNumber}
                        </span>
                      )}
                      {thread.buyerName ?? thread.buyerEmail ?? thread.buyerUserId} ・ {thread.productName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-foreground/60">
                      {KIND_LABELS[thread.kind]} ・ {thread.lastMessagePreview || "メッセージはまだありません"}
                    </p>
                  </div>
                  {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
