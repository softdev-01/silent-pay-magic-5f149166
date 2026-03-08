import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Loader2, AlertCircle, Receipt } from "lucide-react";

interface PublicInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  serviceName: string;
  createdAt: string;
  paidAt: string | null;
  providerName: string;
  customerName: string;
  lineItems: { serviceId: string; serviceName: string; amount: number }[];
}

export default function PublicPayPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/public-invoice?id=${invoiceId}`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        setError("Invoice not found");
        return;
      }

      const inv = await res.json();
      setInvoice(inv);
      if (inv.status === "paid") setPaid(true);
    } catch {
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPal = () => {
    if (!invoice) return;
    setPaying(true);
    // Simulate PayPal redirect — in production this would redirect to PayPal checkout
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-lg font-semibold">Invoice Not Found</p>
            <p className="text-sm text-muted-foreground text-center">
              This invoice link may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Receipt className="mx-auto mb-2 h-8 w-8 text-primary" />
          <CardTitle className="text-xl">Invoice {invoice.invoiceNumber}</CardTitle>
          <p className="text-sm text-muted-foreground">From {invoice.providerName}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bill To</span>
              <span className="font-medium">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
            </div>

            <Separator />

            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Services</p>
                {invoice.lineItems.map((li) => (
                  <div key={li.serviceId} className="flex justify-between text-sm">
                    <span>{li.serviceName}</span>
                    <span>${li.amount.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span>{invoice.serviceName}</span>
                </div>
                <Separator />
              </>
            )}

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                ${invoice.amount.toFixed(2)} {invoice.currency}
              </span>
            </div>
          </div>

          {paid ? (
            <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="mx-auto mb-1 h-8 w-8 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {invoice.status === "paid" ? "This invoice has been paid" : "Payment Successful!"}
              </p>
              {invoice.paidAt && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Paid on {new Date(invoice.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handlePayPal}
              disabled={paying}
            >
              {paying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {paying ? "Processing..." : `Pay $${invoice.amount.toFixed(2)} with PayPal`}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by PayPal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
