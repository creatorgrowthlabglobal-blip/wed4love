export type Country = {
  code: string; // ISO
  name: string;
  dial: string; // without +
  region: "Asia" | "Europe" | "Africa" | "Americas" | "Oceania";
  placeholder: string; // local format (no country code)
  tz: string; // IANA timezone of the country's main/most populous region
};

export const COUNTRIES: Country[] = [
  // ── Asia ──
  { code: "NP", name: "Nepal", dial: "977", region: "Asia", placeholder: "9845996735", tz: "Asia/Kathmandu" },
  { code: "IN", name: "India", dial: "91", region: "Asia", placeholder: "9876543210", tz: "Asia/Kolkata" },
  { code: "PK", name: "Pakistan", dial: "92", region: "Asia", placeholder: "3001234567", tz: "Asia/Karachi" },
  { code: "BD", name: "Bangladesh", dial: "880", region: "Asia", placeholder: "1712345678", tz: "Asia/Dhaka" },
  { code: "LK", name: "Sri Lanka", dial: "94", region: "Asia", placeholder: "771234567", tz: "Asia/Colombo" },
  { code: "BT", name: "Bhutan", dial: "975", region: "Asia", placeholder: "17123456", tz: "Asia/Thimphu" },
  { code: "MV", name: "Maldives", dial: "960", region: "Asia", placeholder: "7712345", tz: "Indian/Maldives" },
  { code: "CN", name: "China", dial: "86", region: "Asia", placeholder: "13123456789", tz: "Asia/Shanghai" },
  { code: "TW", name: "Taiwan", dial: "886", region: "Asia", placeholder: "912345678", tz: "Asia/Taipei" },
  { code: "JP", name: "Japan", dial: "81", region: "Asia", placeholder: "9012345678", tz: "Asia/Tokyo" },
  { code: "KR", name: "South Korea", dial: "82", region: "Asia", placeholder: "1012345678", tz: "Asia/Seoul" },
  { code: "KP", name: "North Korea", dial: "850", region: "Asia", placeholder: "1912345678", tz: "Asia/Pyongyang" },
  { code: "MN", name: "Mongolia", dial: "976", region: "Asia", placeholder: "88123456", tz: "Asia/Ulaanbaatar" },
  { code: "ID", name: "Indonesia", dial: "62", region: "Asia", placeholder: "81234567890", tz: "Asia/Jakarta" },
  { code: "MY", name: "Malaysia", dial: "60", region: "Asia", placeholder: "123456789", tz: "Asia/Kuala_Lumpur" },
  { code: "TH", name: "Thailand", dial: "66", region: "Asia", placeholder: "812345678", tz: "Asia/Bangkok" },
  { code: "PH", name: "Philippines", dial: "63", region: "Asia", placeholder: "9171234567", tz: "Asia/Manila" },
  { code: "VN", name: "Vietnam", dial: "84", region: "Asia", placeholder: "912345678", tz: "Asia/Ho_Chi_Minh" },
  { code: "SG", name: "Singapore", dial: "65", region: "Asia", placeholder: "81234567", tz: "Asia/Singapore" },
  { code: "HK", name: "Hong Kong", dial: "852", region: "Asia", placeholder: "51234567", tz: "Asia/Hong_Kong" },
  { code: "MO", name: "Macau", dial: "853", region: "Asia", placeholder: "61234567", tz: "Asia/Macau" },
  { code: "MM", name: "Myanmar", dial: "95", region: "Asia", placeholder: "9123456789", tz: "Asia/Yangon" },
  { code: "KH", name: "Cambodia", dial: "855", region: "Asia", placeholder: "12345678", tz: "Asia/Phnom_Penh" },
  { code: "LA", name: "Laos", dial: "856", region: "Asia", placeholder: "2012345678", tz: "Asia/Vientiane" },
  { code: "BN", name: "Brunei", dial: "673", region: "Asia", placeholder: "7123456", tz: "Asia/Brunei" },
  { code: "TL", name: "Timor-Leste", dial: "670", region: "Asia", placeholder: "77212345", tz: "Asia/Dili" },
  { code: "AF", name: "Afghanistan", dial: "93", region: "Asia", placeholder: "701234567", tz: "Asia/Kabul" },
  { code: "IR", name: "Iran", dial: "98", region: "Asia", placeholder: "9123456789", tz: "Asia/Tehran" },
  { code: "IQ", name: "Iraq", dial: "964", region: "Asia", placeholder: "7912345678", tz: "Asia/Baghdad" },
  { code: "SY", name: "Syria", dial: "963", region: "Asia", placeholder: "944567890", tz: "Asia/Damascus" },
  { code: "JO", name: "Jordan", dial: "962", region: "Asia", placeholder: "791234567", tz: "Asia/Amman" },
  { code: "LB", name: "Lebanon", dial: "961", region: "Asia", placeholder: "71123456", tz: "Asia/Beirut" },
  { code: "IL", name: "Israel", dial: "972", region: "Asia", placeholder: "501234567", tz: "Asia/Jerusalem" },
  { code: "PS", name: "Palestine", dial: "970", region: "Asia", placeholder: "599123456", tz: "Asia/Gaza" },
  { code: "TR", name: "Turkey", dial: "90", region: "Asia", placeholder: "5321234567", tz: "Europe/Istanbul" },
  { code: "YE", name: "Yemen", dial: "967", region: "Asia", placeholder: "712345678", tz: "Asia/Aden" },
  { code: "QA", name: "Qatar", dial: "974", region: "Asia", placeholder: "33123456", tz: "Asia/Qatar" },
  { code: "KW", name: "Kuwait", dial: "965", region: "Asia", placeholder: "51234567", tz: "Asia/Kuwait" },
  { code: "BH", name: "Bahrain", dial: "973", region: "Asia", placeholder: "36123456", tz: "Asia/Bahrain" },
  { code: "OM", name: "Oman", dial: "968", region: "Asia", placeholder: "92123456", tz: "Asia/Muscat" },
  { code: "AE", name: "UAE", dial: "971", region: "Asia", placeholder: "501234567", tz: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", dial: "966", region: "Asia", placeholder: "512345678", tz: "Asia/Riyadh" },
  { code: "GE", name: "Georgia", dial: "995", region: "Asia", placeholder: "555123456", tz: "Asia/Tbilisi" },
  { code: "AM", name: "Armenia", dial: "374", region: "Asia", placeholder: "77123456", tz: "Asia/Yerevan" },
  { code: "AZ", name: "Azerbaijan", dial: "994", region: "Asia", placeholder: "401234567", tz: "Asia/Baku" },
  { code: "KZ", name: "Kazakhstan", dial: "7", region: "Asia", placeholder: "7712345678", tz: "Asia/Almaty" },
  { code: "UZ", name: "Uzbekistan", dial: "998", region: "Asia", placeholder: "912345678", tz: "Asia/Tashkent" },
  { code: "KG", name: "Kyrgyzstan", dial: "996", region: "Asia", placeholder: "700123456", tz: "Asia/Bishkek" },
  { code: "TJ", name: "Tajikistan", dial: "992", region: "Asia", placeholder: "917123456", tz: "Asia/Dushanbe" },
  { code: "TM", name: "Turkmenistan", dial: "993", region: "Asia", placeholder: "66123456", tz: "Asia/Ashgabat" },

  // ── Europe ──
  { code: "GB", name: "United Kingdom", dial: "44", region: "Europe", placeholder: "7400123456", tz: "Europe/London" },
  { code: "IE", name: "Ireland", dial: "353", region: "Europe", placeholder: "851234567", tz: "Europe/Dublin" },
  { code: "DE", name: "Germany", dial: "49", region: "Europe", placeholder: "1512345678", tz: "Europe/Berlin" },
  { code: "FR", name: "France", dial: "33", region: "Europe", placeholder: "612345678", tz: "Europe/Paris" },
  { code: "IT", name: "Italy", dial: "39", region: "Europe", placeholder: "3123456789", tz: "Europe/Rome" },
  { code: "ES", name: "Spain", dial: "34", region: "Europe", placeholder: "612345678", tz: "Europe/Madrid" },
  { code: "PT", name: "Portugal", dial: "351", region: "Europe", placeholder: "912345678", tz: "Europe/Lisbon" },
  { code: "NL", name: "Netherlands", dial: "31", region: "Europe", placeholder: "612345678", tz: "Europe/Amsterdam" },
  { code: "BE", name: "Belgium", dial: "32", region: "Europe", placeholder: "470123456", tz: "Europe/Brussels" },
  { code: "LU", name: "Luxembourg", dial: "352", region: "Europe", placeholder: "628123456", tz: "Europe/Luxembourg" },
  { code: "CH", name: "Switzerland", dial: "41", region: "Europe", placeholder: "781234567", tz: "Europe/Zurich" },
  { code: "AT", name: "Austria", dial: "43", region: "Europe", placeholder: "6641234567", tz: "Europe/Vienna" },
  { code: "LI", name: "Liechtenstein", dial: "423", region: "Europe", placeholder: "7901234", tz: "Europe/Vaduz" },
  { code: "MC", name: "Monaco", dial: "377", region: "Europe", placeholder: "612345678", tz: "Europe/Monaco" },
  { code: "AD", name: "Andorra", dial: "376", region: "Europe", placeholder: "312345", tz: "Europe/Andorra" },
  { code: "SM", name: "San Marino", dial: "378", region: "Europe", placeholder: "66661212", tz: "Europe/San_Marino" },
  { code: "VA", name: "Vatican City", dial: "379", region: "Europe", placeholder: "0669881000", tz: "Europe/Vatican" },
  { code: "MT", name: "Malta", dial: "356", region: "Europe", placeholder: "96961234", tz: "Europe/Malta" },
  { code: "CY", name: "Cyprus", dial: "357", region: "Europe", placeholder: "96123456", tz: "Asia/Nicosia" },
  { code: "GI", name: "Gibraltar", dial: "350", region: "Europe", placeholder: "57123456", tz: "Europe/Gibraltar" },
  { code: "SE", name: "Sweden", dial: "46", region: "Europe", placeholder: "701234567", tz: "Europe/Stockholm" },
  { code: "NO", name: "Norway", dial: "47", region: "Europe", placeholder: "40612345", tz: "Europe/Oslo" },
  { code: "DK", name: "Denmark", dial: "45", region: "Europe", placeholder: "20123456", tz: "Europe/Copenhagen" },
  { code: "FI", name: "Finland", dial: "358", region: "Europe", placeholder: "412345678", tz: "Europe/Helsinki" },
  { code: "IS", name: "Iceland", dial: "354", region: "Europe", placeholder: "6111234", tz: "Atlantic/Reykjavik" },
  { code: "FO", name: "Faroe Islands", dial: "298", region: "Europe", placeholder: "211234", tz: "Atlantic/Faroe" },
  { code: "EE", name: "Estonia", dial: "372", region: "Europe", placeholder: "51234567", tz: "Europe/Tallinn" },
  { code: "LV", name: "Latvia", dial: "371", region: "Europe", placeholder: "21234567", tz: "Europe/Riga" },
  { code: "LT", name: "Lithuania", dial: "370", region: "Europe", placeholder: "61234567", tz: "Europe/Vilnius" },
  { code: "BY", name: "Belarus", dial: "375", region: "Europe", placeholder: "291234567", tz: "Europe/Minsk" },
  { code: "UA", name: "Ukraine", dial: "380", region: "Europe", placeholder: "501234567", tz: "Europe/Kyiv" },
  { code: "MD", name: "Moldova", dial: "373", region: "Europe", placeholder: "62123456", tz: "Europe/Chisinau" },
  { code: "RU", name: "Russia", dial: "7", region: "Europe", placeholder: "9123456789", tz: "Europe/Moscow" },
  { code: "PL", name: "Poland", dial: "48", region: "Europe", placeholder: "512345678", tz: "Europe/Warsaw" },
  { code: "CZ", name: "Czech Republic", dial: "420", region: "Europe", placeholder: "601234567", tz: "Europe/Prague" },
  { code: "SK", name: "Slovakia", dial: "421", region: "Europe", placeholder: "912123456", tz: "Europe/Bratislava" },
  { code: "HU", name: "Hungary", dial: "36", region: "Europe", placeholder: "201234567", tz: "Europe/Budapest" },
  { code: "RO", name: "Romania", dial: "40", region: "Europe", placeholder: "712345678", tz: "Europe/Bucharest" },
  { code: "BG", name: "Bulgaria", dial: "359", region: "Europe", placeholder: "881234567", tz: "Europe/Sofia" },
  { code: "HR", name: "Croatia", dial: "385", region: "Europe", placeholder: "912345678", tz: "Europe/Zagreb" },
  { code: "RS", name: "Serbia", dial: "381", region: "Europe", placeholder: "601234567", tz: "Europe/Belgrade" },
  { code: "SI", name: "Slovenia", dial: "386", region: "Europe", placeholder: "31234567", tz: "Europe/Ljubljana" },
  { code: "BA", name: "Bosnia & Herzegovina", dial: "387", region: "Europe", placeholder: "61123456", tz: "Europe/Sarajevo" },
  { code: "ME", name: "Montenegro", dial: "382", region: "Europe", placeholder: "67123456", tz: "Europe/Podgorica" },
  { code: "MK", name: "North Macedonia", dial: "389", region: "Europe", placeholder: "72345678", tz: "Europe/Skopje" },
  { code: "AL", name: "Albania", dial: "355", region: "Europe", placeholder: "672123456", tz: "Europe/Tirane" },
  { code: "XK", name: "Kosovo", dial: "383", region: "Europe", placeholder: "44123456", tz: "Europe/Belgrade" },
  { code: "GR", name: "Greece", dial: "30", region: "Europe", placeholder: "6912345678", tz: "Europe/Athens" },

  // ── Africa ──
  { code: "ZA", name: "South Africa", dial: "27", region: "Africa", placeholder: "711234567", tz: "Africa/Johannesburg" },
  { code: "NG", name: "Nigeria", dial: "234", region: "Africa", placeholder: "8021234567", tz: "Africa/Lagos" },
  { code: "KE", name: "Kenya", dial: "254", region: "Africa", placeholder: "712345678", tz: "Africa/Nairobi" },
  { code: "GH", name: "Ghana", dial: "233", region: "Africa", placeholder: "231234567", tz: "Africa/Accra" },
  { code: "EG", name: "Egypt", dial: "20", region: "Africa", placeholder: "1001234567", tz: "Africa/Cairo" },
  { code: "MA", name: "Morocco", dial: "212", region: "Africa", placeholder: "612345678", tz: "Africa/Casablanca" },
  { code: "DZ", name: "Algeria", dial: "213", region: "Africa", placeholder: "551234567", tz: "Africa/Algiers" },
  { code: "TN", name: "Tunisia", dial: "216", region: "Africa", placeholder: "20123456", tz: "Africa/Tunis" },
  { code: "LY", name: "Libya", dial: "218", region: "Africa", placeholder: "912345678", tz: "Africa/Tripoli" },
  { code: "SD", name: "Sudan", dial: "249", region: "Africa", placeholder: "911234567", tz: "Africa/Khartoum" },
  { code: "SS", name: "South Sudan", dial: "211", region: "Africa", placeholder: "921234567", tz: "Africa/Juba" },
  { code: "ET", name: "Ethiopia", dial: "251", region: "Africa", placeholder: "911234567", tz: "Africa/Addis_Ababa" },
  { code: "ER", name: "Eritrea", dial: "291", region: "Africa", placeholder: "7123456", tz: "Africa/Asmara" },
  { code: "DJ", name: "Djibouti", dial: "253", region: "Africa", placeholder: "77123456", tz: "Africa/Djibouti" },
  { code: "SO", name: "Somalia", dial: "252", region: "Africa", placeholder: "612345678", tz: "Africa/Mogadishu" },
  { code: "TZ", name: "Tanzania", dial: "255", region: "Africa", placeholder: "621234567", tz: "Africa/Dar_es_Salaam" },
  { code: "UG", name: "Uganda", dial: "256", region: "Africa", placeholder: "712345678", tz: "Africa/Kampala" },
  { code: "RW", name: "Rwanda", dial: "250", region: "Africa", placeholder: "721234567", tz: "Africa/Kigali" },
  { code: "BI", name: "Burundi", dial: "257", region: "Africa", placeholder: "79123456", tz: "Africa/Bujumbura" },
  { code: "ZW", name: "Zimbabwe", dial: "263", region: "Africa", placeholder: "712345678", tz: "Africa/Harare" },
  { code: "ZM", name: "Zambia", dial: "260", region: "Africa", placeholder: "955123456", tz: "Africa/Lusaka" },
  { code: "MW", name: "Malawi", dial: "265", region: "Africa", placeholder: "991234567", tz: "Africa/Blantyre" },
  { code: "MZ", name: "Mozambique", dial: "258", region: "Africa", placeholder: "821234567", tz: "Africa/Maputo" },
  { code: "AO", name: "Angola", dial: "244", region: "Africa", placeholder: "923123456", tz: "Africa/Luanda" },
  { code: "NA", name: "Namibia", dial: "264", region: "Africa", placeholder: "811234567", tz: "Africa/Windhoek" },
  { code: "BW", name: "Botswana", dial: "267", region: "Africa", placeholder: "71123456", tz: "Africa/Gaborone" },
  { code: "LS", name: "Lesotho", dial: "266", region: "Africa", placeholder: "50123456", tz: "Africa/Maseru" },
  { code: "SZ", name: "Eswatini", dial: "268", region: "Africa", placeholder: "76123456", tz: "Africa/Mbabane" },
  { code: "MG", name: "Madagascar", dial: "261", region: "Africa", placeholder: "321234567", tz: "Indian/Antananarivo" },
  { code: "MU", name: "Mauritius", dial: "230", region: "Africa", placeholder: "52512345", tz: "Indian/Mauritius" },
  { code: "SC", name: "Seychelles", dial: "248", region: "Africa", placeholder: "2510123", tz: "Indian/Mahe" },
  { code: "KM", name: "Comoros", dial: "269", region: "Africa", placeholder: "3212345", tz: "Indian/Comoro" },
  { code: "RE", name: "Réunion", dial: "262", region: "Africa", placeholder: "692123456", tz: "Indian/Reunion" },
  { code: "SN", name: "Senegal", dial: "221", region: "Africa", placeholder: "771234567", tz: "Africa/Dakar" },
  { code: "GM", name: "Gambia", dial: "220", region: "Africa", placeholder: "3012345", tz: "Africa/Banjul" },
  { code: "GW", name: "Guinea-Bissau", dial: "245", region: "Africa", placeholder: "955012345", tz: "Africa/Bissau" },
  { code: "GN", name: "Guinea", dial: "224", region: "Africa", placeholder: "601123456", tz: "Africa/Conakry" },
  { code: "SL", name: "Sierra Leone", dial: "232", region: "Africa", placeholder: "25123456", tz: "Africa/Freetown" },
  { code: "LR", name: "Liberia", dial: "231", region: "Africa", placeholder: "77123456", tz: "Africa/Monrovia" },
  { code: "CI", name: "Côte d'Ivoire", dial: "225", region: "Africa", placeholder: "0712345678", tz: "Africa/Abidjan" },
  { code: "BF", name: "Burkina Faso", dial: "226", region: "Africa", placeholder: "70123456", tz: "Africa/Ouagadougou" },
  { code: "ML", name: "Mali", dial: "223", region: "Africa", placeholder: "65123456", tz: "Africa/Bamako" },
  { code: "NE", name: "Niger", dial: "227", region: "Africa", placeholder: "93123456", tz: "Africa/Niamey" },
  { code: "TG", name: "Togo", dial: "228", region: "Africa", placeholder: "90123456", tz: "Africa/Lome" },
  { code: "BJ", name: "Benin", dial: "229", region: "Africa", placeholder: "90123456", tz: "Africa/Porto-Novo" },
  { code: "MR", name: "Mauritania", dial: "222", region: "Africa", placeholder: "22123456", tz: "Africa/Nouakchott" },
  { code: "CV", name: "Cape Verde", dial: "238", region: "Africa", placeholder: "9123456", tz: "Atlantic/Cape_Verde" },
  { code: "ST", name: "São Tomé & Príncipe", dial: "239", region: "Africa", placeholder: "9812345", tz: "Africa/Sao_Tome" },
  { code: "CM", name: "Cameroon", dial: "237", region: "Africa", placeholder: "671234567", tz: "Africa/Douala" },
  { code: "CF", name: "Central African Republic", dial: "236", region: "Africa", placeholder: "70123456", tz: "Africa/Bangui" },
  { code: "TD", name: "Chad", dial: "235", region: "Africa", placeholder: "63123456", tz: "Africa/Ndjamena" },
  { code: "GA", name: "Gabon", dial: "241", region: "Africa", placeholder: "06123456", tz: "Africa/Libreville" },
  { code: "GQ", name: "Equatorial Guinea", dial: "240", region: "Africa", placeholder: "222123456", tz: "Africa/Malabo" },
  { code: "CG", name: "Congo (Brazzaville)", dial: "242", region: "Africa", placeholder: "061234567", tz: "Africa/Brazzaville" },
  { code: "CD", name: "DR Congo", dial: "243", region: "Africa", placeholder: "991234567", tz: "Africa/Kinshasa" },

  // ── Americas ──
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
  { code: "GY", name: "Guyana", dial: "592", region: "Americas", placeholder: "6091234", tz: "America/Guyana" },
  { code: "SR", name: "Suriname", dial: "597", region: "Americas", placeholder: "7412345", tz: "America/Paramaribo" },
  { code: "GF", name: "French Guiana", dial: "594", region: "Americas", placeholder: "694201234", tz: "America/Cayenne" },
  { code: "CU", name: "Cuba", dial: "53", region: "Americas", placeholder: "51234567", tz: "America/Havana" },
  { code: "DO", name: "Dominican Republic", dial: "1", region: "Americas", placeholder: "(809) 234-5678", tz: "America/Santo_Domingo" },
  { code: "HT", name: "Haiti", dial: "509", region: "Americas", placeholder: "34101234", tz: "America/Port-au-Prince" },
  { code: "PR", name: "Puerto Rico", dial: "1", region: "Americas", placeholder: "(787) 234-5678", tz: "America/Puerto_Rico" },
  { code: "JM", name: "Jamaica", dial: "1", region: "Americas", placeholder: "(876) 234-5678", tz: "America/Jamaica" },
  { code: "TT", name: "Trinidad & Tobago", dial: "1", region: "Americas", placeholder: "(868) 234-5678", tz: "America/Port_of_Spain" },
  { code: "BS", name: "Bahamas", dial: "1", region: "Americas", placeholder: "(242) 234-5678", tz: "America/Nassau" },
  { code: "BB", name: "Barbados", dial: "1", region: "Americas", placeholder: "(246) 234-5678", tz: "America/Barbados" },
  { code: "GD", name: "Grenada", dial: "1", region: "Americas", placeholder: "(473) 234-5678", tz: "America/Grenada" },
  { code: "LC", name: "Saint Lucia", dial: "1", region: "Americas", placeholder: "(758) 234-5678", tz: "America/St_Lucia" },
  { code: "VC", name: "St Vincent & Grenadines", dial: "1", region: "Americas", placeholder: "(784) 234-5678", tz: "America/St_Vincent" },
  { code: "KN", name: "Saint Kitts & Nevis", dial: "1", region: "Americas", placeholder: "(869) 234-5678", tz: "America/St_Kitts" },
  { code: "AG", name: "Antigua & Barbuda", dial: "1", region: "Americas", placeholder: "(268) 234-5678", tz: "America/Antigua" },
  { code: "DM", name: "Dominica", dial: "1", region: "Americas", placeholder: "(767) 234-5678", tz: "America/Dominica" },
  { code: "KY", name: "Cayman Islands", dial: "1", region: "Americas", placeholder: "(345) 234-5678", tz: "America/Cayman" },
  { code: "BM", name: "Bermuda", dial: "1", region: "Americas", placeholder: "(441) 234-5678", tz: "Atlantic/Bermuda" },
  { code: "VI", name: "US Virgin Islands", dial: "1", region: "Americas", placeholder: "(340) 234-5678", tz: "America/St_Thomas" },
  { code: "VG", name: "British Virgin Islands", dial: "1", region: "Americas", placeholder: "(284) 234-5678", tz: "America/Tortola" },
  { code: "AW", name: "Aruba", dial: "297", region: "Americas", placeholder: "5601234", tz: "America/Aruba" },
  { code: "CW", name: "Curaçao", dial: "599", region: "Americas", placeholder: "95181234", tz: "America/Curacao" },
  { code: "GT", name: "Guatemala", dial: "502", region: "Americas", placeholder: "51234567", tz: "America/Guatemala" },
  { code: "SV", name: "El Salvador", dial: "503", region: "Americas", placeholder: "70123456", tz: "America/El_Salvador" },
  { code: "HN", name: "Honduras", dial: "504", region: "Americas", placeholder: "91234567", tz: "America/Tegucigalpa" },
  { code: "NI", name: "Nicaragua", dial: "505", region: "Americas", placeholder: "81234567", tz: "America/Managua" },
  { code: "CR", name: "Costa Rica", dial: "506", region: "Americas", placeholder: "83123456", tz: "America/Costa_Rica" },
  { code: "PA", name: "Panama", dial: "507", region: "Americas", placeholder: "61234567", tz: "America/Panama" },
  { code: "BZ", name: "Belize", dial: "501", region: "Americas", placeholder: "6221234", tz: "America/Belize" },
  { code: "GL", name: "Greenland", dial: "299", region: "Americas", placeholder: "221234", tz: "America/Godthab" },

  // ── Oceania ──
  { code: "AU", name: "Australia", dial: "61", region: "Oceania", placeholder: "412345678", tz: "Australia/Sydney" },
  { code: "NZ", name: "New Zealand", dial: "64", region: "Oceania", placeholder: "211234567", tz: "Pacific/Auckland" },
  { code: "FJ", name: "Fiji", dial: "679", region: "Oceania", placeholder: "7012345", tz: "Pacific/Fiji" },
  { code: "PG", name: "Papua New Guinea", dial: "675", region: "Oceania", placeholder: "70123456", tz: "Pacific/Port_Moresby" },
  { code: "SB", name: "Solomon Islands", dial: "677", region: "Oceania", placeholder: "7412345", tz: "Pacific/Guadalcanal" },
  { code: "VU", name: "Vanuatu", dial: "678", region: "Oceania", placeholder: "5912345", tz: "Pacific/Efate" },
  { code: "NC", name: "New Caledonia", dial: "687", region: "Oceania", placeholder: "751234", tz: "Pacific/Noumea" },
  { code: "PF", name: "French Polynesia", dial: "689", region: "Oceania", placeholder: "87123456", tz: "Pacific/Tahiti" },
  { code: "WS", name: "Samoa", dial: "685", region: "Oceania", placeholder: "7212345", tz: "Pacific/Apia" },
  { code: "TO", name: "Tonga", dial: "676", region: "Oceania", placeholder: "7715123", tz: "Pacific/Tongatapu" },
  { code: "KI", name: "Kiribati", dial: "686", region: "Oceania", placeholder: "72001234", tz: "Pacific/Tarawa" },
  { code: "TV", name: "Tuvalu", dial: "688", region: "Oceania", placeholder: "901234", tz: "Pacific/Funafuti" },
  { code: "NR", name: "Nauru", dial: "674", region: "Oceania", placeholder: "5551234", tz: "Pacific/Nauru" },
  { code: "FM", name: "Micronesia", dial: "691", region: "Oceania", placeholder: "3501234", tz: "Pacific/Pohnpei" },
  { code: "MH", name: "Marshall Islands", dial: "692", region: "Oceania", placeholder: "2351234", tz: "Pacific/Majuro" },
  { code: "PW", name: "Palau", dial: "680", region: "Oceania", placeholder: "6201234", tz: "Pacific/Palau" },
  { code: "CK", name: "Cook Islands", dial: "682", region: "Oceania", placeholder: "71234", tz: "Pacific/Rarotonga" },
  { code: "NU", name: "Niue", dial: "683", region: "Oceania", placeholder: "4002", tz: "Pacific/Niue" },
  { code: "GU", name: "Guam", dial: "1", region: "Oceania", placeholder: "(671) 300-1234", tz: "Pacific/Guam" },
  { code: "AS", name: "American Samoa", dial: "1", region: "Oceania", placeholder: "(684) 733-1234", tz: "Pacific/Pago_Pago" },
  { code: "MP", name: "Northern Mariana Islands", dial: "1", region: "Oceania", placeholder: "(670) 234-5678", tz: "Pacific/Saipan" },
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
