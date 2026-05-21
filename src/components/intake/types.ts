import { z } from "zod";

export interface IntakeData {
  requestedBy: string;
  requestorEmail: string;
  requestorJobFunction: string;
  communicationType: string;
  generalAdditionalInfo: string;
  backgroundPurpose: string;
  projectSummary: string;
  audienceInternal: string[];
  audienceInternalNotes: string;
  audienceExternal: string[];
  audienceExternalNotes: string;
  deliverables: string;
  goalsExpectations: string;
  successMeasurement: string;
  desiredCompletionDate: string;
  timingNotes: string;
  supplementalDescription: string;
}

export const initialIntake: IntakeData = {
  requestedBy: "",
  requestorEmail: "",
  requestorJobFunction: "",
  communicationType: "",
  generalAdditionalInfo: "",
  backgroundPurpose: "",
  projectSummary: "",
  audienceInternal: [],
  audienceInternalNotes: "",
  audienceExternal: [],
  audienceExternalNotes: "",
  deliverables: "",
  goalsExpectations: "",
  successMeasurement: "",
  desiredCompletionDate: "",
  timingNotes: "",
  supplementalDescription: "",
};

export const REQUIRED_FIELDS: (keyof IntakeData)[] = [
  "requestedBy",
  "requestorEmail",
  "requestorJobFunction",
  "communicationType",
  "backgroundPurpose",
  "projectSummary",
  "deliverables",
  "desiredCompletionDate",
];

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const intakeSchema = z.object({
  requestedBy: z
    .string()
    .trim()
    .min(2, { message: "Please enter your full name (at least 2 characters)." })
    .max(100, { message: "Name must be 100 characters or fewer." })
    .regex(/^[\p{L}\p{M}'’\-.\s]+$/u, {
      message: "Name can only contain letters, spaces, hyphens, and apostrophes.",
    }),
  requestorEmail: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Enter a valid email address." })
    .max(255, { message: "Email must be 255 characters or fewer." }),
  requestorJobFunction: z.string().min(1, { message: "Select your job function." }),
  communicationType: z.string().min(1, { message: "Choose a communication type." }),
  backgroundPurpose: z
    .string()
    .trim()
    .min(10, { message: "Add a bit more context (at least 10 characters)." })
    .max(2000, { message: "Keep this under 2000 characters." }),
  projectSummary: z
    .string()
    .trim()
    .min(10, { message: "Add a bit more detail (at least 10 characters)." })
    .max(2000, { message: "Keep this under 2000 characters." }),
  deliverables: z
    .string()
    .trim()
    .min(3, { message: "List at least one deliverable." })
    .max(2000, { message: "Keep this under 2000 characters." }),
  desiredCompletionDate: z
    .string()
    .min(1, { message: "Pick a desired completion date." })
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid date." })
    .refine((v) => new Date(v) >= today(), { message: "Date must be today or later." }),
});

export type IntakeErrors = Partial<Record<keyof IntakeData, string>>;

export function validateIntake(data: IntakeData): IntakeErrors {
  const result = intakeSchema.safeParse(data);
  if (result.success) return {};
  const errors: IntakeErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof IntakeData | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
