import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { ApplicationRecord } from "./application-record";
import {
  e01Contribution,
  e01Decisions,
  e01Fragments,
  e01ReviewSchema,
  e01RoleDescription,
  type E01Variant,
} from "./e01";
import type { Application } from "./model";
import { Notice } from "./shell";
import { usePrototype } from "./store";

export function E01ApplicationReview({
  application,
  variant,
}: {
  application: Application;
  variant: E01Variant;
}) {
  const { state, run } = usePrototype();
  const result = state.e01Reviews?.[variant];
  const fragments = e01Fragments(variant);
  const [fragment, setFragment] = useState("");
  const [fragmentError, setFragmentError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const focusResult = useRef(false);

  useEffect(() => {
    if (result && focusResult.current) {
      resultRef.current?.focus();
      focusResult.current = false;
    }
  }, [result]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = e01ReviewSchema.safeParse({ decision: data.get("decision"), fragment });
    if (!parsed.success || !fragments.some(({ id }) => id === fragment)) {
      setFragmentError(true);
      formRef.current?.querySelector<HTMLElement>("#e01-fragment")?.focus();
      return;
    }
    focusResult.current = true;
    if (!(await run({ type: "e01-review", variant, review: parsed.data })))
      focusResult.current = false;
  }

  return (
    <ApplicationRecord
      application={application}
      companyName={state.companies.find(({ id }) => id === application.companyId)?.name ?? ""}
      audience="employer"
      history={application.events}
      backTo={variant === "card" ? "/app/kandydaci?e01=karta" : "/app/kandydaci"}
      answerContext={
        <div className="e01-role">
          <h3>O roli Apply</h3>
          <p>{e01RoleDescription}</p>
        </div>
      }
      answerSupplement={
        variant === "card" && (
          <section className="e01-contribution" aria-labelledby="e01-contribution-heading">
            <h3 id="e01-contribution-heading">Karta własnego wkładu</h3>
            <dl>
              {e01Contribution.map(({ id, question, quote }) => (
                <div key={id}>
                  <dt>{question}</dt>
                  <dd>{quote}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      }
      footer={
        result ? (
          <div className="e01-result">
            <Notice>Ocena zapisana</Notice>
            <h3 ref={resultRef} tabIndex={-1}>
              Następny krok
            </h3>
            <p>{e01Decisions[result.decision]}</p>
            <blockquote>{fragments.find(({ id }) => id === result.fragment)?.quote}</blockquote>
          </div>
        ) : (
          <form className="e01-review" onSubmit={save} ref={formRef}>
            <fieldset>
              <legend>Następny krok</legend>
              <div className="e01-decisions">
                {Object.entries(e01Decisions).map(([value, label]) => (
                  <label key={value}>
                    <input type="radio" name="decision" value={value} required />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="e01-fragment">
              <Label htmlFor="e01-fragment">Fragment zgłoszenia</Label>
              <FormSelect
                id="e01-fragment"
                ariaLabel="Fragment zgłoszenia"
                contentClassName="e01-fragment-options"
                options={fragments.map(({ id, quote }) => ({ value: id, label: quote }))}
                value={fragment}
                onValueChange={(value) => {
                  setFragment(value);
                  setFragmentError(false);
                }}
                placeholder="Wskaż fragment uzasadniający decyzję"
              />
              {fragmentError && <p role="alert">Wskaż fragment zgłoszenia.</p>}
            </div>
            <Button type="submit">Zapisz decyzję</Button>
          </form>
        )
      }
    />
  );
}
