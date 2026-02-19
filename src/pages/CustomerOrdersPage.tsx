import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useOrders } from "@/lib/order-context";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const { orders } = useOrders();

  const myOrders = orders.filter((o) => o.customerId === user?.id);

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4 text-primary" />
            My Orders ({myOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet — browse services to place your first order!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">{order.id.slice(0, 12)}…</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item) => (
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
