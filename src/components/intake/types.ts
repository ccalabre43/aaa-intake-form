export interface IntakeData {
  requestedBy: string;
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
  "communicationType",
  "backgroundPurpose",
  "projectSummary",
  "deliverables",
  "desiredCompletionDate",
];
