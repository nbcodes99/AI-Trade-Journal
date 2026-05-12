import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return Response.json(
        { success: false, error: "No reference provided" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await res.json();
    console.log("Paystack verify response:", data);

    if (!data.data || data.data.status !== "success") {
      return Response.json(
        { success: false, error: "Payment not successful" },
        { status: 400 },
      );
    }

    const userEmail = data.data.customer.email;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error } = await supabase
      .from("profiles")
      .update({ plan: "pro" })
      .eq("email", userEmail);

    if (error) {
      console.error("Supabase update error:", error);
      return Response.json(
        { success: false, error: "Failed to update plan" },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Verify route error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
