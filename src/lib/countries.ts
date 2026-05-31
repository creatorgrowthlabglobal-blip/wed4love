export type Country = {
  code: string; // ISO
  name: string;
  dial: string; // without +
  region: "Asia" | "Europe" | "Africa" | "Americas";
  placeholder: string; // local format (no country code)
};

export const COUNTRIES: Country[] = [
  // Asia
  { code: "NP", name: "Nepal", dial: "977", region: "Asia", placeholder: "9845996735" },
  { code: "IN", name: "India", dial: "91", region: "Asia", placeholder: "9876543210" },
  { code: "PK", name: "Pakistan", dial: "92", region: "Asia", placeholder: "3001234567" },
  { code: "BD", name: "Bangladesh", dial: "880", region: "Asia", placeholder: "1712345678" },
  { code: "LK", name: "Sri Lanka", dial: "94", region: "Asia", placeholder: "771234567" },
  { code: "CN", name: "China", dial: "86", region: "Asia", placeholder: "13123456789" },
  { code: "JP", name: "Japan", dial: "81", region: "Asia", placeholder: "9012345678" },
  { code: "KR", name: "South Korea", dial: "82", region: "Asia", placeholder: "1012345678" },
  { code: "ID", name: "Indonesia", dial: "62", region: "Asia", placeholder: "81234567890" },
  { code: "MY", name: "Malaysia", dial: "60", region: "Asia", placeholder: "123456789" },
  { code: "TH", name: "Thailand", dial: "66", region: "Asia", placeholder: "812345678" },
  { code: "PH", name: "Philippines", dial: "63", region: "Asia", placeholder: "9171234567" },
  { code: "VN", name: "Vietnam", dial: "84", region: "Asia", placeholder: "912345678" },
  { code: "SG", name: "Singapore", dial: "65", region: "Asia", placeholder: "81234567" },
  { code: "HK", name: "Hong Kong", dial: "852", region: "Asia", placeholder: "51234567" },
  { code: "MM", name: "Myanmar", dial: "95", region: "Asia", placeholder: "9123456789" },
  { code: "KH", name: "Cambodia", dial: "855", region: "Asia", placeholder: "12345678" },
  { code: "AF", name: "Afghanistan", dial: "93", region: "Asia", placeholder: "701234567" },
  { code: "IR", name: "Iran", dial: "98", region: "Asia", placeholder: "9123456789" },
  { code: "IQ", name: "Iraq", dial: "964", region: "Asia", placeholder: "7912345678" },
  { code: "JO", name: "Jordan", dial: "962", region: "Asia", placeholder: "791234567" },
  { code: "LB", name: "Lebanon", dial: "961", region: "Asia", placeholder: "71123456" },
  { code: "IL", name: "Israel", dial: "972", region: "Asia", placeholder: "501234567" },
  { code: "YE", name: "Yemen", dial: "967", region: "Asia", placeholder: "712345678" },
  { code: "QA", name: "Qatar", dial: "974", region: "Asia", placeholder: "33123456" },
  { code: "KW", name: "Kuwait", dial: "965", region: "Asia", placeholder: "51234567" },
  { code: "BH", name: "Bahrain", dial: "973", region: "Asia", placeholder: "36123456" },
  { code: "OM", name: "Oman", dial: "968", region: "Asia", placeholder: "92123456" },
  { code: "AE", name: "UAE", dial: "971", region: "Asia", placeholder: "501234567" },
  { code: "SA", name: "Saudi Arabia", dial: "966", region: "Asia", placeholder: "512345678" },
  // Europe
  { code: "GB", name: "United Kingdom", dial: "44", region: "Europe", placeholder: "7400123456" },
  { code: "DE", name: "Germany", dial: "49", region: "Europe", placeholder: "1512345678" },
  { code: "FR", name: "France", dial: "33", region: "Europe", placeholder: "612345678" },
  { code: "IT", name: "Italy", dial: "39", region: "Europe", placeholder: "3123456789" },
  { code: "ES", name: "Spain", dial: "34", region: "Europe", placeholder: "612345678" },
  { code: "NL", name: "Netherlands", dial: "31", region: "Europe", placeholder: "612345678" },
  { code: "BE", name: "Belgium", dial: "32", region: "Europe", placeholder: "470123456" },
  { code: "CH", name: "Switzerland", dial: "41", region: "Europe", placeholder: "781234567" },
  { code: "AT", name: "Austria", dial: "43", region: "Europe", placeholder: "6641234567" },
  { code: "SE", name: "Sweden", dial: "46", region: "Europe", placeholder: "701234567" },
  { code: "NO", name: "Norway", dial: "47", region: "Europe", placeholder: "40612345" },
  { code: "DK", name: "Denmark", dial: "45", region: "Europe", placeholder: "20123456" },
  { code: "FI", name: "Finland", dial: "358", region: "Europe", placeholder: "412345678" },
  { code: "PL", name: "Poland", dial: "48", region: "Europe", placeholder: "512345678" },
  { code: "CZ", name: "Czech Republic", dial: "420", region: "Europe", placeholder: "601234567" },
  { code: "HU", name: "Hungary", dial: "36", region: "Europe", placeholder: "201234567" },
  { code: "RO", name: "Romania", dial: "40", region: "Europe", placeholder: "712345678" },
  { code: "BG", name: "Bulgaria", dial: "359", region: "Europe", placeholder: "881234567" },
  { code: "HR", name: "Croatia", dial: "385", region: "Europe", placeholder: "912345678" },
  { code: "RS", name: "Serbia", dial: "381", region: "Europe", placeholder: "601234567" },
  { code: "SI", name: "Slovenia", dial: "386", region: "Europe", placeholder: "31234567" },
  { code: "GR", name: "Greece", dial: "30", region: "Europe", placeholder: "6912345678" },
  { code: "PT", name: "Portugal", dial: "351", region: "Europe", placeholder: "912345678" },
  { code: "IE", name: "Ireland", dial: "353", region: "Europe", placeholder: "851234567" },
  { code: "UA", name: "Ukraine", dial: "380", region: "Europe", placeholder: "501234567" },
  { code: "RU", name: "Russia", dial: "7", region: "Europe", placeholder: "9123456789" },
  // Africa
  { code: "ZA", name: "South Africa", dial: "27", region: "Africa", placeholder: "711234567" },
  { code: "NG", name: "Nigeria", dial: "234", region: "Africa", placeholder: "8021234567" },
  { code: "KE", name: "Kenya", dial: "254", region: "Africa", placeholder: "712345678" },
  { code: "GH", name: "Ghana", dial: "233", region: "Africa", placeholder: "231234567" },
  { code: "EG", name: "Egypt", dial: "20", region: "Africa", placeholder: "1001234567" },
  { code: "MA", name: "Morocco", dial: "212", region: "Africa", placeholder: "612345678" },
  { code: "DZ", name: "Algeria", dial: "213", region: "Africa", placeholder: "551234567" },
  { code: "ET", name: "Ethiopia", dial: "251", region: "Africa", placeholder: "911234567" },
  { code: "TZ", name: "Tanzania", dial: "255", region: "Africa", placeholder: "621234567" },
  { code: "UG", name: "Uganda", dial: "256", region: "Africa", placeholder: "712345678" },
  { code: "ZW", name: "Zimbabwe", dial: "263", region: "Africa", placeholder: "712345678" },
  { code: "ZM", name: "Zambia", dial: "260", region: "Africa", placeholder: "955123456" },
  // Americas
  { code: "US", name: "United States", dial: "1", region: "Americas", placeholder: "(703) 555-1234" },
  { code: "CA", name: "Canada", dial: "1", region: "Americas", placeholder: "(416) 555-1234" },
  { code: "MX", name: "Mexico", dial: "52", region: "Americas", placeholder: "5512345678" },
  { code: "BR", name: "Brazil", dial: "55", region: "Americas", placeholder: "11912345678" },
  { code: "AR", name: "Argentina", dial: "54", region: "Americas", placeholder: "91123456789" },
  { code: "CO", name: "Colombia", dial: "57", region: "Americas", placeholder: "3211234567" },
  { code: "CL", name: "Chile", dial: "56", region: "Americas", placeholder: "912345678" },
  { code: "PE", name: "Peru", dial: "51", region: "Americas", placeholder: "912345678" },
  { code: "VE", name: "Venezuela", dial: "58", region: "Americas", placeholder: "4121234567" },
  { code: "EC", name: "Ecuador", dial: "593", region: "Americas", placeholder: "991234567" },
  { code: "BO", name: "Bolivia", dial: "591", region: "Americas", placeholder: "71234567" },
  { code: "PY", name: "Paraguay", dial: "595", region: "Americas", placeholder: "961456789" },
  { code: "UY", name: "Uruguay", dial: "598", region: "Americas", placeholder: "94231234" },
  { code: "CU", name: "Cuba", dial: "53", region: "Americas", placeholder: "51234567" },
  { code: "GT", name: "Guatemala", dial: "502", region: "Americas", placeholder: "51234567" },
  { code: "SV", name: "El Salvador", dial: "503", region: "Americas", placeholder: "70123456" },
  { code: "HN", name: "Honduras", dial: "504", region: "Americas", placeholder: "91234567" },
  { code: "NI", name: "Nicaragua", dial: "505", region: "Americas", placeholder: "81234567" },
  { code: "CR", name: "Costa Rica", dial: "506", region: "Americas", placeholder: "83123456" },
  { code: "PA", name: "Panama", dial: "507", region: "Americas", placeholder: "61234567" },
  { code: "AU", name: "Australia", dial: "61", region: "Asia", placeholder: "412345678" },
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
