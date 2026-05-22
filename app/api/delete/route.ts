import { createClient } from "@supabase/supabase-js";

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json(
        { success: false, error: "No user ID" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await Promise.all([
      supabase.from("trades").delete().eq("user_id", userId),
      supabase.from("risk_rules").delete().eq("user_id", userId),
      supabase.from("risk_checklist").delete().eq("user_id", userId),
      supabase.from("profiles").delete().eq("id", userId),
    ]);

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Delete user error:", error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
