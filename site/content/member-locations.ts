/**
 * The places a member can say they are near.
 *
 * Members choose from this list rather than typing an address, and the
 * association stores the choice, not where anyone actually lives. The map
 * of members is therefore a picture of CAA's reach and not a way to find
 * somebody's house, which is the right trade for a membership body holding
 * data about its own people.
 *
 * Nothing here is geocoded at runtime. No mapping or address service is
 * called, on this site or at sign-up.
 *
 * Coordinates are city centres, verified against the Census state
 * boundaries by scripts/verify-locations.ts, which fails if any entry does
 * not fall inside the state it claims. Run it after editing this file.
 *
 * To add a place: add an entry, run the verifier, deploy. Keep the list
 * sorted by label.
 */

export type MemberLocation = {
  slug: string;
  /** Shown in menus and in the member directory. */
  label: string;
  /** Full state name, matching the Census spelling the verifier uses. */
  region: string | null;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Chosen by members who are not near anything listed, or who are outside
 * the United States. They appear in the directory and are counted, but
 * carry no pin, exactly as an unpinned chapter does.
 */
export const ELSEWHERE_SLUG = "elsewhere";

export const MEMBER_LOCATIONS: MemberLocation[] = [
  { slug: "albuquerque-nm", label: "Albuquerque, New Mexico", region: "New Mexico", latitude: 35.0844, longitude: -106.6504 },
  { slug: "anchorage-ak", label: "Anchorage, Alaska", region: "Alaska", latitude: 61.2181, longitude: -149.9003 },
  { slug: "atlanta-ga", label: "Atlanta, Georgia", region: "Georgia", latitude: 33.749, longitude: -84.388 },
  { slug: "austin-tx", label: "Austin, Texas", region: "Texas", latitude: 30.2672, longitude: -97.7431 },
  { slug: "baltimore-md", label: "Baltimore, Maryland", region: "Maryland", latitude: 39.2904, longitude: -76.6122 },
  { slug: "birmingham-al", label: "Birmingham, Alabama", region: "Alabama", latitude: 33.5186, longitude: -86.8104 },
  { slug: "boise-id", label: "Boise, Idaho", region: "Idaho", latitude: 43.615, longitude: -116.2023 },
  { slug: "boston-ma", label: "Boston, Massachusetts", region: "Massachusetts", latitude: 42.3601, longitude: -71.0589 },
  { slug: "buffalo-ny", label: "Buffalo, New York", region: "New York", latitude: 42.8864, longitude: -78.8784 },
  { slug: "burlington-vt", label: "Burlington, Vermont", region: "Vermont", latitude: 44.4759, longitude: -73.2121 },
  { slug: "charleston-sc", label: "Charleston, South Carolina", region: "South Carolina", latitude: 32.7765, longitude: -79.9311 },
  { slug: "charlotte-nc", label: "Charlotte, North Carolina", region: "North Carolina", latitude: 35.2271, longitude: -80.8431 },
  { slug: "chicago-il", label: "Chicago, Illinois", region: "Illinois", latitude: 41.8781, longitude: -87.6298 },
  { slug: "cincinnati-oh", label: "Cincinnati, Ohio", region: "Ohio", latitude: 39.1031, longitude: -84.512 },
  { slug: "cleveland-oh", label: "Cleveland, Ohio", region: "Ohio", latitude: 41.4993, longitude: -81.6944 },
  { slug: "colorado-springs-co", label: "Colorado Springs, Colorado", region: "Colorado", latitude: 38.8339, longitude: -104.8214 },
  { slug: "columbus-oh", label: "Columbus, Ohio", region: "Ohio", latitude: 39.9612, longitude: -82.9988 },
  { slug: "dallas-tx", label: "Dallas–Fort Worth, Texas", region: "Texas", latitude: 32.7767, longitude: -96.797 },
  { slug: "dayton-oh", label: "Dayton, Ohio", region: "Ohio", latitude: 39.7589, longitude: -84.1916 },
  { slug: "denver-co", label: "Denver, Colorado", region: "Colorado", latitude: 39.7392, longitude: -104.9903 },
  { slug: "des-moines-ia", label: "Des Moines, Iowa", region: "Iowa", latitude: 41.5868, longitude: -93.625 },
  { slug: "detroit-mi", label: "Detroit, Michigan", region: "Michigan", latitude: 42.3314, longitude: -83.0458 },
  { slug: "el-paso-tx", label: "El Paso, Texas", region: "Texas", latitude: 31.7619, longitude: -106.485 },
  { slug: "fargo-nd", label: "Fargo, North Dakota", region: "North Dakota", latitude: 46.8772, longitude: -96.7898 },
  { slug: "grand-rapids-mi", label: "Grand Rapids, Michigan", region: "Michigan", latitude: 42.9634, longitude: -85.6681 },
  { slug: "hartford-ct", label: "Hartford, Connecticut", region: "Connecticut", latitude: 41.7658, longitude: -72.6734 },
  { slug: "honolulu-hi", label: "Honolulu, Hawaii", region: "Hawaii", latitude: 21.3069, longitude: -157.8583 },
  { slug: "houston-tx", label: "Houston, Texas", region: "Texas", latitude: 29.7604, longitude: -95.3698 },
  { slug: "indianapolis-in", label: "Indianapolis, Indiana", region: "Indiana", latitude: 39.7684, longitude: -86.1581 },
  { slug: "jacksonville-fl", label: "Jacksonville, Florida", region: "Florida", latitude: 30.3322, longitude: -81.6557 },
  { slug: "kansas-city-mo", label: "Kansas City, Missouri", region: "Missouri", latitude: 39.0997, longitude: -94.5786 },
  { slug: "knoxville-tn", label: "Knoxville, Tennessee", region: "Tennessee", latitude: 35.9606, longitude: -83.9207 },
  { slug: "las-vegas-nv", label: "Las Vegas, Nevada", region: "Nevada", latitude: 36.1699, longitude: -115.1398 },
  { slug: "lexington-ky", label: "Lexington, Kentucky", region: "Kentucky", latitude: 38.0406, longitude: -84.5037 },
  { slug: "little-rock-ar", label: "Little Rock, Arkansas", region: "Arkansas", latitude: 34.7465, longitude: -92.2896 },
  { slug: "los-angeles-ca", label: "Los Angeles, California", region: "California", latitude: 34.0522, longitude: -118.2437 },
  { slug: "louisville-ky", label: "Louisville, Kentucky", region: "Kentucky", latitude: 38.2527, longitude: -85.7585 },
  { slug: "memphis-tn", label: "Memphis, Tennessee", region: "Tennessee", latitude: 35.1495, longitude: -90.049 },
  { slug: "miami-fl", label: "Miami, Florida", region: "Florida", latitude: 25.7617, longitude: -80.1918 },
  { slug: "milwaukee-wi", label: "Milwaukee, Wisconsin", region: "Wisconsin", latitude: 43.0389, longitude: -87.9065 },
  { slug: "minneapolis-mn", label: "Minneapolis–Saint Paul, Minnesota", region: "Minnesota", latitude: 44.9778, longitude: -93.265 },
  { slug: "nashville-tn", label: "Nashville, Tennessee", region: "Tennessee", latitude: 36.1627, longitude: -86.7816 },
  { slug: "new-orleans-la", label: "New Orleans, Louisiana", region: "Louisiana", latitude: 29.9511, longitude: -90.0715 },
  { slug: "new-york-ny", label: "New York, New York", region: "New York", latitude: 40.7128, longitude: -74.006 },
  { slug: "norfolk-va", label: "Norfolk, Virginia", region: "Virginia", latitude: 36.8508, longitude: -76.2859 },
  { slug: "oklahoma-city-ok", label: "Oklahoma City, Oklahoma", region: "Oklahoma", latitude: 35.4676, longitude: -97.5164 },
  { slug: "omaha-ne", label: "Omaha, Nebraska", region: "Nebraska", latitude: 41.2565, longitude: -95.9345 },
  { slug: "orlando-fl", label: "Orlando, Florida", region: "Florida", latitude: 28.5383, longitude: -81.3792 },
  { slug: "philadelphia-pa", label: "Philadelphia, Pennsylvania", region: "Pennsylvania", latitude: 39.9526, longitude: -75.1652 },
  { slug: "phoenix-az", label: "Phoenix, Arizona", region: "Arizona", latitude: 33.4484, longitude: -112.074 },
  { slug: "pittsburgh-pa", label: "Pittsburgh, Pennsylvania", region: "Pennsylvania", latitude: 40.4406, longitude: -79.9959 },
  { slug: "portland-me", label: "Portland, Maine", region: "Maine", latitude: 43.6591, longitude: -70.2568 },
  { slug: "portland-or", label: "Portland, Oregon", region: "Oregon", latitude: 45.5152, longitude: -122.6784 },
  { slug: "providence-ri", label: "Providence, Rhode Island", region: "Rhode Island", latitude: 41.824, longitude: -71.4128 },
  { slug: "raleigh-nc", label: "Raleigh–Durham, North Carolina", region: "North Carolina", latitude: 35.7796, longitude: -78.6382 },
  { slug: "richmond-va", label: "Richmond, Virginia", region: "Virginia", latitude: 37.5407, longitude: -77.436 },
  { slug: "sacramento-ca", label: "Sacramento, California", region: "California", latitude: 38.5816, longitude: -121.4944 },
  { slug: "salt-lake-city-ut", label: "Salt Lake City, Utah", region: "Utah", latitude: 40.7608, longitude: -111.891 },
  { slug: "san-antonio-tx", label: "San Antonio, Texas", region: "Texas", latitude: 29.4241, longitude: -98.4936 },
  { slug: "san-diego-ca", label: "San Diego, California", region: "California", latitude: 32.7157, longitude: -117.1611 },
  { slug: "san-francisco-ca", label: "San Francisco Bay Area, California", region: "California", latitude: 37.7749, longitude: -122.4194 },
  { slug: "seattle-wa", label: "Seattle, Washington", region: "Washington", latitude: 47.6062, longitude: -122.3321 },
  { slug: "sioux-falls-sd", label: "Sioux Falls, South Dakota", region: "South Dakota", latitude: 43.5446, longitude: -96.7311 },
  { slug: "spokane-wa", label: "Spokane, Washington", region: "Washington", latitude: 47.6588, longitude: -117.426 },
  { slug: "st-louis-mo", label: "St. Louis, Missouri", region: "Missouri", latitude: 38.627, longitude: -90.1994 },
  { slug: "tampa-fl", label: "Tampa, Florida", region: "Florida", latitude: 27.9506, longitude: -82.4572 },
  { slug: "tucson-az", label: "Tucson, Arizona", region: "Arizona", latitude: 32.2226, longitude: -110.9747 },
  { slug: "tulsa-ok", label: "Tulsa, Oklahoma", region: "Oklahoma", latitude: 36.154, longitude: -95.9928 },
  { slug: "washington-dc", label: "Washington, District of Columbia", region: "District of Columbia", latitude: 38.9072, longitude: -77.0369 },
  { slug: "wichita-ks", label: "Wichita, Kansas", region: "Kansas", latitude: 37.6872, longitude: -97.3301 },
  { slug: "wilmington-de", label: "Wilmington, Delaware", region: "Delaware", latitude: 39.7459, longitude: -75.5466 },
  { slug: "charleston-wv", label: "Charleston, West Virginia", region: "West Virginia", latitude: 38.3498, longitude: -81.6326 },
  { slug: "billings-mt", label: "Billings, Montana", region: "Montana", latitude: 45.7833, longitude: -108.5007 },
  { slug: "cheyenne-wy", label: "Cheyenne, Wyoming", region: "Wyoming", latitude: 41.14, longitude: -104.8202 },
  { slug: "jackson-ms", label: "Jackson, Mississippi", region: "Mississippi", latitude: 32.2988, longitude: -90.1848 },
  { slug: "manchester-nh", label: "Manchester, New Hampshire", region: "New Hampshire", latitude: 42.9956, longitude: -71.4548 },
  { slug: "newark-nj", label: "Newark, New Jersey", region: "New Jersey", latitude: 40.7357, longitude: -74.1724 },
  { slug: "reno-nv", label: "Reno, Nevada", region: "Nevada", latitude: 39.5296, longitude: -119.8138 },

  {
    slug: ELSEWHERE_SLUG,
    label: "Somewhere else, or outside the United States",
    region: null,
    latitude: null,
    longitude: null,
  },
];

export function findMemberLocation(slug: string | null): MemberLocation | undefined {
  if (!slug) return undefined;
  return MEMBER_LOCATIONS.find((l) => l.slug === slug);
}
