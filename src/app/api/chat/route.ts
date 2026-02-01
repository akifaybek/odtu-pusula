import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Sen ODTÜ Pusula asistanısın. ODTÜ (Orta Doğu Teknik Üniversitesi) öğrencilerine yardımcı oluyorsun.

Görevlerin:
- Ders seçimi konusunda tavsiye vermek
- Hocalar hakkında genel bilgi vermek
- Kampüs hayatı hakkında bilgi vermek
- Akademik konularda rehberlik etmek

Kurallar:
- Türkçe konuş
- Samimi ve yardımsever ol
- ODTÜ kültürüne uygun cevaplar ver
- Öğrenci dostu bir dil kullan`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mesaj gerekli" },
        { status: 400 }
      );
    }

    const messages = [
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      message: assistantMessage,
      conversationHistory: [
        ...messages,
        { role: "assistant", content: assistantMessage },
      ],
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu, lütfen tekrar deneyin" },
      { status: 500 }
    );
  }
}
