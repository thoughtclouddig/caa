"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/lib/actions";
import { Field, Select, Checkbox, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

type Props = {
  user: {
    name: string;
    aviationRole: string | null;
    locationSlug: string | null;
    designation: "none" | "clergy" | "religious" | "student";
    designationVerified: boolean;
    chapterId: number | null;
    showInDirectory: boolean;
  };
  chapters: { id: number; name: string }[];
  locations: { slug: string; label: string }[];
};

export default function ProfileForm({ user, chapters, locations }: Props) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});

  return (
    <FormCard>
      <form action={action}>
        {state.error && <Notice tone="warn">{state.error}</Notice>}
        {state.ok && <Notice tone="ok">{state.ok}</Notice>}

        <Field label="Name" name="name" defaultValue={user.name} required />
        <Field label="Your role in aviation" name="aviationRole" defaultValue={user.aviationRole}
          placeholder="Pilot, mechanic, controller, cabin crew, student…" />
        <Select
          label="Nearest city"
          name="locationSlug"
          defaultValue={user.locationSlug ?? ""}
          options={[
            { value: "", label: "Rather not say" },
            ...locations.map((l) => ({ value: l.slug, label: l.label })),
          ]}
          help="Pick the listed place nearest you. CAA never asks for or stores your address; this is only what puts a mark on the member map."
        />

        <Select
          label="Are you clergy, religious, or a student?"
          name="designation"
          defaultValue={user.designation}
          options={[
            { value: "none", label: "None of these" },
            { value: "clergy", label: "Clergy" },
            { value: "religious", label: "Religious" },
            { value: "student", label: "Student" },
          ]}
          help={
            user.designationVerified
              ? "Confirmed by CAA. Membership is free for everyone, so this is recognition rather than a rate."
              : "Membership is free for everyone, so this is recognition rather than a rate. CAA confirms it before it is shown."
          }
        />

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
          help="Signed-in members would see your name, your role and your city. Never your address or your email."
        />

        <SubmitButton>Save</SubmitButton>
      </form>
    </FormCard>
  );
}
