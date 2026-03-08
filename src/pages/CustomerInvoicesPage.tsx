import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/lib/invoice-context";
import { useAuth } from "@/lib/auth-context";
import { CreditCard, CheckCircle, Receipt, Download } from "lucide-react";
import { InvoiceQRCode } from "@/components/InvoiceQRCode";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Invoice } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export default function CustomerInvoicesPage() {
  const { user } = useAuth();
  const { invoices, payInvoice } = useInvoices();
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const myInvoices = invoices.filter((i) => i.customerId === user?.id);
  const pendingInvoices = myInvoices.filter((i) => i.status === "pending");
  const otherInvoices = myInvoices.filter((i) => i.status !== "pending");

  const handlePay = () => {
    if (!payingInvoice) return;
    if (!user?.walletLinked) {
      toast({ title: "Wallet not linked", description: "Please link your PayPal wallet before paying.", variant: "destructive" });
      setPayingInvoice(null);
      return;
    }
    payInvoice(payingInvoice.id);
    const paidInv = { ...payingInvoice, status: "paid" as const, paidAt: new Date().toISOString().slice(0, 10) };
    toast({ title: "Payment successful!", description: `$${payingInvoice.amount.toFixed(2)} paid to ${payingInvoice.providerName} via PayPal.` });
    setPayingInvoice(null);
    setReceiptInvoice(paidInv);
  };

  const viewReceipt = (inv: Invoice) => {
    setReceiptInvoice(inv);
  };

  return (
    <DashboardLayout>
      {/* Pending invoices requiring action */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Pending Invoices ({pendingInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No pending invoices — you're all caught up!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service(s)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.providerName}</TableCell>
                    <TableCell>{inv.serviceName}</TableCell>
                    <TableCell className="font-semibold">${inv.amount.toFixed(2)}</TableCell>
                    <TableCell>{inv.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => setPayingInvoice(inv)} className="gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" /> Pay Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Service(s)</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.providerName}</TableCell>
                  <TableCell>{inv.serviceName}</TableCell>
                  <TableCell>${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>{inv.paidAt ?? inv.createdAt}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right">
                    {inv.status === "paid" && (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => viewReceipt(inv)}>
                        <Receipt className="h-3.5 w-3.5" /> View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pay confirmation dialog */}
      <Dialog open={!!payingInvoice} onOpenChange={(open) => !open && setPayingInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are about to pay <span className="font-semibold text-foreground">${payingInvoice?.amount.toFixed(2)}</span> to{" "}
              <span className="font-semibold text-foreground">{payingInvoice?.providerName}</span> for{" "}
              <span className="text-foreground">{payingInvoice?.serviceName}</span> via PayPal.
            </DialogDescription>
          </DialogHeader>
          {payingInvoice?.lineItems && payingInvoice.lineItems.length > 1 && (
            <div className="rounded-md border p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Breakdown</p>
              {payingInvoice.lineItems.map((li) => (
                <div key={li.serviceId} className="flex justify-between text-sm">
                  <span>{li.serviceName}</span>
                  <span className="font-medium">${li.amount.toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>${payingInvoice.amount.toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPayingInvoice(null)}>Cancel</Button>
            <Button onClick={handlePay} className="gap-1.5">
              <CreditCard className="h-4 w-4" /> Pay ${payingInvoice?.amount.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt dialog */}
      <Dialog open={!!receiptInvoice} onOpenChange={(open) => !open && setReceiptInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Payment Receipt
            </DialogTitle>
          </DialogHeader>
          {receiptInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice #</span>
                  <span className="font-medium">{receiptInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{receiptInvoice.providerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date Paid</span>
                  <span className="font-medium">{receiptInvoice.paidAt}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">PayPal</span>
                </div>

                <Separator />

                {receiptInvoice.lineItems && receiptInvoice.lineItems.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Services</p>
                    {receiptInvoice.lineItems.map((li) => (
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
                      <span>{receiptInvoice.serviceName}</span>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex justify-between text-base font-semibold">
                  <span>Total Paid</span>
                  <span className="text-primary">${receiptInvoice.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="mx-auto mb-1 h-6 w-6 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Payment Complete</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptInvoice(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
