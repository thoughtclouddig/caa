import Link from "next/link";
import { unsubscribeByToken } from "@/lib/actions";
import { PageHero } from "@/components/ui";

export const metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * One click and they are off the list.
 *
 * No sign-in and no "are you sure": the List-Unsubscribe header in every
 * issue promises one-click, and mail clients act on it without a person
 * ever seeing this page. Making the web version harder than the button
 * would be a bait and switch.
 */
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const removed = await unsubscribeByToken(token);

  return (
    <>
      <PageHero
        eyebrow="Newsletter"
        title={removed ? "You Are Unsubscribed" : "That Link Is No Longer Valid"}
        lede={
          removed
            ? "We will not write to you again. Your membership is unaffected, and everything in the member area works exactly as before."
            : "It may have been used already, or the address may have been removed another way. Nothing further is needed."
        }
      >
        <Link className="btn btn--ghost" href="/newsletter">
          Read the Archive
        </Link>
      </PageHero>
    </>
  );
}
