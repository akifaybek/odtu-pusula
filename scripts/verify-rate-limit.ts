
// Mock Check for logic internal testing (without hitting APIs)
import { rateLimiters, checkRateLimit } from '../src/lib/rate-limit';

async function testAuthRateLimit() {
    console.log('\n--- Testing Auth Rate Limit (5 per 15 min) ---');
    const ip = '127.0.0.1';

    // We expect 5 successes then fail
    for (let i = 1; i <= 6; i++) {
        // Use a unique ID for this test run so we don't hit persistent limits from previous runs if any
        const result = await checkRateLimit(rateLimiters.auth, `test-auth-${Date.now()}:${ip}`);
        console.log(`Request ${i}: Success=${result.success}, Remaining=${result.remaining}`);

        if (i <= 5 && !result.success) {
            console.error(`❌ FAILED: Request ${i} should have succeeded`);
            process.exit(1);
        }
        if (i === 6 && result.success) {
            console.error(`❌ FAILED: Request ${i} should have failed`);
            process.exit(1);
        }
    }
    console.log('✅ Auth Rate Limit Logic Passed');
}

async function testReviewRateLimit() {
    console.log('\n--- Testing Review Rate Limit (10 per 1 hour) ---');
    const userId = 'user-123';

    for (let i = 1; i <= 11; i++) {
        const result = await checkRateLimit(rateLimiters.review, `test-review-${Date.now()}:${userId}`);
        console.log(`Request ${i}: Success=${result.success}, Remaining=${result.remaining}`);

        if (i <= 10 && !result.success) {
            console.error(`❌ FAILED: Request ${i} should have succeeded`);
            process.exit(1);
        }
        if (i === 11 && result.success) {
            console.error(`❌ FAILED: Request ${i} should have failed`);
            process.exit(1);
        }
    }
    console.log('✅ Review Rate Limit Logic Passed');
}

async function main() {
    await testAuthRateLimit();
    await testReviewRateLimit();
    console.log('\n✅ All Rate Limit Tests Passed!');
}

main().catch(console.error);
