import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, payerName, payerEmail } = await req.json();

    if (!invoiceId || !payerName) {
      return new Response(
        JSON.stringify({ error: "Missing invoiceId or payerName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the invoice
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invErr || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invoice.status === "paid") {
      return new Response(
        JSON.stringify({ error: "Invoice already paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update invoice status to paid
    const { error: updateErr } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", invoiceId);

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: "Failed to update invoice" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payment notification for the provider
    const { error: notifErr } = await supabase
      .from("payment_notifications")
      .insert({
        invoice_id: invoiceId,
        provider_id: invoice.provider_id,
        payer_name: payerName,
        payer_email: payerEmail || null,
        invoice_number: invoice.invoice_number,
        service_name: invoice.service_name,
        amount: invoice.amount,
        currency: invoice.currency,
      });

    if (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    // Create a transaction record
    const { error: txErr } = await supabase
      .from("transactions")
      .insert({
        invoice_id: invoiceId,
        amount: invoice.amount,
        currency: invoice.currency,
        status: "success",
        method: "PayPal",
        idempotency_key: `pay-${invoiceId}-${Date.now()}`,
      });

    if (txErr) {
      console.error("Failed to create transaction:", txErr);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment recorded" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
