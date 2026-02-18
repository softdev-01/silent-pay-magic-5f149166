import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/lib/invoice-context";
import { useAuth } from "@/lib/auth-context";
import { CreditCard, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Invoice } from "@/lib/types";

export default function CustomerInvoicesPage() {
  const { user } = useAuth();
  const { invoices, payInvoice } = useInvoices();
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

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
    toast({ title: "Payment successful!", description: `$${payingInvoice.amount.toFixed(2)} paid to ${payingInvoice.providerName} via PayPal.` });
    setPayingInvoice(null);
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
                  <TableHead>Service</TableHead>
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
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPayingInvoice(null)}>Cancel</Button>
            <Button onClick={handlePay} className="gap-1.5">
              <CreditCard className="h-4 w-4" /> Pay ${payingInvoice?.amount.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
