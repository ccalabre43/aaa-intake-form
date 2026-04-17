import { cn } from "@/lib/utils";

interface ChoiceCardsProps {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}

export function ChoiceCards({ options, value, onChange, name }: ChoiceCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 p-4 transition-all",
              "hover:border-primary/40 hover:bg-secondary/40",
              selected
                ? "border-primary bg-primary/5 shadow-[var(--shadow-elegant)]"
                : "border-border bg-card"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selected ? "border-primary bg-primary" : "border-border bg-card"
                )}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </span>
              <div className="min-w-0">
                <div className="font-medium text-foreground">{opt.label}</div>
                {opt.description && (
                  <div className="mt-0.5 text-xs text-muted-foreground">{opt.description}</div>
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
