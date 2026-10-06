import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const fileSchema = z.object({
  name: z.string().max(255),
  type: z.string().max(200),
  base64: z.string().max(36_000_000),
});

const inputSchema = z.object({
  data: z.object({
    requestedBy: z.string().trim().min(2).max(100),
    requestorEmail: z.string().trim().email().max(255),
    requestorJobFunction: z.string().min(1).max(100),
    communicationType: z.string().min(1).max(100),
    generalAdditionalInfo: z.string().max(5000),
    backgroundPurpose: z.string().trim().min(10).max(2000),
    projectSummary: z.string().trim().min(10).max(2000),
    audienceInternal: z.array(z.string().max(100)).max(20),
    audienceInternalNotes: z.string().max(5000),
    audienceExternal: z.array(z.string().max(100)).max(20),
    audienceExternalNotes: z.string().max(5000),
    deliverables: z.string().trim().min(3).max(2000),
    goalsExpectations: z.string().max(5000),
    successMeasurement: z.string().max(5000),
    desiredCompletionDate: z.string().min(1).max(20),
    timingNotes: z.string().max(5000),
    supplementalDescription: z.string().max(5000),
  }),
  files: z.array(fileSchema).max(15),
});

export type SubmitResult =
  | { ok: true; reference: string; workfrontUrl: string | null }
  | { ok: false; error: string };

function describe(d: z.infer<typeof inputSchema>["data"]) {
  const rows: [string, string][] = [
    ["Requested By", d.requestedBy],
    ["Email", d.requestorEmail],
    ["Job Function", d.requestorJobFunction],
    ["Communication Type", d.communicationType],
    ["General Info", d.generalAdditionalInfo],
    ["Background", d.backgroundPurpose],
    ["Internal Audience", d.audienceInternal.join(", ")],
    ["Internal Notes", d.audienceInternalNotes],
    ["External Audience", d.audienceExternal.join(", ")],
    ["External Notes", d.audienceExternalNotes],
    ["Deliverables", d.deliverables],
    ["Goals", d.goalsExpectations],
    ["Success Measurement", d.successMeasurement],
    ["Desired Completion", d.desiredCompletionDate],
    ["Timing Notes", d.timingNotes],
    ["Additional", d.supplementalDescription],
  ];
  return rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n\n");
}

export const submitIntake = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data: input }): Promise<SubmitResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const reference = `A3-${Date.now().toString(36).toUpperCase()}`;

    const attachments: { name: string; path: string }[] = [];
    for (const f of input.files) {
      const bytes = Uint8Array.from(atob(f.base64), (c) => c.charCodeAt(0));
      const path = `${reference}/${f.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabaseAdmin.storage
        .from("intake-attachments")
        .upload(path, bytes, { contentType: f.type || "application/octet-stream" });
      if (error) {
        console.error("upload failed", error);
        return { ok: false, error: `We couldn't upload "${f.name}". Please try again.` };
      }
      attachments.push({ name: f.name, path });
    }

    const { data: row, error } = await supabaseAdmin
      .from("intake_submissions")
      .insert({ reference, data: input.data, attachments })
      .select("id")
      .single();
    if (error || !row) {
      console.error("insert failed", error);
      return { ok: false, error: "We couldn't save your request. Please try again." };
    }

    let workfrontUrl: string | null = null;
    const wfUrl = process.env["WORKFRONT_URL"];
    const wfKey = process.env["WORKFRONT_API_TOKEN"];
    if (wfUrl && wfKey) {
      try {
        const res = await fetch(`${wfUrl}/attask/api/v15.0/optask`, {
          method: "POST",
          headers: { apiKey: wfKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.data.projectSummary.slice(0, 120),
            description: describe(input.data),
          }),
        });
        const json = (await res.json()) as { data?: { ID?: string } };
        const id = json.data?.ID;
        if (res.ok && id) {
          workfrontUrl = `${wfUrl}/issue/${id}/overview`;
          await supabaseAdmin
            .from("intake_submissions")
            .update({ workfront_id: id, status: "sent_to_workfront" })
            .eq("id", row.id);
        } else console.error("workfront error", res.status, json);
      } catch (e) {
        console.error("workfront failed", e);
      }
    }

    return { ok: true, reference, workfrontUrl };
  });
