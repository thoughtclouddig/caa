import "server-only";

/**
 * The day's Mass readings and liturgical day.
 *
 * Citations only, never the text. A reference like "Luke 9:18-22" is a
 * fact about which passage the lectionary assigns; the translated text of
 * that passage is copyrighted by the USCCB, so the site links there for
 * the words rather than reproducing them.
 *
 * Two sources, both open and both fetched on the server. Server-side
 * matters: the visitor's browser never talks to either, so reading this
 * page tells nobody outside CAA that a particular person opened it.
 *
 * Everything here degrades. If a source is slow or down the page still
 * renders and says what is missing, because a saint's day is not worth a
 * five hundred error.
 */

const READINGS_API = "https://cpbjr.github.io/catholic-readings-api/readings";
const CALENDAR_API = "http://calapi.inadiutorium.cz/api/v0/en/calendars/default";

/** Cached for six hours: the lectionary does not change during a day. */
const REVALIDATE = 60 * 60 * 6;
const TIMEOUT_MS = 4000;

export type DayReadings = {
  firstReading?: string;
  psalm?: string;
  secondReading?: string;
  gospel?: string;
  season?: string;
  /** Where the text itself lives. */
  usccbLink?: string;
};

export type LiturgicalDay = {
  title?: string;
  colour?: string;
  rank?: string;
  season?: string;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // A missing saint's day is not worth failing the page over.
    return null;
  }
}

export async function getReadings(date = new Date()): Promise<DayReadings | null> {
  const year = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  type Payload = {
    season?: string;
    usccbLink?: string;
    readings?: Record<string, string>;
  };

  const data = await getJson<Payload>(`${READINGS_API}/${year}/${mm}-${dd}.json`);
  if (!data?.readings) return null;

  return {
    firstReading: data.readings.firstReading,
    psalm: data.readings.psalm,
    secondReading: data.readings.secondReading,
    gospel: data.readings.gospel,
    season: data.season,
    usccbLink: data.usccbLink,
  };
}

export async function getLiturgicalDay(date = new Date()): Promise<LiturgicalDay | null> {
  const path = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  type Payload = {
    season?: string;
    celebrations?: { title?: string; colour?: string; rank?: string }[];
  };

  const data = await getJson<Payload>(`${CALENDAR_API}/${path}`);
  const first = data?.celebrations?.[0];
  if (!first) return null;

  return {
    title: first.title,
    colour: first.colour,
    rank: first.rank,
    season: data?.season,
  };
}
