import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { IntakeForm } from "@/components/intake/IntakeForm";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "A3 Creative Intake | AAA Life" },
      {
        name: "description",
        content:
          "Submit a creative services request to the A3 team — capture audience, deliverables, timing, and assets in one form.",
      },
      { property: "og:title", content: "A3 Creative Intake | AAA Life" },
      {
        property: "og:description",
        content: "Submit a creative services request to the A3 team.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <IntakeForm />
      </div>
      <Toaster richColors position="top-center" />
    </main>
  );
}
