import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [briefFiles, setBriefFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState<{ data: IntakeData; files: File[] } | null>(
    null
  );
  const [attentionModalOpen, setAttentionModalOpen] = useState(false);

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

  // A section is "complete" only when ALL of its fields (required + optional) are filled.
  const sectionComplete = {
    1: Boolean(data.requestedBy && data.requestorJobFunction),
    2: Boolean(data.communicationType && data.generalAdditionalInfo),
    3: Boolean(data.backgroundPurpose && data.projectSummary),
    4: Boolean(
      data.audienceInternal.length > 0 &&
        data.audienceInternalNotes &&
        data.audienceExternal.length > 0 &&
        data.audienceExternalNotes
    ),
    5: Boolean(data.deliverables && data.goalsExpectations && data.successMeasurement),
    6: Boolean(data.desiredCompletionDate && data.timingNotes),
    7: Boolean(data.supplementalDescription),
    8: files.length > 0,
  } as const;

  const sectionUnlocked = {
    2: sectionComplete[1],
    3: sectionComplete[2],
    4: sectionComplete[3],
    5: sectionComplete[4],
    6: sectionComplete[5],
    7: sectionComplete[6],
    8: sectionComplete[7],
  } as const;

  const sectionTitles: Record<number, string> = {
    1: "Requester",
    2: "General info",
    3: "Background",
    4: "Audience",
    5: "Deliverables",
    6: "Timing",
    7: "Additional",
    8: "Attachments",
  };

  const activeStep = (() => {
    for (let i = 1; i <= 8; i++) {
      const unlocked = i === 1 ? true : sectionUnlocked[i as 2 | 3 | 4 | 5 | 6 | 7 | 8];
      if (unlocked && !sectionComplete[i as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8]) return i;
    }
    return 8;
  })();

  const RevealSection = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const prevShow = useRef(show);
    useEffect(() => {
      if (show && !prevShow.current && ref.current) {
        const el = ref.current;
        window.requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      prevShow.current = show;
    }, [show]);
    if (!show) return null;
    return (
      <div ref={ref} className="animate-section-reveal">
        {children}
      </div>
    );
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
      <SectionCard step={1} title="Requester" description="Submit your request by filling out the information below. You can also choose to submit a brief if you have one.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-5">
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
            <div
              className={`space-y-3 rounded-xl border bg-muted/30 p-4 transition-opacity duration-300 ${
                ["Legal & Compliance", "Human Resources", "Operations"].includes(data.requestorJobFunction)
                  ? "opacity-100"
                  : "pointer-events-none hidden opacity-0"
              }`}
            >
              <FieldLabel>Please address these possible blockers:</FieldLabel>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <Checkbox id="task-attention" className="border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground" />
                  <button
                    type="button"
                    onClick={() => setAttentionModalOpen(true)}
                    className="text-sm font-medium text-destructive underline underline-offset-4 hover:opacity-80 cursor-pointer text-left"
                  >
                    Task needs attention
                  </button>
                </li>
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
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <FieldLabel>Upload your creative brief here</FieldLabel>
            <FileDrop files={briefFiles} onChange={setBriefFiles} extraHeight={20} />
            <div className="flex gap-2 sm:justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setBriefFiles([])}>
                Reset
              </Button>
              <Button type="button" className="min-w-[160px]">
                Submit to Workfront
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={attentionModalOpen} onOpenChange={setAttentionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Task needs attention</DialogTitle>
              <DialogDescription>
                You should contact &lt;firstName, lastName&gt; before moving forward with this
                task. You should also fill out an additional explanation if needed.
              </DialogDescription>
            </DialogHeader>
            <Textarea rows={4} placeholder="Additional explanation (optional)" />
          </DialogContent>
        </Dialog>
      </SectionCard>

      {/* 2. General information */}
      <RevealSection show={sectionUnlocked[2]}>
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
      </RevealSection>

      {/* 3. Background & project details */}
      <RevealSection show={sectionUnlocked[3]}>
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
      </RevealSection>

      {/* 4. Audience */}
      <RevealSection show={sectionUnlocked[4]}>
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
      </RevealSection>

      {/* 5. Deliverables & outcomes */}
      <RevealSection show={sectionUnlocked[5]}>
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
      </RevealSection>

      {/* 6. Project timing */}
      <RevealSection show={sectionUnlocked[6]}>
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
      </RevealSection>

      {/* 7. Additional information */}
      <RevealSection show={sectionUnlocked[7]}>
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
      </RevealSection>

      {/* 8. Attachments */}
      <RevealSection show={sectionUnlocked[8]}>
      <SectionCard
        step={8}
        title="Attachments"
        description="Drop in any reference files, briefs, or assets."
      >
        <FileDrop files={files} onChange={setFiles} />
      </SectionCard>
      </RevealSection>

      <div className="sticky bottom-4 z-10 rounded-2xl border bg-card/95 backdrop-blur px-5 py-4 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
            const complete = sectionComplete[step as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8];
            const unlocked = step === 1 ? true : sectionUnlocked[step as 2 | 3 | 4 | 5 | 6 | 7 | 8];
            const isActive = step === activeStep;
            const handleJump = () => {
              if (!unlocked) return;
              const el = document.querySelector(`[data-step="${step}"]`);
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            };
            return (
              <button
                key={step}
                type="button"
                onClick={handleJump}
                disabled={!unlocked}
                title={`Step ${step}: ${sectionTitles[step]}`}
                className={`group flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elegant)] scale-105"
                    : complete
                    ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                    : unlocked
                    ? "border-border bg-background text-muted-foreground hover:text-foreground"
                    : "border-dashed border-border bg-muted/40 text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : complete
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {complete && !isActive ? "✓" : step}
                </span>
                <span className="hidden sm:inline">{sectionTitles[step]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-3">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent">*</span> Step {activeStep} of 8 • {completion}% complete
            </p>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button type="submit" className="min-w-[160px]">
              Submit request
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
