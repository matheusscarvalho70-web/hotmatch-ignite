import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Mercado Pago sends { type: "payment", data: { id: "123456789" } }
    const paymentId = body?.data?.id;
    const topic = body?.type ?? body?.topic;

    if (topic !== "payment" || !paymentId) {
      // Not a payment notification — acknowledge and exit
      return new Response(
        JSON.stringify({ status: "ignored", reason: "not a payment notification" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch payment details from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment from Mercado Pago" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payment = await mpResponse.json();
    const status = payment.status; // "approved" | "pending" | "cancelled" | "rejected"
    const preferenceId = payment.preference_id;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find the transaction by preference_id stored in metadata
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("provider_payment_id", preferenceId)
      .maybeSingle();

    if (txError || !tx) {
      return new Response(
        JSON.stringify({ error: "Transaction not found for preference_id", preference_id: preferenceId }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If already approved, idempotent return
    if (tx.status === "approved") {
      return new Response(
        JSON.stringify({ status: "already_processed", transaction_id: tx.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Map Mercado Pago status to our status
    let newStatus: "approved" | "cancelled" | "failed" | "pending" = "pending";
    if (status === "approved") newStatus = "approved";
    else if (status === "cancelled") newStatus = "cancelled";
    else if (status === "rejected") newStatus = "failed";
    else newStatus = "pending";

    // Update transaction status
    await supabase
      .from("transactions")
      .update({ status: newStatus, provider_payment_id: String(paymentId) })
      .eq("id", tx.id);

    // If approved, fulfill the purchase
    if (newStatus === "approved") {
      if (tx.type === "purchase") {
        // Credit coins to the user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("coin_balance")
          .eq("id", tx.user_id)
          .maybeSingle();

        const currentCoins = profile?.coin_balance ?? 0;
        await supabase
          .from("profiles")
          .update({ coin_balance: currentCoins + tx.coins_amount })
          .eq("id", tx.user_id);
      } else if (tx.type === "vip_subscription") {
        // Activate VIP for 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await supabase
          .from("profiles")
          .update({ is_vip: true, vip_expires_at: expiresAt.toISOString() })
          .eq("id", tx.user_id);
      }
    }

    return new Response(
      JSON.stringify({ status: "processed", transaction_id: tx.id, payment_status: newStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
