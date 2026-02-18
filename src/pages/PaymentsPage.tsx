import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { useInvoices } from "@/lib/invoice-context";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { invoices: mockInvoices } = useInvoices();
  const invoices = user?.role === "customer"
    ? mockInvoices.filter((i) => i.customerId === "c1")
    : user?.role === "provider"
    ? mockInvoices.filter((i) => i.providerId === "p1")
    : mockInvoices;

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {user?.role === "customer" ? "Payment History" : "Payment Records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>{user?.role === "customer" ? "Provider" : "Customer"}</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{user?.role === "customer" ? inv.providerName : inv.customerName}</TableCell>
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
    </DashboardLayout>
  );
}
