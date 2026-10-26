// The handful of facts the Privacy Policy and Terms of Service need that
// only the person running the app can supply. Fill these in once here and
// both pages (and the links to them) pick them up.
export const LEGAL = {
  appName: "GymonSTARs",
  /** Person or company that operates the app, e.g. "Jane Doe" or "Acme Fitness LLC". */
  operatorName: "Jason Strang",
  /** Where people send privacy requests and abuse reports. Must be an inbox someone reads. */
  contactEmail: "jasondstrang@icloud.com",
  /** State/country whose laws govern the Terms, e.g. "the State of Alabama, USA". */
  governingLaw: "the State of South Carolina, USA",
  /** Youngest age allowed to use the app. */
  minimumAge: 13,
  effectiveDate: "October 26, 2026",
} as const;
