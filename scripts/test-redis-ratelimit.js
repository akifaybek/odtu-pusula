
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Hardcoded for verification script to avoid dotenv dependency issues in this env
const redis = new Redis({
    url: "https://lenient-tomcat-45571.upstash.io",
    token: "AbIDAAIncDJjM2U1YjQ0OGYxNTA0ZTgzOGZmOTQ0ZDg4NzUwOGVhZnAyNDU1NzE",
});

async function testRateLimit() {
    console.log("Testing Upstash Redis Rate Limit...");

    try {
        const ratelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.slidingWindow(2, "10 s"), // Test limit: 2 requests per 10 seconds
            prefix: "test-limit",
        });

        const identifier = "test-user-" + Date.now();

        // Request 1: Should pass
        const r1 = await ratelimit.limit(identifier);
        console.log(`Req 1: success=${r1.success}, remaining=${r1.remaining}`);
        if (!r1.success) throw new Error("Req 1 failed unexpectedly");

        // Request 2: Should pass
        const r2 = await ratelimit.limit(identifier);
        console.log(`Req 2: success=${r2.success}, remaining=${r2.remaining}`);
        if (!r2.success) throw new Error("Req 2 failed unexpectedly");

        // Request 3: Should fail
        const r3 = await ratelimit.limit(identifier);
        console.log(`Req 3: success=${r3.success}, remaining=${r3.remaining}`);
        if (r3.success) throw new Error("Req 3 succeeded but should have failed");

        console.log("✅ Rate Limiting with Upstash Redis confirmed working!");
    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
}

testRateLimit();
