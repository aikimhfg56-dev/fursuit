"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SELLER_CATEGORY_OPTIONS, type SellerProductKind, type SellerProductRecord } from "@/lib/seller/store";
import { resizeImageToDataUrl } from "@/lib/seller/resizeImageClient";

type SellerProductFormProps = {
  kind: SellerProductKind;
  initialProduct?: SellerProductRecord;
};

const STOCK_OPTIONS: { value: string; label: string }[] = [
  { value: "in_stock", label: "在庫あり" },
  { value: "low_stock", label: "残りわずか" },
  { value: "sold_out", label: "売り切れ" },
];

const FLAG_OPTIONS: { value: string; label: string }[] = [
  { value: "new_arrival", label: "新着" },
  { value: "flash_sale", label: "セール" },
  { value: "clearance", label: "在庫処分" },
];

const PREORDER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "open", label: "受付中" },
  { value: "closing_soon", label: "まもなく締切" },
  { value: "closed", label: "受付終了" },
  { value: "in_production", label: "制作中" },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SellerProductForm({ kind, initialProduct }: SellerProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [id, setId] = useState(initialProduct?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [images, setImages] = useState<string[]>(initialProduct?.images ?? []);
  const [basePrice, setBasePrice] = useState(initialProduct?.basePrice?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initialProduct?.weightKg?.toString() ?? "");
  const [stockStatus, setStockStatus] = useState(initialProduct?.stockStatus ?? "in_stock");
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stockQuantity?.toString() ?? "");
  const [category, setCategory] = useState(initialProduct?.category ?? "");
  const [speciesTag, setSpeciesTag] = useState(initialProduct?.speciesTag ?? "");
  const [flags, setFlags] = useState<string[]>(initialProduct?.flags ?? []);
  const [preorderStatus, setPreorderStatus] = useState(initialProduct?.preorderStatus ?? "open");
  const [shipStart, setShipStart] = useState(initialProduct?.expectedShipWindowStart ?? "");
  const [shipEnd, setShipEnd] = useState(initialProduct?.expectedShipWindowEnd ?? "");

  const [processingImages, setProcessingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing && !slugTouched) {
      const suggestion = slugify(value);
      if (suggestion) setId(suggestion);
    }
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setProcessingImages(true);
    try {
      const resized = await Promise.all(Array.from(fileList).map((file) => resizeImageToDataUrl(file)));
      setImages((current) => [...current, ...resized]);
    } catch {
      setError("画像の読み込みに失敗しました。別の画像でお試しください。");
    } finally {
      setProcessingImages(false);
    }
  }

  function toggleValue(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      setError("URLスラッグは半角小文字英数字とハイフンのみで入力してください(例: red-fox-fullsuit)。");
      return;
    }
    if (images.length === 0) {
      setError("画像を1枚以上追加してください。");
      return;
    }
    const priceNumber = Number(basePrice);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("価格は0より大きい数値で入力してください。");
      return;
    }
    const weightNumber = weightKg.trim() === "" ? undefined : Number(weightKg);
    if (weightNumber !== undefined && (!Number.isFinite(weightNumber) || weightNumber <= 0)) {
      setError("重量は0より大きい数値で入力してください(例: 1.2)。");
      return;
    }
    const stockQuantityNumber = stockQuantity.trim() === "" ? undefined : Number(stockQuantity);
    if (stockQuantityNumber !== undefined && (!Number.isInteger(stockQuantityNumber) || stockQuantityNumber < 0)) {
      setError("在庫数は0以上の整数で入力してください。");
      return;
    }

    setSubmitting(true);
    const payload = {
      kind,
      id,
      name,
      description: description || undefined,
      images,
      basePrice: priceNumber,
      weightKg: weightNumber,
      stockStatus,
      stockQuantity: stockQuantityNumber,
      category: category || undefined,
      speciesTag: speciesTag || undefined,
      flags,
      ...(kind === "preorder"
        ? {
            preorderStatus,
            expectedShipWindowStart: shipStart || undefined,
            expectedShipWindowEnd: shipEnd || undefined,
          }
        : {}),
    };

    const response = await fetch(
      isEditing ? `/api/seller/products/${kind}/${id}` : "/api/seller/products",
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      router.push("/seller");
      router.refresh();
      return;
    }

    const body = await response.json().catch(() => null);
    setError(
      body?.error === "slug_taken"
        ? "このURLスラッグはすでに使われています。別の値を入力してください。"
        : `保存に失敗しました(${body?.error ?? "unknown_error"})。`,
    );
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">商品名</label>
        <input
          type="text"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">URLスラッグ(半角英数字とハイフン)</label>
        <input
          type="text"
          value={id}
          onChange={(event) => {
            setId(event.target.value);
            setSlugTouched(true);
          }}
          disabled={isEditing}
          required
          placeholder="例: red-fox-fullsuit"
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm disabled:bg-black/5 disabled:text-foreground/50"
        />
        {isEditing && <p className="mt-1 text-xs text-foreground/50">作成後はURLスラッグを変更できません。</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">商品詳細</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">画像</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div key={image.slice(0, 64) + index} className="relative h-24 w-24 overflow-hidden rounded-lg bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an in-memory data URL / uploaded file */}
              <img src={image} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                aria-label="この画像を削除"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-black/25 text-xs text-foreground/50 hover:border-black/40">
            {processingImages ? "処理中..." : "＋ 追加"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleFilesSelected(event.target.files)}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">価格(USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">重量(kg)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            placeholder="例: 1.2"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-black/50">梱包後の発送重量の目安。海外配送時のEMS送料計算に使われます。</p>
        </div>
        <div>
          <label className="block text-sm font-medium">在庫状況</label>
          <select
            value={stockStatus}
            onChange={(event) => setStockStatus(event.target.value as typeof stockStatus)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          >
            {STOCK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">在庫数(任意)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={stockQuantity}
            onChange={(event) => setStockQuantity(event.target.value)}
            placeholder="例: 3"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-black/50">
            入力すると、購入されるたびに自動で1つ減り、0になると自動で「売り切れ」になります。空欄のままなら在庫状況は上の欄で手動管理します。
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">カテゴリ</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">未設定</option>
            {SELLER_CATEGORY_OPTIONS.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.title.en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">種族(任意)</label>
          <input
            type="text"
            value={speciesTag}
            onChange={(event) => setSpeciesTag(event.target.value)}
            placeholder="例: Fox"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">フラグ</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {FLAG_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={flags.includes(option.value)}
                onChange={() => setFlags((current) => toggleValue(current, option.value))}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {kind === "preorder" && (
        <div className="space-y-6 rounded-xl border border-black/10 p-4">
          <div>
            <label className="block text-sm font-medium">予約ステータス</label>
            <select
              value={preorderStatus}
              onChange={(event) => setPreorderStatus(event.target.value as typeof preorderStatus)}
              className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
            >
              {PREORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">発送予定(開始)</label>
              <input
                type="date"
                value={shipStart}
                onChange={(event) => setShipStart(event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">発送予定(終了)</label>
              <input
                type="date"
                value={shipEnd}
                onChange={(event) => setShipEnd(event.target.value)}
                className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || processingImages}
        className="rounded-2xl bg-cta-background px-6 py-3 text-sm font-medium text-cta-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "保存中..." : isEditing ? "変更を保存" : "商品を登録"}
      </button>
    </form>
  );
}
