
import { toTurkishLowerCase, normalizeTurkishChars } from '../src/lib/turkish';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

console.log('Testing Turkish Character Normalization...');

// Test cases
const cases = [
    { input: "İnşaat", lower: "inşaat", normalized: "insaat" },
    { input: "ÇİÇEK", lower: "çiçek", normalized: "cicek" },
    { input: "AĞAÇ", lower: "ağaç", normalized: "agac" },
    { input: "Ispanak", lower: "ıspanak", normalized: "ispanak" }, // 'I' -> 'ı' in lower, 'i' in normalized (usually)
    { input: "ÖĞRETMEN", lower: "öğretmen", normalized: "ogretmen" },
];

cases.forEach(({ input, lower, normalized }) => {
    const calculatedLower = toTurkishLowerCase(input);
    const calculatedNorm = normalizeTurkishChars(input);

    assert(calculatedLower === lower, `toTurkishLowerCase('${input}') should be '${lower}', got '${calculatedLower}'`);
    // Note: My normalizeTurkishChars implementation maps I -> i for search convenience, let's verify that.
    // If input is "Ispanak", turkishMap['I'] is 'i'. So it becomes "ispanak".
    assert(calculatedNorm === normalized, `normalizeTurkishChars('${input}') should be '${normalized}', got '${calculatedNorm}'`);
});

console.log('All tests passed!');
