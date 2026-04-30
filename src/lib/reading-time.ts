const WPM = 200;

export function estimateReadingTime(html: string): { minutes: number; words: number } {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return { minutes: 0, words: 0 };
  const words = text.split(" ").length;
  const minutes = Math.max(1, Math.round(words / WPM));
  return { minutes, words };
}
