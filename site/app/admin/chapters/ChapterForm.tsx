"use client";

import { useActionState } from "react";
import { upsertChapterAction, type FormState } from "@/lib/actions";
import { Field, TextArea, Select, Notice, FormCard } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";

export default function ChapterForm() {
  const [state, action] = useActionState<FormState, FormData>(upsertChapterAction, {});

  return (
    <FormCard>
      <form action={action}>
        {state.error && <Notice tone="warn">{state.error}</Notice>}
        {state.ok && <Notice tone="ok">{state.ok}</Notice>}

        <Field label="Name" name="name" required placeholder="Dallas–Fort Worth" />
        <Field label="URL slug" name="slug" required placeholder="dallas-fort-worth"
          help="Lowercase, hyphenated. Becomes /chapters/your-slug." />
        <Field label="City" name="city" />
        <Field label="State or region" name="region" />
        <Field label="Meeting schedule" name="meetingSchedule" placeholder="Monthly" />
        <TextArea label="Description" name="description" rows={3} />
        <Select
          label="Status"
          name="status"
          options={[
            { value: "forming", label: "Forming" },
            { value: "active", label: "Active" },
            { value: "dormant", label: "Dormant" },
          ]}
        />
        <SubmitButton>Save chapter</SubmitButton>
      </form>
    </FormCard>
  );
}
