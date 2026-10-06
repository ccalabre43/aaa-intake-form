import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  filename: z.string().max(255),
  text: z.string().max(60_000).optional(),
  pdfBase64: z.string().max(20_000_000).optional(),
  today: z.string().max(20),
});

const STR = { type: "string" };
const FIELDS = {
  communicationType: {
    type: "string",
    enum: ["", "Corporate Communications", "Brand Creative Services"],
  },
  generalAdditionalInfo: STR,
  backgroundPurpose: STR,
  projectSummary: STR,
  audienceInternal: {
    type: "array",
    items: {
      type: "string",
      enum: ["All Associates", "Livonia Associates", "Omaha Associates", "Manager Level and Above"],
    },
  },
  audienceInternalNotes: STR,
  audienceExternal: {
    type: "array",
    items: { type: "string", enum: ["Clubs", "Policy Holders", "Members"] },
  },
  audienceExternalNotes: STR,
  deliverables: STR,
  goalsExpectations: STR,
  successMeasurement: STR,
  desiredCompletionDate: { type: "string", description: "YYYY-MM-DD or empty" },
  timingNotes: STR,
  supplementalDescription: STR,
};

export type BriefFields = Partial<Record<keyof typeof FIELDS, string | string[]>>;
export type BriefResult = { ok: true; fields: BriefFields } | { ok: false; error: string };

export const extractBrief = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => inputSchema.parse(i))
  .handler(async ({ data }): Promise<BriefResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "Brief reading isn't set up yet." };
    if (!data.text && !data.pdfBase64) return { ok: false, error: "That file looks empty." };

    const content: unknown[] = [
      {
        type: "input_text",
        text: `Extract intake form fields from this creative brief ("${data.filename}"). Today is ${data.today}. Use only information present in the brief; use "" or [] when not stated. Keep each field under 1500 characters.${data.text ? `\n\nBRIEF:\n${data.text}` : ""}`,
      },
    ];
    if (data.pdfBase64)
      content.push({
        type: "input_file",
        filename: data.filename,
        file_data: `data:application/pdf;base64,${data.pdfBase64}`,
      });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "brief_fields",
            strict: true,
            schema: {
              type: "object",
              properties: FIELDS,
              required: Object.keys(FIELDS),
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      console.error("AI error", res.status, body);
      if (res.status === 429) return { ok: false, error: "Too many requests right now. Please try again in a minute." };
      if (res.status === 402 || res.status === 403)
        return { ok: false, error: "AI brief reading is unavailable for this workspace right now." };
      return { ok: false, error: "We couldn't read that brief. You can still fill in the form by hand." };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
        } catch {
          /* ignore */
        }
      }
    }

    try {
      return { ok: true, fields: JSON.parse(out) as BriefFields };
    } catch {
      console.error("bad AI output", out.slice(0, 500));
      return { ok: false, error: "We couldn't read that brief. You can still fill in the form by hand." };
    }
  });
