import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1200,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert trading coach analyzing a trader's journal data. 
Write in a warm, direct, human tone — like a mentor talking to a student, not a robot reading stats.
Be specific about the trader's actual numbers and patterns.
You MUST format your response with EXACTLY these section headers on their own line, followed by a colon:

OVERVIEW:
WHAT YOU'RE DOING WELL:
WHAT'S HURTING YOUR PERFORMANCE:
YOUR BEHAVIORAL PATTERNS:
MY RECOMMENDATION FOR YOU:

Do not add any text before OVERVIEW. Do not skip any section.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content || "";

    if (userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      await supabase
        .from("profiles")
        .update({
          ai_insights: result,
          insights_generated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    return Response.json({ result });
  } catch (error: any) {
    console.error("OpenAI error:", error?.message || error);
    return Response.json(
      { error: error?.message || "Failed to generate insights!" },
      { status: 500 },
    );
  }
}
