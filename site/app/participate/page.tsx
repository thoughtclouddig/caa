import { PageHero, Rows, Row } from "@/components/ui";

export const metadata = { title: "Participate" };

const ways = [
  { title: "Join or renew", href: "/participate/join", body: "Membership tiers, including the free categories for clergy, religious and students." },
  { title: "Donate", href: "/participate/donate", body: "Giving, kept separate from membership dues." },
  { title: "Start a chapter", href: "/participate/start-a-chapter", body: "How a chapter begins, and what CAA provides." },
  { title: "CAA Store", href: "/participate/store", body: "Association merchandise." },
];

export default function ParticipatePage() {
  return (
    <>
      <PageHero eyebrow="Participate" title="Ways to take part" />
      <section className="section shell">
        <Rows>
          {ways.map((w) => (
            <Row key={w.href} title={w.title} href={w.href}><p>{w.body}</p></Row>
          ))}
        </Rows>
      </section>
    </>
  );
}
