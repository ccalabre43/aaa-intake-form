import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SectionCard } from "./SectionCard";
import { FieldLabel } from "./FieldLabel";
import { ChoiceCards } from "./ChoiceCards";
import { CheckboxChips } from "./CheckboxChips";
import { FileDrop } from "./FileDrop";
import { SubmissionSummary } from "./SubmissionSummary";
import { initialIntake, REQUIRED_FIELDS, type IntakeData } from "./types";

const INTERNAL_OPTS = [
  "All Associates",
  "Livonia Associates",
  "Omaha Associates",
  "Manager Level and Above",
  "None",
];
const EXTERNAL_OPTS = ["Clubs", "Policy Holders", "Members", "None"];

export function IntakeForm() {
  const [data, setData] = useState<IntakeData>(initialIntake);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState<{ data: IntakeData; files: File[] } | null>(
    null
  );

  const set = <K extends keyof IntakeData>(key: K, value: IntakeData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const completion = useMemo(() => {
    const done = REQUIRED_FIELDS.filter((k) => {
      const v = data[k];
      return Array.isArray(v) ? v.length > 0 : Boolean(v);
    }).length;
    return Math.round((done / REQUIRED_FIELDS.length) * 100);
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = REQUIRED_FIELDS.filter((k) => {
      const v = data[k];
      return Array.isArray(v) ? v.length === 0 : !v;
    });
    if (missing.length) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSubmitted({ data, files });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setData(initialIntake);
    setFiles([]);
    setSubmitted(null);
  };

  if (submitted) {
    return (
      <SubmissionSummary data={submitted.data} files={submitted.files} onReset={reset} />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hero / intro */}
      <div
        className="rounded-2xl p-8 text-primary-foreground shadow-[var(--shadow-elegant)]"
        style={{ background: "var(--gradient-hero)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
          A3 MARKETING TEAM SERVICE REQUEST
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
          Creative Intake Request
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85">
          Tell us about your project. The more context you share — audience, goals,
          deliverables, and timing — the faster our team can scope and start your
          request.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-foreground/20">
            <div
              className="h-full rounded-full bg-primary-foreground transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary-foreground/90">
            {completion}% complete
          </span>
        </div>
      </div>

      {/* 1. Requester */}
      <SectionCard step={1} title="Requester" description="Who is submitting this request.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="requestedBy" required>
              Requested By
            </FieldLabel>
            <Input
              id="requestedBy"
              value={data.requestedBy}
              onChange={(e) => set("requestedBy", e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="requestorJobFunction" required>
              Requestor Job Function
            </FieldLabel>
            <Select
              value={data.requestorJobFunction}
              onValueChange={(v) => set("requestorJobFunction", v)}
            >
              <SelectTrigger id="requestorJobFunction">
                <SelectValue placeholder="Select your job function" />
              </SelectTrigger>
              <SelectContent className="[&_[role=option]]:focus:bg-sky-400/20 [&_[role=option]]:focus:text-foreground [&_[role=option][data-highlighted]]:bg-sky-400/20 [&_[role=option][data-highlighted]]:text-foreground">
                <SelectItem value="Executive Leadership">Executive Leadership</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Information Technology">Information Technology</SelectItem>
                <SelectItem value="Legal & Compliance">Legal & Compliance</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Claims">Claims</SelectItem>
                <SelectItem value="Underwriting">Underwriting</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border bg-muted/30 p-4">
          <FieldLabel>Please address these possible blockers to your request.</FieldLabel>
          <ul className="space-y-2">
            <li className="flex items-center gap-3">
              <Checkbox id="task-recent" />
              <label htmlFor="task-recent" className="text-sm text-foreground cursor-pointer">
                Most recent task
              </label>
            </li>
            <li className="flex items-center gap-3">
              <Checkbox id="task-previous" />
              <label htmlFor="task-previous" className="text-sm text-foreground cursor-pointer">
                Previous task
              </label>
            </li>
            <li className="flex items-center gap-3">
              <Checkbox id="task-attention" className="border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground" />
              <label htmlFor="task-attention" className="text-sm font-medium text-destructive cursor-pointer">
                Task needs attention
              </label>
            </li>
          </ul>
        </div>
      </SectionCard>

      {/* 2. General information */}
      <SectionCard
        step={2}
        title="General information"
        description="Pick the type of communication and add any high-level context."
      >
        <div className="space-y-3">
          <FieldLabel required>Communication Type</FieldLabel>
          <ChoiceCards
            name="communicationType"
            value={data.communicationType}
            onChange={(v) => set("communicationType", v)}
            options={[
              {
                value: "Corporate Communications",
                label: "Corporate Communications",
                description: "Internal messaging, leadership updates, and company news.",
              },
              {
                value: "Brand Creative Services",
                label: "Brand Creative Services",
                description: "Marketing campaigns, creative assets, and brand work.",
              },
            ]}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="generalAdditionalInfo">Additional Information</FieldLabel>
          <Textarea
            id="generalAdditionalInfo"
            rows={4}
            value={data.generalAdditionalInfo}
            onChange={(e) => set("generalAdditionalInfo", e.target.value)}
            placeholder="Anything else our team should know upfront?"
          />
        </div>
      </SectionCard>

      {/* 3. Background & project details */}
      <SectionCard
        step={3}
        title="Background and project details"
        description="Help us understand the why and the what."
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="backgroundPurpose" required>
            Background and Business Purposes
          </FieldLabel>
          <Textarea
            id="backgroundPurpose"
            rows={5}
            value={data.backgroundPurpose}
            onChange={(e) => set("backgroundPurpose", e.target.value)}
            placeholder="What's driving this request? What's the business need?"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="projectSummary" required>
            Project Summary
          </FieldLabel>
          <Textarea
            id="projectSummary"
            rows={5}
            value={data.projectSummary}
            onChange={(e) => set("projectSummary", e.target.value)}
            placeholder="Briefly describe what you'd like us to create."
          />
        </div>
      </SectionCard>

      {/* 4. Audience */}
      <SectionCard
        step={4}
        title="Audience"
        description="Who will see or interact with this?"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <FieldLabel hint="Select all internal groups that apply.">
              Internal audience
            </FieldLabel>
            <CheckboxChips
              options={INTERNAL_OPTS}
              values={data.audienceInternal}
              onChange={(v) => set("audienceInternal", v)}
            />
            <Textarea
              rows={3}
              value={data.audienceInternalNotes}
              onChange={(e) => set("audienceInternalNotes", e.target.value)}
              placeholder="Internal audience details (optional)"
            />
          </div>
          <div className="space-y-3">
            <FieldLabel hint="Select all external groups that apply.">
              External audience
            </FieldLabel>
            <CheckboxChips
              options={EXTERNAL_OPTS}
              values={data.audienceExternal}
              onChange={(v) => set("audienceExternal", v)}
            />
            <Textarea
              rows={3}
              value={data.audienceExternalNotes}
              onChange={(e) => set("audienceExternalNotes", e.target.value)}
              placeholder="External audience details (optional)"
            />
          </div>
        </div>
      </SectionCard>

      {/* 5. Deliverables & outcomes */}
      <SectionCard
        step={5}
        title="Deliverables and outcomes"
        description="Define what success looks like."
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="deliverables" required>
            Deliverables
          </FieldLabel>
          <Textarea
            id="deliverables"
            rows={4}
            value={data.deliverables}
            onChange={(e) => set("deliverables", e.target.value)}
            placeholder="List the specific assets you need (e.g., 1 hero banner, 3 social posts, landing page)."
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="goalsExpectations">Goals and Expectations</FieldLabel>
            <Textarea
              id="goalsExpectations"
              rows={4}
              value={data.goalsExpectations}
              onChange={(e) => set("goalsExpectations", e.target.value)}
              placeholder="What outcomes are you hoping for?"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="successMeasurement">Success Measurement</FieldLabel>
            <Textarea
              id="successMeasurement"
              rows={4}
              value={data.successMeasurement}
              onChange={(e) => set("successMeasurement", e.target.value)}
              placeholder="How will you know it worked? KPIs, metrics, etc."
            />
          </div>
        </div>
      </SectionCard>

      {/* 6. Project timing */}
      <SectionCard step={6} title="Project timing" description="When do you need this?">
        <div className="grid gap-5 md:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            <FieldLabel htmlFor="desiredCompletionDate" required>
              Desired Completion Date
            </FieldLabel>
            <Input
              id="desiredCompletionDate"
              type="date"
              value={data.desiredCompletionDate}
              onChange={(e) => set("desiredCompletionDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="timingNotes">Project Timing Information</FieldLabel>
            <Textarea
              id="timingNotes"
              rows={3}
              value={data.timingNotes}
              onChange={(e) => set("timingNotes", e.target.value)}
              placeholder="Key milestones, launch dates, or scheduling constraints."
            />
          </div>
        </div>
      </SectionCard>

      {/* 7. Additional information */}
      <SectionCard
        step={7}
        title="Additional information"
        description="Anything else we should consider?"
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="supplementalDescription">
            Additional Information Description
          </FieldLabel>
          <Textarea
            id="supplementalDescription"
            rows={4}
            value={data.supplementalDescription}
            onChange={(e) => set("supplementalDescription", e.target.value)}
            placeholder="Inspiration, references, brand notes, accessibility requirements…"
          />
        </div>
      </SectionCard>

      {/* 8. Attachments */}
      <SectionCard
        step={8}
        title="Attachments"
        description="Drop in any reference files, briefs, or assets."
      >
        <FileDrop files={files} onChange={setFiles} />
      </SectionCard>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-card/95 backdrop-blur px-5 py-4 shadow-[var(--shadow-card)]">
        <p className="text-xs text-muted-foreground">
          <span className="text-accent">*</span> Required fields •{" "}
          {completion}% complete
        </p>
        <div className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button type="submit" className="min-w-[160px]">
            Submit request
          </Button>
        </div>
      </div>
    </form>
  );
}
