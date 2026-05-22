import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return Response.json(
        { success: false, error: "No reference" },
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
    console.log("Paystack verify data:", JSON.stringify(data, null, 2));

    if (!data.data || data.data.status !== "success") {
      return Response.json(
        { success: false, error: "Payment not successful" },
        { status: 400 },
      );
    }

    const userId = data.data.metadata?.custom_fields?.find(
      (f: any) => f.variable_name === "user_id",
    )?.value;

    const userEmail = data.data.customer.email;

    console.log("Updating plan for userId:", userId, "email:", userEmail);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let error = null;

    if (userId) {
      const { error: idError } = await supabase
        .from("profiles")
        .update({ plan: "pro" })
        .eq("id", userId);
      error = idError;
      console.log("Update by ID result:", idError);
    }

    if (!userId || error) {
      const { error: emailError } = await supabase
        .from("profiles")
        .update({ plan: "pro" })
        .eq("email", userEmail);
      error = emailError;
      console.log("Update by email result:", emailError);
    }

    if (error) {
      console.error("Supabase update error:", error);
      return Response.json(
        { success: false, error: "Failed to update plan" },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Verify error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
