import { CONFIG } from "./config.mjs";

export function tzOffsetForInstant(timeZone, dateUtc) 
{
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false,
    year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", second:"2-digit"
  });
  const parts = Object.fromEntries(dtf.formatToParts(dateUtc).map(p => [p.type, p.value]));
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUTC - dateUtc.getTime()) / 60000);
}

export function resolveLocalToUTC(dateStr, timeZone) 
{
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;
  const [, Y, Mo, D, h="00", mi="00", s="00"] = m;
  let candidate = Date.UTC(+Y, +Mo - 1, +D, +h, +mi, +s);
  for (let i = 0; i < 2; i++) {
    const offsetMin = tzOffsetForInstant(timeZone, new Date(candidate));
    candidate = Date.UTC(+Y, +Mo - 1, +D, +h, +mi, +s) - offsetMin * 60000;
  }
  return new Date(candidate);
}

export function parseDateTime(dateStr) 
{
  if (!dateStr) return null;
  if (/[zZ]$/.test(dateStr) || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d) ? null : d;
  }
  const resolved = resolveLocalToUTC(dateStr, CONFIG.timezoneLocation);
  return resolved && !isNaN(resolved) ? resolved : null;
}