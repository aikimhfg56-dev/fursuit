type PagePlaceholderProps = {
  title: string;
  description: string;
  comingSoon: string;
};

export default function PagePlaceholder({
  title,
  description,
  comingSoon,
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-black/70">{description}</p>
      <p className="mt-10 inline-block rounded-full border border-black/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
        {comingSoon}
      </p>
    </div>
  );
}
