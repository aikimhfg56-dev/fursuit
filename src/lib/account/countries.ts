/**
 * ISO 3166-1 alpha-2 codes Stripe expects for Customer addresses. Kept in
 * English regardless of site locale, matching common international
 * checkout convention. Trimmed to markets relevant to this shop rather
 * than the full ~250-country ISO list.
 */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czechia" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "SG", name: "Singapore" },
  { code: "KR", name: "South Korea" },
  { code: "OTHER", name: "Other" },
];
