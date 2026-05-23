export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="font-display text-2xl tracking-widest">HOUSE OF FINALS</div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            @20 Rooftop · Praveg's Grand Eulogia · Ahmedabad
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © 2026 · +91 8401 401 312
        </div>
      </div>
    </footer>
  );
}
