"use client";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions";
import { PageHero, Field, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

export default function RegisterPage() {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});

  return (
    <>
      <PageHero
        eyebrow="Register"
        title="Create an account"
        lede="An account lets you use the member area. Dues and membership tiers are handled separately."
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
              placeholder="Pilot, mechanic, controller, cabin crew, student…" />
            <Field label="City" name="city" />
            <Field label="Country" name="country" />
            <SubmitButton>Create account</SubmitButton>
          </form>
          <p className="prose" style={{ marginTop: "1.4rem", fontSize: "0.92rem" }}>
            Already registered? <Link href="/login">Sign in</Link>.
          </p>
        </FormCard>
      </section>
    </>
  );
}
