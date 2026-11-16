import { z } from "zod";
import type { Application, State } from "./model";

export const e01Id = "e01-apply";
const brightLabsId = "10000000-0000-4000-8000-000000000001";
const applyJobId = "20000000-0000-4000-8000-000000000004";
const answer = "Współtworzyłem automatyzację klasyfikacji wiadomości w obsłudze klienta.";
export const e01RoleDescription =
  "W tej roli projektujesz reguły automatyzacji obsługi klienta i sprawdzasz wyniki systemu na przykładach wiadomości.";

export const e01Contribution = [
  {
    id: "contribution",
    question: "Co zrobiłeś sam?",
    quote: "Sam przygotowałem regułę przekazywania pilnych spraw. Zespół wdrożył tę regułę.",
  },
  {
    id: "ai",
    question: "Gdzie użyłeś AI?",
    quote: "AI proponowało kategorię wiadomości.",
  },
  {
    id: "verification",
    question: "Jak sprawdziłeś wynik?",
    quote: "Sprawdziłem wyniki na wcześniej sklasyfikowanej próbce wiadomości.",
  },
];

export const e01Decisions = {
  invite: "Zaproś",
  ask: "Dopytaj",
  close: "Zakończ ocenę",
} as const;
export const e01ReviewSchema = z.object({
  decision: z.enum(["invite", "ask", "close"]),
  fragment: z.enum(["answer", "contribution", "ai", "verification"]),
});
export type E01Review = z.infer<typeof e01ReviewSchema>;
export const e01VariantSchema = z.enum(["standard", "card"]);
export type E01Variant = z.infer<typeof e01VariantSchema>;
export const e01ReviewsSchema = z.object({
  standard: e01ReviewSchema.extend({ fragment: z.literal("answer") }).optional(),
  card: e01ReviewSchema.optional(),
});

export function e01Fragments(variant: E01Variant) {
  const base = [{ id: "answer", quote: answer }];
  return variant === "card" ? [...base, ...e01Contribution] : base;
}

/** A read-only recruiter fixture, available wherever the baseline Apply role is present. */
export function e01Application(
  state: Pick<State, "jobs" | "applications">,
  companyId: string | undefined,
): Application | undefined {
  if (companyId !== brightLabsId || state.applications.some(({ id }) => id === e01Id)) return;
  const job = state.jobs.find(
    ({ id, companyId, category }) =>
      id === applyJobId && companyId === brightLabsId && category === "apply",
  );
  if (!job) return;
  return {
    id: e01Id,
    candidateId: "candidate-e01",
    jobId: job.id,
    companyId: job.companyId,
    jobTitle: "AI Operations Specialist",
    candidateName: "Michał Nowak",
    cv: "Michał Nowak · doświadczenie w projektach automatyzacji obsługi klienta.",
    answer,
    sourceNotes: "",
    generatedAnswer: "",
    score: 72,
    summary: "Fikcyjne zgłoszenie na rolę Apply.",
    stage: "submitted",
    events: [{ stage: "submitted", at: "2026-11-02T09:00:00.000Z", note: "" }],
  };
}
