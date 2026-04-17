import { ReactNode } from "react";

interface SectionCardProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ step, title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <header className="flex items-start gap-4 px-6 py-5 border-b bg-secondary/40">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-[var(--shadow-elegant)]">
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground leading-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div className="p-6 space-y-5">{children}</div>
    </section>
  );
}
