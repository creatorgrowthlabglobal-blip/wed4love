import { useState } from "react";
import { Clock, Sparkles, X } from "lucide-react";

interface UnlockDatePickerProps {
  unlockAt: string | null;
  onChange: (iso: string | null) => void;
}

const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const UnlockDatePicker = ({ unlockAt, onChange }: UnlockDatePickerProps) => {
  const [enabled, setEnabled] = useState(!!unlockAt);
  const [error, setError] = useState("");

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false);
      onChange(null);
      setError("");
    } else {
      setEnabled(true);
    }
  };

  const handleDateChange = (value: string) => {
    if (!value) {
      onChange(null);
      return;
    }
    const date = new Date(value);
    // datetime-local fires onChange with a partial value while the user is
    // still typing a segment (e.g. before the year is fully entered) — that
    // parses to an invalid Date, not just an empty string.
    if (Number.isNaN(date.getTime())) {
      onChange(null);
      return;
    }
    if (date.getTime() <= Date.now()) {
      setError("Pick a date and time in the future.");
      onChange(null);
      return;
    }
    setError("");
    onChange(date.toISOString());
  };

  return (
    <div className="letter-paper rounded-xl p-3.5 sm:p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-elegant-gold" />
          <span className="font-heading text-sm font-semibold">Lock Until a Special Date</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-elegant-gold/15 text-elegant-gold font-body text-[9px] font-bold uppercase tracking-wide">
            <Sparkles className="w-2 h-2" />
            Premium
          </span>
        </div>
        {enabled && (
          <button type="button" onClick={handleToggle} className="text-foreground/40 hover:text-foreground/70" aria-label="Disable">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="font-body text-xs text-muted-foreground mb-2.5">
        Sealed with a countdown until this moment — perfect for an anniversary or midnight surprise.
      </p>

      {!enabled ? (
        <button
          type="button"
          onClick={handleToggle}
          className="w-full py-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors font-body text-xs font-medium text-foreground"
        >
          Add an unlock date
        </button>
      ) : (
        <div>
          <input
            type="datetime-local"
            defaultValue={unlockAt ? toLocalInputValue(unlockAt) : ""}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background/50 text-foreground font-body text-xs outline-none focus:border-primary/50 transition-colors"
          />
          {error && <p className="font-body text-xs text-destructive mt-1.5">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default UnlockDatePicker;
