const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

// "Mon 2 Nov"
export function formatDate(value) {
  return dateFormat.format(new Date(value)).replace(",", "");
}

// workout length: "58 min", "1 h 04 min"
export function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
}

// rest between sets: "1:30"
export function formatRest(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// "6 240 kg" (thin grouping, whole kg)
export function formatKg(kg) {
  return `${Math.round(kg).toLocaleString("en-US").replace(/,/g, " ")} kg`;
}
