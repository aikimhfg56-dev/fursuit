"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SellerProductKind } from "@/lib/seller/store";

type SellerDeleteButtonProps = {
  kind: SellerProductKind;
  id: string;
  productName: string;
};

export default function SellerDeleteButton({ kind, id, productName }: SellerDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${productName}」を削除しますか？この操作は取り消せません。`)) return;

    setDeleting(true);
    const response = await fetch(`/api/seller/products/${kind}/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.refresh();
    } else {
      alert("削除に失敗しました。もう一度お試しください。");
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-600 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {deleting ? "削除中..." : "削除"}
    </button>
  );
}
