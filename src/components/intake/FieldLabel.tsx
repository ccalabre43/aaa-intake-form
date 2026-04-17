import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FieldLabelProps {
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FieldLabel({ htmlFor, required, hint, children }: FieldLabelProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {children}
        {required && <span className="ml-1 text-accent">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
