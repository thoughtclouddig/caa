"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/lib/actions";
import { Field, Select, Checkbox, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

type Props = {
  user: {
    name: string;
    aviationRole: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    chapterId: number | null;
    showInDirectory: boolean;
  };
  chapters: { id: number; name: string }[];
};

export default function ProfileForm({ user, chapters }: Props) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});

  return (
    <FormCard>
      <form action={action}>
        {state.error && <Notice tone="warn">{state.error}</Notice>}
        {state.ok && <Notice tone="ok">{state.ok}</Notice>}

        <Field label="Name" name="name" defaultValue={user.name} required />
        <Field label="Your role in aviation" name="aviationRole" defaultValue={user.aviationRole}
          placeholder="Pilot, mechanic, controller, cabin crew, student…" />
        <Field label="City" name="city" defaultValue={user.city} />
        <Field label="State or region" name="region" defaultValue={user.region} />
        <Field label="Country" name="country" defaultValue={user.country} />

        <Select
          label="Chapter"
          name="chapterId"
          defaultValue={user.chapterId ? String(user.chapterId) : ""}
          options={[
            { value: "", label: "Not in a chapter" },
            ...chapters.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
        />

        <Checkbox
          label="List me in the member directory"
          name="showInDirectory"
          defaultChecked={user.showInDirectory}
          help="Other signed-in members would see your name, role and city. Never your address or email."
        />

        <SubmitButton>Save</SubmitButton>
      </form>
    </FormCard>
  );
}
