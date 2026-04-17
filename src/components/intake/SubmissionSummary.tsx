import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IntakeData } from "./types";

interface SubmissionSummaryProps {
  data: IntakeData;
  files: File[];
  onReset: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4 border-b last:border-b-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="sm:col-span-2 text-sm text-foreground whitespace-pre-wrap break-words">
        {Array.isArray(value) ? value.join(", ") : value}
      </dd>
    </div>
  );
}

export function SubmissionSummary({ data, files, onReset }: SubmissionSummaryProps) {
  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-8 text-primary-foreground shadow-[var(--shadow-elegant)]"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-10 w-10 shrink-0" />
          <div>
            <h1 className="text-2xl font-semibold">Request submitted</h1>
            <p className="mt-1 text-sm text-primary-foreground/85">
              Thanks, {data.requestedBy || "team"} — your creative request has been
              captured. Below is a summary of what you sent.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-[var(--shadow-card)]">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-foreground">Submission details</h2>
        </div>
        <dl className="px-6 divide-border">
          <Row label="Requested By" value={data.requestedBy} />
          <Row label="Communication Type" value={data.communicationType} />
          <Row label="General Additional Info" value={data.generalAdditionalInfo} />
          <Row label="Background & Business Purposes" value={data.backgroundPurpose} />
          <Row label="Project Summary" value={data.projectSummary} />
          <Row label="Internal Audience" value={data.audienceInternal} />
          <Row label="Internal Audience Notes" value={data.audienceInternalNotes} />
          <Row label="External Audience" value={data.audienceExternal} />
          <Row label="External Audience Notes" value={data.audienceExternalNotes} />
          <Row label="Deliverables" value={data.deliverables} />
          <Row label="Goals & Expectations" value={data.goalsExpectations} />
          <Row label="Success Measurement" value={data.successMeasurement} />
          <Row label="Desired Completion Date" value={data.desiredCompletionDate} />
          <Row label="Timing Notes" value={data.timingNotes} />
          <Row label="Additional Information" value={data.supplementalDescription} />
          <Row
            label="Attachments"
            value={files.length ? files.map((f) => f.name) : ""}
          />
        </dl>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onReset}>
          Submit another request
        </Button>
      </div>
    </div>
  );
}
