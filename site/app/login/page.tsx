"use client";
import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type FormState } from "@/lib/actions";
import { PageHero, Field, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, action] = useActionState<FormState, FormData>(signInAction, {});

  return (
    <>
      <PageHero eyebrow="Member login" title="Sign in" />
      <section className="section shell">
        <FormCard>
          <form action={action}>
            {state.error && <Notice tone="warn">{state.error}</Notice>}
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field label="Password" name="password" type="password" required autoComplete="current-password" />
            <SubmitButton>Sign in</SubmitButton>
          </form>
          <p className="prose" style={{ marginTop: "1.4rem", fontSize: "0.92rem" }}>
            No account yet? <Link href="/register">Register</Link>.
          </p>
        </FormCard>
      </section>
    </>
  );
}
