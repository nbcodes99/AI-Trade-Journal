import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0.75,
      messages: [
        {
          role: "system",
          content: `You are an elite trading coach — part analyst, part mentor. You've seen hundreds of traders and you know exactly what separates the ones who make it from the ones who don't.

You're reviewing a trader's journal data right now. Talk to them directly, like you're sitting across the table. Use "you" and "your" throughout. Reference their actual numbers, setups, and emotional patterns — never give generic advice.

Be honest. If something is hurting them, say it clearly but with care. If they have a real edge, be specific about what it is and why it works. Your job is to make them better, not to make them feel good.

Keep the tone conversational — like a voice note from a coach, not a report from a robot.

Use one emoji per section header to make it feel alive, but keep the body text clean.

You MUST format your response with EXACTLY these section headers, each on their own line:

📊 OVERVIEW:
✅ WHAT YOU'RE DOING WELL:
⚠️ WHAT'S HURTING YOUR PERFORMANCE:
🧠 YOUR BEHAVIORAL PATTERNS:
🎯 MY RECOMMENDATION FOR YOU:

Rules:
- Start immediately with 📊 OVERVIEW: — no preamble, no greeting
- Every section must be present, in order
- Write 2-4 sentences per section minimum
- Reference specific numbers from the data (win rate, setups, emotions, streaks)
- End MY RECOMMENDATION FOR YOU with one concrete action they can take this week`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content || "";

    if (!result) {
      return Response.json(
        { error: "Empty response from AI" },
        { status: 500 },
      );
    }

    if (userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          ai_insights: result,
          insights_generated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (dbError) {
        console.error("Supabase cache error:", dbError.message);
      }
    }

    return Response.json({ result });
  } catch (error: any) {
    console.error("OpenAI error:", error?.message || error);
    return Response.json(
      { error: error?.message || "Failed to generate insights" },
      { status: 500 },
    );
  }
}
