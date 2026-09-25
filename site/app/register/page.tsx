"use client";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions";
import { MEMBER_LOCATIONS } from "@/content/member-locations";
import { PageHero, Field, Select, Checkbox, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

/** The levels, for naming the one being taken out. Kept in step with the seed. */
const LEVELS: Record<string, string> = {
  supporting: "Supporting Member",
  sustaining: "Sustaining Member",
  "founding-patron": "Founding Patron",
  life: "Life Member",
};

function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});
  const tier = useSearchParams().get("tier") ?? "";
  const level = LEVELS[tier];

  return (
    <>
      <PageHero
        eyebrow="Join"
        title={level ? `Join as a ${level}` : "Join CAA"}
        lede={
          level
            ? "This creates your account and records the level you are joining at. CAA will be in touch about dues once the payment processor is connected; nothing is charged today."
            : "Membership is free. This creates your account and makes you a member; there is no second step and nothing to pay."
        }
      />
      <section className="section shell">
        <FormCard>
          <form action={action}>
            {/* Carries the chosen level through registration. */}
            {tier && <input type="hidden" name="tier" value={tier} />}
            {state.error && <Notice tone="warn">{state.error}</Notice>}

            <Field label="Name" name="name" required autoComplete="name" />
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field label="Password" name="password" type="password" required
              autoComplete="new-password" help="At least 10 characters." />

            <Field label="Your role in aviation" name="aviationRole"
              placeholder="Pilot, mechanic, controller, cabin crew, student…"
              help="Optional. It helps other members recognise their own line of work." />

            <Select
              label="Nearest city"
              name="locationSlug"
              options={[
                { value: "", label: "Rather not say" },
                ...MEMBER_LOCATIONS.map((l) => ({ value: l.slug, label: l.label })),
              ]}
              help="Optional. CAA never asks for your address. This is only what puts a mark on the member map, and you can change or clear it any time."
            />

            <Checkbox
              label="Send me the CAA newsletter"
              name="newsletterConsent"
              help="Chapter news and what the association is doing, a few times a year. Unticked by default: joining CAA is not the same as asking to be written to, and you can change this any time. Every issue carries a link to leave."
            />

            <SubmitButton>{level ? `Join as a ${level}` : "Join CAA"}</SubmitButton>
          </form>
          <p className="prose" style={{ marginTop: "1.4rem", fontSize: "0.92rem" }}>
            Already a member? <Link href="/login">Sign in</Link>.
          </p>
        </FormCard>
      </section>
    </>
  );
}

/** useSearchParams needs a Suspense boundary on a prerendered page. */
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
