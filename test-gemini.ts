import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key...");

    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }

    console.log("✅ API Key found (starts with: " + apiKey.substring(0, 4) + "...)");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try gemini-1.5-flash
    console.log("\nTesting 'gemini-1.5-flash'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("✅ gemini-1.5-flash Response:", result.response.text());
    } catch (error: unknown) {
        console.error(
            "❌ gemini-1.5-flash Failed:",
            error instanceof Error ? error.message : String(error)
        );
    }

    // Try gemini-pro
    console.log("\nTesting 'gemini-pro'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("✅ gemini-pro Response:", result.response.text());
    } catch (error: unknown) {
        console.error(
            "❌ gemini-pro Failed:",
            error instanceof Error ? error.message : String(error)
        );
    }
}

testGemini();
