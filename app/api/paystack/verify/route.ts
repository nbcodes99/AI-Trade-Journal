import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { reference, userId } = await req.json();

    if (!reference || !userId) {
      return Response.json(
        { success: false, error: "Missing reference or userId" },
        { status: 400 },
      );
    }

    // 🔥 Verify Paystack payment
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await res.json();

    console.log("Paystack response:", data);

    if (!data.status || data.data?.status !== "success") {
      return Response.json(
        { success: false, error: "Payment not successful" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error, data: updateData } = await supabase
      .from("profiles")
      .update({ plan: "pro" })
      .eq("id", userId);

    if (error) {
      console.error("Supabase update error:", error);
      return Response.json(
        { success: false, error: "Failed to update plan" },
        { status: 500 },
      );
    }

    console.log("User upgraded:", updateData);

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Verify error:", err);

    return Response.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
