"use client";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions";
import { MEMBER_LOCATIONS } from "@/content/member-locations";
import { PageHero, Field, Select, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

export default function RegisterPage() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});

  return (
    <>
      <PageHero
        eyebrow="Join"
        title="Join CAA"
        lede="Membership is free. This creates your account and makes you a member; there is no second step and nothing to pay."
      />
      <section className="section shell">
        <FormCard>
          <form action={action}>
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

            <SubmitButton>Join CAA</SubmitButton>
          </form>
          <p className="prose" style={{ marginTop: "1.4rem", fontSize: "0.92rem" }}>
            Already a member? <Link href="/login">Sign in</Link>.
          </p>
        </FormCard>
      </section>
    </>
  );
}
