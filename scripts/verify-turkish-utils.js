
// Paste of src/lib/turkish.ts content (modified for JS)
/**
 * Turkish character normalization and helper functions
 */

const turkishMap = {
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
function toTurkishLowerCase(str) {
    if (!str) return "";
    return str.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

/**
 * Normalizes a string by replacing Turkish characters with their English equivalents.
 * Useful for broad search matching.
 * Example: "İnşaat" -> "insaat", "Çiçek" -> "cicek"
 */
function normalizeTurkishChars(str) {
    if (!str) return "";

    return str
        .split("")
        .map((char) => turkishMap[char] || char)
        .join("")
        .toLowerCase(); // Ensure result is lowercase for case-insensitive comparison
}

// Test Verification Logic
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

console.log('Testing Turkish Character Normalization (JS)...');

// Test cases
const cases = [
    { input: "İnşaat", lower: "inşaat", normalized: "insaat" },
    { input: "ÇİÇEK", lower: "çiçek", normalized: "cicek" },
    { input: "AĞAÇ", lower: "ağaç", normalized: "agac" },
    { input: "Ispanak", lower: "ıspanak", normalized: "ispanak" },
    { input: "ÖĞRETMEN", lower: "öğretmen", normalized: "ogretmen" },
];

cases.forEach(({ input, lower, normalized }) => {
    const calculatedLower = toTurkishLowerCase(input);
    const calculatedNorm = normalizeTurkishChars(input);

    assert(calculatedLower === lower, `toTurkishLowerCase('${input}') should be '${lower}', got '${calculatedLower}'`);
    assert(calculatedNorm === normalized, `normalizeTurkishChars('${input}') should be '${normalized}', got '${calculatedNorm}'`);
});

console.log('All tests passed!');
