type ProductImagePlaceholderProps = {
  label: string;
};

/** Shown in place of a product photo until real photography is uploaded in Sanity. */
export default function ProductImagePlaceholder({ label }: ProductImagePlaceholderProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-black/[0.03]">
      <svg viewBox="0 0 64 64" className="h-10 w-10 text-black/20" fill="currentColor" aria-hidden="true">
        <ellipse cx="32" cy="43" rx="16" ry="13" />
        <circle cx="13" cy="23" r="7" />
        <circle cx="27" cy="13.5" r="7.5" />
        <circle cx="40" cy="13.5" r="7.5" />
        <circle cx="54" cy="23" r="7" />
      </svg>
      <p className="px-2 text-center text-[10px] font-medium uppercase tracking-wide text-black/35">{label}</p>
    </div>
  );
}
