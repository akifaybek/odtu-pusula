export function normalizeSearchQuery(query: string): string {
    if (!query) return "";

    let normalized = query.trim();

    // 1. Format: "CENG 140" -> "CENG140" (Space removal for course codes)
    // Matches "WORD 123" pattern
    const codePattern = /^([a-zA-Z]+)\s+(\d{3})$/;
    if (codePattern.test(normalized)) {
        normalized = normalized.replace(codePattern, "$1$2");
    }

    return normalized;
}

export function generateSearchVariations(query: string): string[] {
    if (!query) return [];

    const variations = new Set<string>();
    const normalized = query.trim();

    variations.add(normalized);
    variations.add(normalized.toLowerCase());
    variations.add(normalized.toUpperCase());

    // "CENG140" -> "CENG 140" (Add space variation)
    const compactPattern = /^([a-zA-Z]+)(\d{3})$/;
    if (compactPattern.test(normalized)) {
        variations.add(normalized.replace(compactPattern, "$1 $2"));
    }

    // "CENG 140" -> "CENG140" (Remove space variation)
    const spacedPattern = /^([a-zA-Z]+)\s+(\d{3})$/;
    if (spacedPattern.test(normalized)) {
        variations.add(normalized.replace(spacedPattern, "$1$2"));
    }

    return Array.from(variations);
}
