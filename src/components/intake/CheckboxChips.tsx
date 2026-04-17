import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxChipsProps {
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
}

export function CheckboxChips({ options, values, onChange }: CheckboxChipsProps) {
  const toggle = (opt: string) => {
    if (opt === "None") {
      onChange(values.includes("None") ? [] : ["None"]);
      return;
    }
    const without = values.filter((v) => v !== "None");
    onChange(
      without.includes(opt) ? without.filter((v) => v !== opt) : [...without, opt]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
              selected
                ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
            )}
          >
            {selected && <Check className="h-3.5 w-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
