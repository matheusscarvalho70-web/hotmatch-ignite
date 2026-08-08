import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COIN_PACKS: Record<string, { coins: number; bonus: number; price: number; label: string }> = {
  c1: { coins: 50, bonus: 0, price: 10, label: "Pacote Iniciante" },
  c2: { coins: 150, bonus: 15, price: 25, label: "Pacote Popular" },
  c3: { coins: 400, bonus: 60, price: 60, label: "Pacote Avançado" },
  c4: { coins: 1000, bonus: 200, price: 130, label: "Pacote Whale" },
};

const VIP_PRICE = 39.9;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { profile_id, item_type, pack_id } = await req.json();

    if (!profile_id || !item_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: profile_id, item_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let amount: number;
    let coinsAmount: number;
    let txType: string;
    let title: string;

    if (item_type === "coins") {
      const pack = COIN_PACKS[pack_id];
      if (!pack) {
        return new Response(
          JSON.stringify({ error: "Invalid pack_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      amount = pack.price;
      coinsAmount = pack.coins + pack.bonus;
      txType = "purchase";
      title = `${pack.label} — ${coinsAmount} moedas`;
    } else if (item_type === "vip") {
      amount = VIP_PRICE;
      coinsAmount = 0;
      txType = "vip_subscription";
      title = "Assinatura VIP Gold — R$ 39,90/mês";
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid item_type; use 'coins' or 'vip'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insert pending transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: profile_id,
        amount,
        coins_amount: coinsAmount,
        type: txType,
        status: "pending",
        provider: "mercadopago",
        metadata: { item_type, pack_id: pack_id ?? null },
      })
      .select()
      .single();

    if (txError || !tx) {
      return new Response(
        JSON.stringify({ error: "Failed to create transaction", detail: txError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create Mercado Pago preference
    const siteUrl = Deno.env.get("SITE_URL") ?? supabaseUrl;
    const preferenceBody = {
      items: [
        {
          id: tx.id,
          title,
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${siteUrl}/loja?status=success`,
        failure: `${siteUrl}/loja?status=failure`,
        pending: `${siteUrl}/loja?status=pending`,
      },
      auto_return: "approved",
      metadata: {
        transaction_id: tx.id,
        profile_id,
        item_type,
        pack_id: pack_id ?? null,
      },
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      // Mark transaction as failed
      await supabase
        .from("transactions")
        .update({ status: "failed", metadata: { ...tx.metadata, mp_error: mpData } })
        .eq("id", tx.id);

      return new Response(
        JSON.stringify({ error: "Mercado Pago preference failed", detail: mpData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Store preference ID in transaction metadata
    await supabase
      .from("transactions")
      .update({
        provider_payment_id: mpData.id,
        metadata: { ...tx.metadata, preference_id: mpData.id },
      })
      .eq("id", tx.id);

    return new Response(
      JSON.stringify({
        transaction_id: tx.id,
        preference_id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
