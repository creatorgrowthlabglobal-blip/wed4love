export type Country = {
  code: string; // ISO
  name: string;
  dial: string; // without +
  region: "Asia" | "Europe" | "Africa" | "Americas";
  placeholder: string; // local format (no country code)
  tz: string; // IANA timezone of the country's main/most populous region
};

export const COUNTRIES: Country[] = [
  // Asia
  { code: "NP", name: "Nepal", dial: "977", region: "Asia", placeholder: "9845996735", tz: "Asia/Kathmandu" },
  { code: "IN", name: "India", dial: "91", region: "Asia", placeholder: "9876543210", tz: "Asia/Kolkata" },
  { code: "PK", name: "Pakistan", dial: "92", region: "Asia", placeholder: "3001234567", tz: "Asia/Karachi" },
  { code: "BD", name: "Bangladesh", dial: "880", region: "Asia", placeholder: "1712345678", tz: "Asia/Dhaka" },
  { code: "LK", name: "Sri Lanka", dial: "94", region: "Asia", placeholder: "771234567", tz: "Asia/Colombo" },
  { code: "CN", name: "China", dial: "86", region: "Asia", placeholder: "13123456789", tz: "Asia/Shanghai" },
  { code: "JP", name: "Japan", dial: "81", region: "Asia", placeholder: "9012345678", tz: "Asia/Tokyo" },
  { code: "KR", name: "South Korea", dial: "82", region: "Asia", placeholder: "1012345678", tz: "Asia/Seoul" },
  { code: "ID", name: "Indonesia", dial: "62", region: "Asia", placeholder: "81234567890", tz: "Asia/Jakarta" },
  { code: "MY", name: "Malaysia", dial: "60", region: "Asia", placeholder: "123456789", tz: "Asia/Kuala_Lumpur" },
  { code: "TH", name: "Thailand", dial: "66", region: "Asia", placeholder: "812345678", tz: "Asia/Bangkok" },
  { code: "PH", name: "Philippines", dial: "63", region: "Asia", placeholder: "9171234567", tz: "Asia/Manila" },
  { code: "VN", name: "Vietnam", dial: "84", region: "Asia", placeholder: "912345678", tz: "Asia/Ho_Chi_Minh" },
  { code: "SG", name: "Singapore", dial: "65", region: "Asia", placeholder: "81234567", tz: "Asia/Singapore" },
  { code: "HK", name: "Hong Kong", dial: "852", region: "Asia", placeholder: "51234567", tz: "Asia/Hong_Kong" },
  { code: "MM", name: "Myanmar", dial: "95", region: "Asia", placeholder: "9123456789", tz: "Asia/Yangon" },
  { code: "KH", name: "Cambodia", dial: "855", region: "Asia", placeholder: "12345678", tz: "Asia/Phnom_Penh" },
  { code: "AF", name: "Afghanistan", dial: "93", region: "Asia", placeholder: "701234567", tz: "Asia/Kabul" },
  { code: "IR", name: "Iran", dial: "98", region: "Asia", placeholder: "9123456789", tz: "Asia/Tehran" },
  { code: "IQ", name: "Iraq", dial: "964", region: "Asia", placeholder: "7912345678", tz: "Asia/Baghdad" },
  { code: "JO", name: "Jordan", dial: "962", region: "Asia", placeholder: "791234567", tz: "Asia/Amman" },
  { code: "LB", name: "Lebanon", dial: "961", region: "Asia", placeholder: "71123456", tz: "Asia/Beirut" },
  { code: "IL", name: "Israel", dial: "972", region: "Asia", placeholder: "501234567", tz: "Asia/Jerusalem" },
  { code: "YE", name: "Yemen", dial: "967", region: "Asia", placeholder: "712345678", tz: "Asia/Aden" },
  { code: "QA", name: "Qatar", dial: "974", region: "Asia", placeholder: "33123456", tz: "Asia/Qatar" },
  { code: "KW", name: "Kuwait", dial: "965", region: "Asia", placeholder: "51234567", tz: "Asia/Kuwait" },
  { code: "BH", name: "Bahrain", dial: "973", region: "Asia", placeholder: "36123456", tz: "Asia/Bahrain" },
  { code: "OM", name: "Oman", dial: "968", region: "Asia", placeholder: "92123456", tz: "Asia/Muscat" },
  { code: "AE", name: "UAE", dial: "971", region: "Asia", placeholder: "501234567", tz: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", dial: "966", region: "Asia", placeholder: "512345678", tz: "Asia/Riyadh" },
  // Europe
  { code: "GB", name: "United Kingdom", dial: "44", region: "Europe", placeholder: "7400123456", tz: "Europe/London" },
  { code: "DE", name: "Germany", dial: "49", region: "Europe", placeholder: "1512345678", tz: "Europe/Berlin" },
  { code: "FR", name: "France", dial: "33", region: "Europe", placeholder: "612345678", tz: "Europe/Paris" },
  { code: "IT", name: "Italy", dial: "39", region: "Europe", placeholder: "3123456789", tz: "Europe/Rome" },
  { code: "ES", name: "Spain", dial: "34", region: "Europe", placeholder: "612345678", tz: "Europe/Madrid" },
  { code: "NL", name: "Netherlands", dial: "31", region: "Europe", placeholder: "612345678", tz: "Europe/Amsterdam" },
  { code: "BE", name: "Belgium", dial: "32", region: "Europe", placeholder: "470123456", tz: "Europe/Brussels" },
  { code: "CH", name: "Switzerland", dial: "41", region: "Europe", placeholder: "781234567", tz: "Europe/Zurich" },
  { code: "AT", name: "Austria", dial: "43", region: "Europe", placeholder: "6641234567", tz: "Europe/Vienna" },
  { code: "SE", name: "Sweden", dial: "46", region: "Europe", placeholder: "701234567", tz: "Europe/Stockholm" },
  { code: "NO", name: "Norway", dial: "47", region: "Europe", placeholder: "40612345", tz: "Europe/Oslo" },
  { code: "DK", name: "Denmark", dial: "45", region: "Europe", placeholder: "20123456", tz: "Europe/Copenhagen" },
  { code: "FI", name: "Finland", dial: "358", region: "Europe", placeholder: "412345678", tz: "Europe/Helsinki" },
  { code: "PL", name: "Poland", dial: "48", region: "Europe", placeholder: "512345678", tz: "Europe/Warsaw" },
  { code: "CZ", name: "Czech Republic", dial: "420", region: "Europe", placeholder: "601234567", tz: "Europe/Prague" },
  { code: "HU", name: "Hungary", dial: "36", region: "Europe", placeholder: "201234567", tz: "Europe/Budapest" },
  { code: "RO", name: "Romania", dial: "40", region: "Europe", placeholder: "712345678", tz: "Europe/Bucharest" },
  { code: "BG", name: "Bulgaria", dial: "359", region: "Europe", placeholder: "881234567", tz: "Europe/Sofia" },
  { code: "HR", name: "Croatia", dial: "385", region: "Europe", placeholder: "912345678", tz: "Europe/Zagreb" },
  { code: "RS", name: "Serbia", dial: "381", region: "Europe", placeholder: "601234567", tz: "Europe/Belgrade" },
  { code: "SI", name: "Slovenia", dial: "386", region: "Europe", placeholder: "31234567", tz: "Europe/Ljubljana" },
  { code: "GR", name: "Greece", dial: "30", region: "Europe", placeholder: "6912345678", tz: "Europe/Athens" },
  { code: "PT", name: "Portugal", dial: "351", region: "Europe", placeholder: "912345678", tz: "Europe/Lisbon" },
  { code: "IE", name: "Ireland", dial: "353", region: "Europe", placeholder: "851234567", tz: "Europe/Dublin" },
  { code: "UA", name: "Ukraine", dial: "380", region: "Europe", placeholder: "501234567", tz: "Europe/Kyiv" },
  { code: "RU", name: "Russia", dial: "7", region: "Europe", placeholder: "9123456789", tz: "Europe/Moscow" },
  // Africa
  { code: "ZA", name: "South Africa", dial: "27", region: "Africa", placeholder: "711234567", tz: "Africa/Johannesburg" },
  { code: "NG", name: "Nigeria", dial: "234", region: "Africa", placeholder: "8021234567", tz: "Africa/Lagos" },
  { code: "KE", name: "Kenya", dial: "254", region: "Africa", placeholder: "712345678", tz: "Africa/Nairobi" },
  { code: "GH", name: "Ghana", dial: "233", region: "Africa", placeholder: "231234567", tz: "Africa/Accra" },
  { code: "EG", name: "Egypt", dial: "20", region: "Africa", placeholder: "1001234567", tz: "Africa/Cairo" },
  { code: "MA", name: "Morocco", dial: "212", region: "Africa", placeholder: "612345678", tz: "Africa/Casablanca" },
  { code: "DZ", name: "Algeria", dial: "213", region: "Africa", placeholder: "551234567", tz: "Africa/Algiers" },
  { code: "ET", name: "Ethiopia", dial: "251", region: "Africa", placeholder: "911234567", tz: "Africa/Addis_Ababa" },
  { code: "TZ", name: "Tanzania", dial: "255", region: "Africa", placeholder: "621234567", tz: "Africa/Dar_es_Salaam" },
  { code: "UG", name: "Uganda", dial: "256", region: "Africa", placeholder: "712345678", tz: "Africa/Kampala" },
  { code: "ZW", name: "Zimbabwe", dial: "263", region: "Africa", placeholder: "712345678", tz: "Africa/Harare" },
  { code: "ZM", name: "Zambia", dial: "260", region: "Africa", placeholder: "955123456", tz: "Africa/Lusaka" },
  // Americas
  { code: "US", name: "United States", dial: "1", region: "Americas", placeholder: "(703) 555-1234", tz: "America/New_York" },
  { code: "CA", name: "Canada", dial: "1", region: "Americas", placeholder: "(416) 555-1234", tz: "America/Toronto" },
  { code: "MX", name: "Mexico", dial: "52", region: "Americas", placeholder: "5512345678", tz: "America/Mexico_City" },
  { code: "BR", name: "Brazil", dial: "55", region: "Americas", placeholder: "11912345678", tz: "America/Sao_Paulo" },
  { code: "AR", name: "Argentina", dial: "54", region: "Americas", placeholder: "91123456789", tz: "America/Argentina/Buenos_Aires" },
  { code: "CO", name: "Colombia", dial: "57", region: "Americas", placeholder: "3211234567", tz: "America/Bogota" },
  { code: "CL", name: "Chile", dial: "56", region: "Americas", placeholder: "912345678", tz: "America/Santiago" },
  { code: "PE", name: "Peru", dial: "51", region: "Americas", placeholder: "912345678", tz: "America/Lima" },
  { code: "VE", name: "Venezuela", dial: "58", region: "Americas", placeholder: "4121234567", tz: "America/Caracas" },
  { code: "EC", name: "Ecuador", dial: "593", region: "Americas", placeholder: "991234567", tz: "America/Guayaquil" },
  { code: "BO", name: "Bolivia", dial: "591", region: "Americas", placeholder: "71234567", tz: "America/La_Paz" },
  { code: "PY", name: "Paraguay", dial: "595", region: "Americas", placeholder: "961456789", tz: "America/Asuncion" },
  { code: "UY", name: "Uruguay", dial: "598", region: "Americas", placeholder: "94231234", tz: "America/Montevideo" },
  { code: "CU", name: "Cuba", dial: "53", region: "Americas", placeholder: "51234567", tz: "America/Havana" },
  { code: "GT", name: "Guatemala", dial: "502", region: "Americas", placeholder: "51234567", tz: "America/Guatemala" },
  { code: "SV", name: "El Salvador", dial: "503", region: "Americas", placeholder: "70123456", tz: "America/El_Salvador" },
  { code: "HN", name: "Honduras", dial: "504", region: "Americas", placeholder: "91234567", tz: "America/Tegucigalpa" },
  { code: "NI", name: "Nicaragua", dial: "505", region: "Americas", placeholder: "81234567", tz: "America/Managua" },
  { code: "CR", name: "Costa Rica", dial: "506", region: "Americas", placeholder: "83123456", tz: "America/Costa_Rica" },
  { code: "PA", name: "Panama", dial: "507", region: "Americas", placeholder: "61234567", tz: "America/Panama" },
  { code: "AU", name: "Australia", dial: "61", region: "Asia", placeholder: "412345678", tz: "Australia/Sydney" },
];

// Sanitize a user-entered local number:
// - remove all non-digits
// - strip a single leading 0 (common in EU/NP/etc.)
export const sanitizeLocalNumber = (raw: string): string => {
  const digits = raw.replace(/\D+/g, "");
  return digits.replace(/^0+/, "");
};

export const buildE164 = (dial: string, localRaw: string): string => {
  return `+${dial}${sanitizeLocalNumber(localRaw)}`;
};

/**
 * Convert a wall-clock date+time interpreted in `tz` into an absolute UTC Date.
 * Example: zonedWallTimeToUtc(2026, 6, 5, 9, 0, "Europe/Berlin") returns 07:00Z (summer DST).
 */
export const zonedWallTimeToUtc = (
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  tz: string,
): Date => {
  // Naive UTC interpretation of the picked wall time
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  // What that instant looks like when formatted in the target tz
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(new Date(utcGuess)).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const asTz = Date.UTC(
    parseInt(parts.year, 10),
    parseInt(parts.month, 10) - 1,
    parseInt(parts.day, 10),
    parseInt(parts.hour, 10) % 24,
    parseInt(parts.minute, 10),
    parseInt(parts.second, 10),
  );
  const offsetMs = asTz - utcGuess; // tz offset at that instant
  return new Date(utcGuess - offsetMs);
};

/** Short label like "GMT+5:45" for display next to the time picker. */
export const tzOffsetLabel = (tz: string, ref: Date = new Date()): string => {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
  const part = dtf.formatToParts(ref).find((p) => p.type === "timeZoneName");
  return part?.value ?? tz;
};
