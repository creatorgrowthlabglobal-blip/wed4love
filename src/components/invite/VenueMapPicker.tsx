import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Local palette ──────────────────────────────────────────────────────────────
const DARK  = "hsl(24 22% 16%)";
const MID   = "hsl(24 12% 42%)";
const LIGHT = "hsl(24 8% 60%)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "0.95rem", fontFamily: "inherit",
  background: "rgba(255,255,255,0.88)", color: DARK, outline: "none",
  borderRadius: 10, border: "1.5px solid hsl(36 28% 72%)",
  transition: "border-color 0.18s, background 0.18s", colorScheme: "light",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em",
  textTransform: "uppercase", color: MID, display: "block", marginBottom: 6,
};

// ── Custom SVG pin (no image assets needed) ────────────────────────────────────
const makeIcon = (color: string) =>
  L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 42" width="28" height="42">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 28 14 28S28 24.5 28 14C28 6.3 21.7 0 14 0z"
        fill="${color}" stroke="white" stroke-width="1.8"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });

// ── Nominatim types ────────────────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
}

// ── Props ──────────────────────────────────────────────────────────────────────
export interface VenueData {
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueLat: number | null;
  venueLng: number | null;
}

interface Props extends VenueData {
  onChange: (patch: Partial<VenueData>) => void;
  accentColor: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
const VenueMapPicker = ({ venueName, venueAddress, venueCity, venueLat, venueLng, onChange, accentColor }: Props) => {
  const mapDivRef   = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<L.Map | null>(null);
  const markerRef   = useRef<L.Marker | null>(null);

  const [query, setQuery]       = useState(venueName);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initialise Leaflet map once ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, { scrollWheelZoom: false }).setView(
      venueLat && venueLng ? [venueLat, venueLng] : [20, 0],
      venueLat && venueLng ? 15 : 2
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (venueLat && venueLng) {
      const m = L.marker([venueLat, venueLng], { icon: makeIcon(accentColor), draggable: true }).addTo(map);
      m.on("dragend", () => reverseGeocode(m.getLatLng().lat, m.getLatLng().lng));
      markerRef.current = m;
    }

    map.on("click", (e: L.LeafletMouseEvent) => reverseGeocode(e.latlng.lat, e.latlng.lng));

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep marker in sync with lat/lng state changes ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!venueLat || !venueLng) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([venueLat, venueLng]);
    } else {
      const m = L.marker([venueLat, venueLng], { icon: makeIcon(accentColor), draggable: true }).addTo(map);
      m.on("dragend", () => reverseGeocode(m.getLatLng().lat, m.getLatLng().lng));
      markerRef.current = m;
    }
    map.setView([venueLat, venueLng], 15, { animate: true });
  }, [venueLat, venueLng]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reverse geocode (click or drag) ─────────────────────────────────────────
  const reverseGeocode = async (lat: number, lng: number) => {
    onChange({ venueLat: lat, venueLng: lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (!data?.address) return;
      const a = data.address;
      const road = [a.house_number, a.road].filter(Boolean).join(" ");
      const city = a.city || a.town || a.village || "";
      const name = data.display_name.split(",")[0];
      onChange({
        venueName: name, venueAddress: road,
        venueCity: [city, a.country].filter(Boolean).join(", "),
        venueLat: lat, venueLng: lng,
      });
      setQuery(name);
    } catch {}
  };

  // ── Nominatim search ─────────────────────────────────────────────────────────
  const search = async (q: string) => {
    if (!q.trim() || q.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSugg(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    onChange({ venueName: val });
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 420);
  };

  const pickSuggestion = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const a = r.address;
    const road = [a?.house_number, a?.road].filter(Boolean).join(" ");
    const city = a?.city || a?.town || a?.village || "";
    const name = r.display_name.split(",")[0];
    setQuery(name);
    setSuggestions([]);
    setShowSugg(false);
    onChange({
      venueName: name, venueAddress: road,
      venueCity: [city, a?.country].filter(Boolean).join(", "),
      venueLat: lat, venueLng: lng,
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* Search with autocomplete */}
      <div>
        <label className="font-body" style={labelStyle}>Search for your venue</label>
        <div className="relative">
          <input
            className="font-body"
            style={inputStyle}
            placeholder="e.g. The Grand Pavilion, Paris"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={e => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.background = "white";
              if (suggestions.length > 0) setShowSugg(true);
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "hsl(36 28% 72%)";
              e.currentTarget.style.background = "rgba(255,255,255,0.88)";
              setTimeout(() => setShowSugg(false), 160);
            }}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: accentColor, borderTopColor: "transparent" }} />
            </div>
          )}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute z-[9999] top-full left-0 right-0 mt-1 rounded-xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid hsl(36 28% 78%)", boxShadow: "0 8px 28px hsl(30 20% 50% / 0.14)" }}>
              {suggestions.map(s => (
                <button key={s.place_id}
                  className="w-full text-left px-4 py-3 font-body text-sm transition-colors border-b last:border-0"
                  style={{ borderColor: "hsl(36 28% 90%)", color: DARK }}
                  onMouseDown={() => pickSuggestion(s)}>
                  <span className="font-semibold block">{s.display_name.split(",")[0]}</span>
                  <span className="text-xs block truncate" style={{ color: LIGHT }}>
                    {s.display_name.split(",").slice(1, 3).join(",").trim()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map container */}
      <div
        ref={mapDivRef}
        className="rounded-2xl overflow-hidden"
        style={{ height: 260, border: "1.5px solid hsl(36 28% 78%)", boxShadow: "0 4px 16px hsl(30 20% 50% / 0.07)" }}
      />

      <p className="font-body text-xs text-center -mt-2" style={{ color: LIGHT }}>
        {venueLat ? "Drag the pin to fine-tune the exact spot" : "Search above or tap the map to drop a pin"}
      </p>

      {/* Manual override fields */}
      <div className="flex flex-col gap-5 pt-1">
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, hsl(36 28% 80%), transparent)" }} />
        {(["Venue Name", "Street Address", "City & Country"] as const).map((lbl, i) => {
          const keys = ["venueName", "venueAddress", "venueCity"] as const;
          const vals = [venueName, venueAddress, venueCity];
          const placeholders = ["The Grand Pavilion", "12 Rose Garden Lane", "Paris, France"];
          return (
            <div key={lbl}>
              <label className="font-body" style={labelStyle}>{lbl}</label>
              <input className="font-body" style={inputStyle}
                placeholder={placeholders[i]} value={vals[i]}
                onChange={e => onChange({ [keys[i]]: e.target.value })}
                onFocus={ev => { ev.currentTarget.style.borderColor = accentColor; ev.currentTarget.style.background = "white"; }}
                onBlur={ev => { ev.currentTarget.style.borderColor = "hsl(36 28% 72%)"; ev.currentTarget.style.background = "rgba(255,255,255,0.88)"; }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VenueMapPicker;
