import { NextResponse } from "next/server";

const HF_MODEL = "gpt2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const hfApiKey = process.env.NEXT_PUBLIC_HF_API_KEY;
    if (!hfApiKey) {
      return NextResponse.json(
        { error: "HF_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://router.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.3,
            top_p: 0.9,
            repetition_penalty: 1.1,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Hugging Face API error" },
        { status: 500 },
      );
    }

    const result = Array.isArray(data)
      ? (data[0]?.generated_text ?? "")
      : (data?.generated_text ?? "");
    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error("HF insights error:", error);
    return NextResponse.json(
      { error: "Unable to generate insights at this time." },
      { status: 500 },
    );
  }
}
