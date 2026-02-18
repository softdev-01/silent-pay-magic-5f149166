import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/lib/invoice-context";
import { useAuth } from "@/lib/auth-context";
import { Plus, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers } from "@/lib/mock-data";
import { mockServices } from "@/lib/mock-data";

export default function InvoicesPage() {
  const { user } = useAuth();
  const { invoices, addInvoice } = useInvoices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [amount, setAmount] = useState("");

  const providerInvoices = invoices.filter((i) => i.providerId === user?.id);
  const customers = mockUsers.filter((u) => u.role === "customer");
  const providerServices = mockServices.filter((s) => s.providerId === user?.id);

  const selectedService = providerServices.find((s) => s.id === serviceId);

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const svc = providerServices.find((s) => s.id === id);
    if (svc) setAmount(svc.price.toString());
  };

  const handleSendInvoice = () => {
    const customer = customers.find((c) => c.id === customerId);
    const service = providerServices.find((s) => s.id === serviceId);
    if (!customer || !service || !user) return;

    const invoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;
    addInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: customer.id,
      customerName: customer.name,
      providerId: user.id,
      providerName: user.name,
      serviceName: service.name,
      amount: parseFloat(amount),
      currency: "USD",
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    toast({ title: "Invoice sent!", description: `${invoiceNum} sent to ${customer.name} for $${parseFloat(amount).toFixed(2)}.` });
    setDialogOpen(false);
    setCustomerId("");
    setServiceId("");
    setAmount("");
  };

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Your Invoices</h2>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.customerName}</TableCell>
                  <TableCell>{inv.serviceName}</TableCell>
                  <TableCell>${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>{inv.createdAt}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create & Send Invoice dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice to Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={handleServiceChange}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  {providerServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — ${s.price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount (USD)</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvoice} disabled={!customerId || !serviceId || !amount} className="gap-1.5">
              <Send className="h-4 w-4" /> Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
