"use client";
import { useActionState } from "react";
import { submitPrayerAction, type FormState } from "@/lib/actions";
import { TextArea, Field, Checkbox, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

export default function PrayerForm() {
  const [state, action] = useActionState<FormState, FormData>(submitPrayerAction, {});
  return (
    <FormCard>
      <form action={action}>
        {state.error && <Notice tone="warn">{state.error}</Notice>}
        {state.ok && <Notice tone="ok">{state.ok}</Notice>}
        <TextArea label="Your intention" name="intention" required rows={3} />
        <Field label="First name to show" name="displayName" help="Leave blank to use your first name." />
        <Checkbox label="Show this publicly once approved" name="isPublic"
          help="Leave this unchecked and CAA prays for the intention without publishing it." />
        <SubmitButton>Send intention</SubmitButton>
      </form>
    </FormCard>
  );
}
