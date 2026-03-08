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
    // Verify the provider is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const providerId = claimsData.claims.sub;

    const { customerName, customerEmail, serviceName, lineItems, amount } = await req.json();

    if (!customerName || !serviceName || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to insert invoice (provider creates for walk-in customer)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get provider profile
    const { data: providerProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", providerId)
      .single();

    // Generate invoice number
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, "0")}`;

    // Create the invoice with provider_id as both provider and a placeholder customer_id
    // For walk-in customers, we use the provider_id as customer_id since we need a UUID
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        provider_id: providerId,
        customer_id: providerId, // placeholder for walk-in customers
        service_name: serviceName,
        amount,
        currency: "USD",
        status: "pending",
      })
      .select()
      .single();

    if (invErr || !invoice) {
      console.error("Invoice creation error:", invErr);
      return new Response(JSON.stringify({ error: "Failed to create invoice" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert line items if provided
    if (lineItems && lineItems.length > 0) {
      const items = lineItems.map((li: any) => ({
        invoice_id: invoice.id,
        service_id: li.serviceId || null,
        service_name: li.serviceName,
        amount: li.amount,
      }));

      await supabase.from("invoice_line_items").insert(items);
    }

    return new Response(
      JSON.stringify({
        id: invoice.id,
        invoiceNumber,
        customerName,
        customerEmail: customerEmail || null,
        providerName: providerProfile?.name || "Unknown",
        serviceName,
        amount,
        status: "pending",
        createdAt: invoice.created_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
