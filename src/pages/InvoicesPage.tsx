import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/lib/invoice-context";
import { useAuth } from "@/lib/auth-context";
import { Plus, Send, X, QrCode } from "lucide-react";
import { InvoiceQRCode } from "@/components/InvoiceQRCode";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers, mockServices } from "@/lib/mock-data";
import { InvoiceLineItem, Invoice } from "@/lib/types";

export default function InvoicesPage() {
  const { user } = useAuth();
  const { invoices, addInvoice } = useInvoices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [qrInvoice, setQrInvoice] = useState<Invoice | null>(null);

  const providerInvoices = invoices.filter((i) => i.providerId === user?.id);
  const customers = mockUsers.filter((u) => u.role === "customer");
  const providerServices = mockServices.filter((s) => s.providerId === user?.id);

  const totalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0);

  const handleAddService = () => {
    const svc = providerServices.find((s) => s.id === selectedServiceId);
    if (!svc || lineItems.some((li) => li.serviceId === svc.id)) return;
    setLineItems((prev) => [...prev, { serviceId: svc.id, serviceName: svc.name, amount: svc.price }]);
    setSelectedServiceId("");
  };

  const handleRemoveItem = (serviceId: string) => {
    setLineItems((prev) => prev.filter((li) => li.serviceId !== serviceId));
  };

  const handleUpdateAmount = (serviceId: string, newAmount: string) => {
    setLineItems((prev) =>
      prev.map((li) => li.serviceId === serviceId ? { ...li, amount: parseFloat(newAmount) || 0 } : li)
    );
  };

  const handleSendInvoice = () => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || !user || lineItems.length === 0) return;

    const invoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;
    const serviceNames = lineItems.map((li) => li.serviceName).join(", ");
    addInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: customer.id,
      customerName: customer.name,
      providerId: user.id,
      providerName: user.name,
      serviceName: serviceNames,
      lineItems,
      amount: totalAmount,
      currency: "USD",
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    toast({ title: "Invoice sent!", description: `${invoiceNum} sent to ${customer.name} for $${totalAmount.toFixed(2)}.` });
    setDialogOpen(false);
    setCustomerId("");
    setLineItems([]);
    setSelectedServiceId("");
  };

  const availableServices = providerServices.filter(
    (s) => !lineItems.some((li) => li.serviceId === s.id)
  );

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
                <TableHead>Service(s)</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">QR</TableHead>
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
        <DialogContent className="sm:max-w-lg">
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

            {/* Add services */}
            <div className="grid gap-2">
              <Label>Add Services</Label>
              <div className="flex gap-2">
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {availableServices.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — ${s.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" onClick={handleAddService} disabled={!selectedServiceId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Line items */}
            {lineItems.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="w-28">Amount</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((li) => (
                      <TableRow key={li.serviceId}>
                        <TableCell className="text-sm">{li.serviceName}</TableCell>
                        <TableCell>
                          <Input
                            type="number" min="0" step="0.01"
                            value={li.amount}
                            onChange={(e) => handleUpdateAmount(li.serviceId, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(li.serviceId)}>
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold text-sm">Total</TableCell>
                      <TableCell className="font-semibold text-sm" colSpan={2}>${totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvoice} disabled={!customerId || lineItems.length === 0} className="gap-1.5">
              <Send className="h-4 w-4" /> Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
