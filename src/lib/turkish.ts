/**
 * Turkish character normalization and helper functions
 */

const turkishMap: Record<string, string> = {
  İ: "i",
  I: "i", // In search context, we often want I -> i mapping for ease
  Ş: "s",
  ş: "s",
  Ğ: "g",
  ğ: "g",
  Ü: "u",
  ü: "u",
  Ö: "o",
  ö: "o",
  Ç: "c",
  ç: "c",
};

/**
 * Converts a string to Turkish lowercase.
 * Properly handles İ -> i and I -> ı conversions.
 */
export function toTurkishLowerCase(str: string): string {
  if (!str) return "";
  return str.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

/**
 * Normalizes a string by replacing Turkish characters with their English equivalents.
 * Useful for broad search matching.
 * Example: "İnşaat" -> "insaat", "Çiçek" -> "cicek"
 */
export function normalizeTurkishChars(str: string): string {
  if (!str) return "";
  
  return str
    .split("")
    .map((char) => turkishMap[char] || char)
    .join("")
    .toLowerCase(); // Ensure result is lowercase for case-insensitive comparison
}
