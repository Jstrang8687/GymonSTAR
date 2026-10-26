// Tiny typography helpers so the two legal pages read as plain document
// text without repeating the same Tailwind classes on every line.
export function LegalTitle({ children, updated }: { children: React.ReactNode; updated: string }) {
  return (
    <header className="mb-6 border-b border-white/10 pb-4">
      <h1 className="text-2xl font-black text-white">{children}</h1>
      <p className="mt-1 text-xs text-slate-500">Effective {updated}</p>
    </header>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 space-y-3">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}
