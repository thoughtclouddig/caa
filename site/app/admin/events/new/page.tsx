import { getActiveChapters } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import EventForm from "@/components/admin/EventForm";

export const metadata = { title: "Add an event" };
export const dynamic = "force-dynamic";

export default async function NewEvent() {
  const chapters = await getActiveChapters();
  return (
    <div className="shell">
      <AdminHeader title="Add an Event" back={{ href: "/admin/events", label: "All events" }} />
      <EventForm chapters={chapters.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
