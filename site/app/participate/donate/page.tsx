"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { recordDonationIntentAction, type FormState } from "@/lib/actions";
import { PageHero, Field, TextArea, Select, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

function DonateForm() {
  const params = useSearchParams();
  const amount = params.get("amount") ?? "";
  const tier = params.get("tier") ?? "";
  const [state, action] = useActionState<FormState, FormData>(recordDonationIntentAction, {});

  return (
    <>
      <PageHero
        eyebrow="Donate"
        title="Giving to CAA"
        lede="Gifts are separate from membership dues. They pay for the chapters, the formation and the daily work of the association."
      />

      <section className="section shell">
        <Notice tone="warn">
          Payment processing is not connected yet. CAA has a contract with a processor
          separate from eCatholic, and we need access to that account before anything
          can actually be charged. Until then this form records the intent only.
        </Notice>

        <FormCard>
          <form action={action}>
            {state.error && <Notice tone="warn">{state.error}</Notice>}
            {state.ok && <Notice tone="ok">{state.ok}</Notice>}

            <Field label="Amount (USD)" name="amount" type="number" required placeholder="50" defaultValue={amount} />
            <Select
              label="What the gift is for"
              name="kind"
              defaultValue={tier ? "dues" : "gift"}
              options={[
                { value: "gift", label: "Wherever it is needed most" },
                { value: "chapter_support", label: "Chapter support" },
                { value: "scholarship", label: "Scholarship fund" },
                { value: "dues", label: "Membership dues" },
              ]}
            />
            <Field label="Your name" name="donorName" autoComplete="name" />
            <Field label="Email" name="donorEmail" type="email" autoComplete="email" />
            <TextArea label="Note (optional)" name="note" rows={3} />

            <SubmitButton>Record my intent to give</SubmitButton>
          </form>
        </FormCard>
      </section>
    </>
  );
}

/**
 * useSearchParams needs a Suspense boundary, because the page is
 * prerendered and the query string is only known in the browser.
 */
export default function DonatePage() {
  return (
    <Suspense fallback={null}>
      <DonateForm />
    </Suspense>
  );
}
