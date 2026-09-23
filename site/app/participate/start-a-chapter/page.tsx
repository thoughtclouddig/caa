import Link from "next/link";
import { PageHero } from "@/components/ui";

export const metadata = { title: "Start a chapter" };

export default function StartChapterPage() {
  return (
    <>
      <PageHero
        eyebrow="Start a chapter"
        title="Chapters begin with a few people"
        lede="Most chapters start with two or three members who decide to meet regularly. CAA provides the structure; you provide the room and the commitment."
      >
        <Link className="btn btn--primary" href="/contact">Get in touch</Link>
      </PageHero>
      <section className="section shell shell--narrow">
        <p className="prose" style={{ maxWidth: "none" }}>
          Tell us where you are and who is with you. We will help with the practical
          parts: what a first meeting looks like, how to keep it going, and how to
          connect with the wider association.
        </p>
      </section>
    </>
  );
}
