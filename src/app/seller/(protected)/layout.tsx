import Link from "next/link";
import { redirect } from "next/navigation";
import SellerLogoutButton from "@/components/seller/SellerLogoutButton";
import { isThreadUnread, listThreadsForSeller } from "@/lib/messages/store";
import { hasSellerSession } from "@/lib/seller/auth";

type ProtectedSellerLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedSellerLayout({ children }: ProtectedSellerLayoutProps) {
  if (!(await hasSellerSession())) {
    redirect("/seller/login");
  }

  const threads = await listThreadsForSeller();
  const unreadCount = threads.filter((thread) => isThreadUnread(thread, "seller")).length;

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/seller" className="text-sm font-semibold tracking-tight text-accent">
              出品者管理画面
            </Link>
            <Link href="/seller/inbox" className="relative text-sm font-medium text-foreground/70 hover:text-foreground">
              メッセージ
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
          <SellerLogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
