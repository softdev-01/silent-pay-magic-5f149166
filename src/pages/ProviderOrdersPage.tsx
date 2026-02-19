import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/order-context";
import { useInvoices } from "@/lib/invoice-context";
import { useAuth } from "@/lib/auth-context";
import { Package, FileText, Check, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ProviderOrdersPage() {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const { invoices, addInvoice } = useInvoices();

  // Show orders that contain at least one item from this provider
  const myOrders = orders.filter((o) =>
    o.items.some((item) => item.providerId === user?.id)
  );

  const handleAccept = (orderId: string) => {
    updateOrderStatus(orderId, "accepted");
    toast({ title: "Order accepted" });
  };

  const handleCreateInvoice = (order: typeof myOrders[0]) => {
    if (!user) return;
    const myItems = order.items.filter((i) => i.providerId === user.id);
    const subtotal = myItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const invoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;

    addInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: order.customerId,
      customerName: order.customerName,
      providerId: user.id,
      providerName: user.name,
      serviceName: myItems.map((i) => i.serviceName).join(", "),
      lineItems: myItems.map((i) => ({ serviceId: i.serviceId, serviceName: i.serviceName, amount: i.price })),
      amount: subtotal + (order.deliveryRequested ? order.deliveryFee : 0),
      currency: "USD",
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    updateOrderStatus(order.id, "invoiced");
    toast({ title: "Invoice created & sent!", description: `${invoiceNum} sent to ${order.customerName}.` });
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            Incoming Orders ({myOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {order.items
                          .filter((i) => i.providerId === user?.id)
                          .map((item) => (
                            <Badge key={item.serviceId} variant="secondary" className="text-xs">
                              {item.serviceName}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.deliveryRequested ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Truck className="h-3.5 w-3.5 text-primary" />
                          <span className="max-w-[120px] truncate">{order.deliveryAddress}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.createdAt}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      {order.status === "pending" && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleAccept(order.id)}>
                          <Check className="h-3.5 w-3.5" /> Accept
                        </Button>
                      )}
                      {(order.status === "pending" || order.status === "accepted") && (
                        <Button size="sm" className="gap-1.5" onClick={() => handleCreateInvoice(order)}>
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
