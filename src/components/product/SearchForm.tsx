"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";

type SearchFormProps = {
  defaultValue: string;
  placeholder: string;
  submitLabel: string;
};

export default function SearchForm({ defaultValue, placeholder, submitLabel }: SearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md items-center gap-2">
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border/40 bg-transparent px-4 py-2 text-sm"
      />
      <button
        type="submit"
        aria-label={submitLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cta-background text-cta-foreground transition hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
