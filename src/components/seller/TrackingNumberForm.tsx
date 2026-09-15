"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type TrackingNumberFormProps = {
  threadId: string;
  initialTrackingNumber?: string;
};

export default function TrackingNumberForm({ threadId, initialTrackingNumber }: TrackingNumberFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialTrackingNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trackingNumber = value.trim();
    if (!trackingNumber || saving) return;

    setSaving(true);
    setError(false);
    try {
      const response = await fetch(`/api/seller/messages/threads/${threadId}/shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-black/10 p-4">
      <label className="min-w-0 flex-1 text-sm">
        <span className="mb-1 block font-medium">追跡番号</span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="追跡番号を入力"
          className="w-full rounded border border-black/15 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={saving || !value.trim()}
        className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {saving ? "保存中..." : initialTrackingNumber ? "追跡番号を更新" : "発送済みにする"}
      </button>
      {error && <p className="w-full text-xs text-red-600">保存に失敗しました。もう一度お試しください。</p>}
    </form>
  );
}
