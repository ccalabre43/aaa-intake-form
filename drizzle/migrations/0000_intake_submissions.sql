CREATE TABLE public.intake_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'received',
  workfront_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.intake_submissions TO service_role;
ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;