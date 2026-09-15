"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/seller/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      router.push("/seller");
      router.refresh();
      return;
    }

    const body = await response.json().catch(() => null);
    setError(
      body?.error === "not_configured"
        ? "SELLER_ACCESS_CODE が設定されていません。.env.local を確認してください。"
        : body?.error === "rate_limited"
          ? "試行回数が多すぎます。しばらくしてからもう一度お試しください。"
          : "パスコードが違います。",
    );
    setSubmitting(false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-bold tracking-tight">出品者ログイン</h1>
      <p className="mt-2 text-sm text-foreground/70">このページは出品者専用です。パスコードを入力してください。</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="パスコード"
          autoFocus
          required
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-cta-background px-6 py-3 text-sm font-medium text-cta-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "確認中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
