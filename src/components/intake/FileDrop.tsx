import { Upload, X, FileText } from "lucide-react";
import { useRef, useState, DragEvent } from "react";
import { cn } from "@/lib/utils";

interface FileDropProps {
  files: File[];
  onChange: (files: File[]) => void;
  extraHeight?: number;
}

export function FileDrop({ files, onChange, extraHeight = 0 }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const add = (incoming: FileList | null) => {
    if (!incoming) return;
    onChange([...files, ...Array.from(incoming)]);
  };

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    add(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={extraHeight ? { paddingTop: `calc(2.5rem + ${extraHeight / 2}px)`, paddingBottom: `calc(2.5rem + ${extraHeight / 2}px)` } : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors",
          drag
            ? "border-primary bg-primary/5"
            : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60"
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-sm font-medium text-foreground">
          Drop files or <span className="text-primary">browse</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Images, PDFs, or videos up to 25MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => add(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-sm text-foreground">{f.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
