import { notFound } from "next/navigation";
import { adminGetEvent, getActiveChapters } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import EventForm from "@/components/admin/EventForm";

export const metadata = { title: "Edit event" };
export const dynamic = "force-dynamic";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, chapters] = await Promise.all([
    adminGetEvent(Number(id)),
    getActiveChapters(),
  ]);
  if (!event) notFound();

  return (
    <div className="shell">
      <AdminHeader title="Edit Event" back={{ href: "/admin/events", label: "All events" }} />
      <EventForm event={event} chapters={chapters.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
