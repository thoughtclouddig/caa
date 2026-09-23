import { PageHero, Rows, Row } from "@/components/ui";

export const metadata = { title: "Participate" };

const ways = [
  { title: "Join, Renew or Register", href: "/participate/join", body: "Register free, or join CAA as a dues-paying member. Free categories for clergy, religious and students." },
  { title: "Donate to CAA", href: "/participate/donate", body: "Giving, kept separate from membership dues." },
  { title: "Starting a Chapter", href: "/participate/start-a-chapter", body: "How a chapter begins, and what headquarters provides." },
  { title: "CAA Product Catalog", href: "/participate/store", body: "Association merchandise." },
];

export default function ParticipatePage() {
  return (
    <>
      <PageHero
        eyebrow="Participate"
        title="Ways to Take Part"
        lede="There are several ways to participate in our apostolate. To begin, register free or join CAA. Once you join, you can join a chapter, form a new chapter and begin recruiting members, or take part as a member at large."
      />
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
