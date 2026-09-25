import { adminListMembers } from "@/lib/queries";
import { setMemberRoleAction, setMembershipStatusAction } from "@/lib/actions";
import { AdminHeader, Table, EmptyState, Pill } from "@/components/admin/AdminUI";
import { MEMBERSHIP_STATUS, ROLE, label } from "@/lib/labels";

export const metadata = { title: "Members" };
export const dynamic = "force-dynamic";

const ROLES = [
  { value: "member", label: "Member" },
  { value: "chapter_leader", label: "Chapter leader" },
  { value: "admin", label: "Administrator" },
] as const;

/*
 * Membership is free, so everyone who joins is a member. These describe
 * whether someone also gives, which is why the labels say so plainly
 * rather than using words staff would have to interpret.
 */
const STATUSES = [
  { value: "registered", label: "Member" },
  { value: "active", label: "Member and giving" },
  { value: "lapsed", label: "Gave previously" },
  { value: "honorary", label: "Honorary" },
] as const;

/**
 * Accounts.
 *
 * Role and status are select menus that submit on change rather than rows
 * of buttons: with four statuses and three roles, buttons filled the row
 * with things nobody was about to click.
 */
export default async function AdminMembers() {
  const members = await adminListMembers();

  return (
    <div className="shell">
      <AdminHeader
        title="Members"
        lede="Every account on the site. Administrators can edit everything here; chapter leaders and members cannot reach these screens at all."
      />

      {members.length === 0 ? (
        <EmptyState>No accounts yet.</EmptyState>
      ) : (
        <Table head={["Name", "Email", "Chapter", "Role", "Membership", "Directory"]}>
          {members.map((m) => (
            <tr key={m.id}>
              <td style={{ fontWeight: 600 }}>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.chapterName ?? "Member at large"}</td>
              <td>
                <form action={setMemberRoleAction.bind(null, m.id)}>
                  <select name="role" defaultValue={m.role} className="admin-select">
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <button type="submit" className="admin-apply">Apply</button>
                </form>
              </td>
              <td>
                <form action={setMembershipStatusAction.bind(null, m.id)}>
                  <select name="status" defaultValue={m.membershipStatus} className="admin-select">
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button type="submit" className="admin-apply">Apply</button>
                </form>
              </td>
              <td>
                {m.showInDirectory ? <Pill tone="live">Listed</Pill> : <Pill tone="muted">Hidden</Pill>}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
