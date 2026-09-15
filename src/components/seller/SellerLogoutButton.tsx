"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/seller/logout", { method: "POST" });
    router.push("/seller/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-foreground/70 underline-offset-2 hover:underline disabled:opacity-50"
    >
      ログアウト
    </button>
  );
}
