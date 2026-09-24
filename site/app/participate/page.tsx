import { PageHero, CardGrid, LinkCard } from "@/components/ui";

export const metadata = { title: "Participate" };

const ways = [
  { title: "Come Follow Me", href: "/participate/come-follow-me", body: "What it is to respond to grace, and what CAA gathers into one place." },
  { title: "Join, Renew or Register", href: "/participate/join", body: "Membership is free. The support levels above it are voluntary, and none of them buys anything a free member does not already have." },
  { title: "Donate to CAA", href: "/participate/donate", body: "Giving, kept separate from membership dues." },
  { title: "Starting a Chapter", href: "/participate/start-a-chapter", body: "The four steps, and what headquarters sends you." },
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
        <CardGrid>
          {ways.map((w) => (
            <LinkCard key={w.href} title={w.title} href={w.href} body={w.body} />
          ))}
        </CardGrid>
      </section>
    </>
  );
}
