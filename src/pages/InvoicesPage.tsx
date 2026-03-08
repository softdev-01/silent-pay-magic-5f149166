import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/lib/invoice-context";
import { useAuth } from "@/lib/auth-context";
import { Plus, Send, X, QrCode, UserPlus } from "lucide-react";
import { InvoiceQRCode } from "@/components/InvoiceQRCode";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUsers, mockServices } from "@/lib/mock-data";
import { InvoiceLineItem, Invoice } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

export default function InvoicesPage() {
  const { user } = useAuth();
  const { invoices, addInvoice } = useInvoices();
  const [dialogOpen, setDialogOpen] = useState(false);
  // Registered customer
  const [customerId, setCustomerId] = useState("");
  // Walk-in customer
  const [walkInName, setWalkInName] = useState("");
  const [walkInEmail, setWalkInEmail] = useState("");
  const [customerTab, setCustomerTab] = useState<string>("walkin");

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [qrInvoice, setQrInvoice] = useState<Invoice | null>(null);
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServiceAmount, setCustomServiceAmount] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleAddCustomService = () => {
    if (!customServiceName.trim() || !customServiceAmount) return;
    const id = `custom-${Date.now()}`;
    setLineItems((prev) => [
      ...prev,
      { serviceId: id, serviceName: customServiceName.trim(), amount: parseFloat(customServiceAmount) || 0 },
    ]);
    setCustomServiceName("");
    setCustomServiceAmount("");
  };

  const handleRemoveItem = (serviceId: string) => {
    setLineItems((prev) => prev.filter((li) => li.serviceId !== serviceId));
  };

  const handleUpdateAmount = (serviceId: string, newAmount: string) => {
    setLineItems((prev) =>
      prev.map((li) => li.serviceId === serviceId ? { ...li, amount: parseFloat(newAmount) || 0 } : li)
    );
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setCustomerId("");
    setWalkInName("");
    setWalkInEmail("");
    setLineItems([]);
    setSelectedServiceId("");
    setCustomServiceName("");
    setCustomServiceAmount("");
    setSending(false);
  };

  const handleSendInvoice = async () => {
    if (!user || lineItems.length === 0) return;

    const isWalkIn = customerTab === "walkin";
    const customerName = isWalkIn ? walkInName.trim() : customers.find((c) => c.id === customerId)?.name;

    if (!customerName) return;

    setSending(true);

    if (isWalkIn) {
      // Create invoice via edge function for walk-in customer (stored in DB)
      try {
        const serviceNames = lineItems.map((li) => li.serviceName).join(", ");
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/create-invoice`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              customerName: walkInName.trim(),
              customerEmail: walkInEmail.trim() || null,
              serviceName: serviceNames,
              lineItems,
              amount: totalAmount,
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          toast({ title: "Failed to create invoice", description: err.error, variant: "destructive" });
          setSending(false);
          return;
        }

        const data = await res.json();
        const newInvoice: Invoice = {
          id: data.id,
          invoiceNumber: data.invoiceNumber,
          customerId: "",
          customerName: customerName,
          providerId: user.id,
          providerName: user.name,
          serviceName: serviceNames,
          lineItems,
          amount: totalAmount,
          currency: "USD",
          status: "pending",
          createdAt: new Date().toISOString().slice(0, 10),
        };

        addInvoice(newInvoice);
        toast({
          title: "Invoice created!",
          description: `${data.invoiceNumber} for ${customerName} — $${totalAmount.toFixed(2)}. QR code ready to share!`,
        });
        resetDialog();
        setQrInvoice(newInvoice);
      } catch {
        toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
        setSending(false);
      }
    } else {
      // Registered customer — existing flow
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) { setSending(false); return; }

      const invoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;
      const serviceNames = lineItems.map((li) => li.serviceName).join(", ");
      const newInvoice: Invoice = {
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
      };
      addInvoice(newInvoice);
      toast({ title: "Invoice sent!", description: `${invoiceNum} sent to ${customer.name} for $${totalAmount.toFixed(2)}.` });
      resetDialog();
    }
  };

  const availableServices = providerServices.filter(
    (s) => !lineItems.some((li) => li.serviceId === s.id)
  );

  const isValid = lineItems.length > 0 && (
    customerTab === "walkin" ? walkInName.trim().length > 0 : customerId.length > 0
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
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setQrInvoice(inv)}>
                      <QrCode className="h-3.5 w-3.5" /> QR
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Invoice dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for a registered customer or a walk-in customer who can pay via QR code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Customer selection */}
            <Tabs value={customerTab} onValueChange={setCustomerTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="walkin" className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" /> Walk-in Customer
                </TabsTrigger>
                <TabsTrigger value="registered">Registered Customer</TabsTrigger>
              </TabsList>
              <TabsContent value="walkin" className="space-y-3 pt-2">
                <div className="grid gap-2">
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="Enter customer name"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="customer@email.com"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="registered" className="pt-2">
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
              </TabsContent>
            </Tabs>

            {/* Add existing services */}
            {availableServices.length > 0 && (
              <div className="grid gap-2">
                <Label>Add from Your Services</Label>
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
            )}

            {/* Add custom service/item */}
            <div className="grid gap-2">
              <Label>Add Custom Item</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Item name"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={customServiceAmount}
                  onChange={(e) => setCustomServiceAmount(e.target.value)}
                  className="w-24"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomService}
                  disabled={!customServiceName.trim() || !customServiceAmount}
                >
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
            <Button variant="outline" onClick={resetDialog}>Cancel</Button>
            <Button onClick={handleSendInvoice} disabled={!isValid || sending} className="gap-1.5">
              <Send className="h-4 w-4" /> {sending ? "Creating..." : "Create & Get QR"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code dialog */}
      <Dialog open={!!qrInvoice} onOpenChange={(open) => !open && setQrInvoice(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Invoice QR Code
            </DialogTitle>
          </DialogHeader>
          {qrInvoice && (
            <div className="flex flex-col items-center gap-4 py-4">
              <InvoiceQRCode invoiceId={qrInvoice.id} size={180} />
              <div className="text-center">
                <p className="text-sm font-medium">{qrInvoice.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">
                  ${qrInvoice.amount.toFixed(2)} — {qrInvoice.customerName}
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Share this QR code with your customer so they can pay without logging in.
                Payment history will be automatically recorded.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrInvoice(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
