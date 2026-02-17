import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInvoices, mockTransactions, mockUsers, stats } from "@/lib/mock-data";
import { DollarSign, CreditCard, Users, FileText, TrendingUp, Wallet } from "lucide-react";

function CustomerDashboard() {
  const recentPayments = mockInvoices.filter((i) => i.customerId === "c1").slice(0, 3);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Spent" value="$330.00" icon={<DollarSign className="h-5 w-5" />} description="This month" />
        <StatCard title="Active Services" value="2" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Wallet Status" value="Linked" icon={<Wallet className="h-5 w-5" />} description="PayPal" />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recent Payments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.serviceName}</TableCell>
                  <TableCell>${inv.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function ProviderDashboard() {
  const providerInvoices = mockInvoices.filter((i) => i.providerId === "p1").slice(0, 3);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Revenue" value="$320.00" icon={<DollarSign className="h-5 w-5" />} description="This month" />
        <StatCard title="Invoices Sent" value="3" icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Success Rate" value="66%" icon={<TrendingUp className="h-5 w-5" />} />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.customerName}</TableCell>
                  <TableCell>${inv.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function AdminDashboard() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Transactions" value={stats.totalTransactions} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Active Users" value={stats.activeUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Pending Invoices" value={stats.pendingInvoices} icon={<FileText className="h-5 w-5" />} />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.slice(0, 4).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.providerName}</TableCell>
                  <TableCell>${t.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {user?.role === "customer" && <CustomerDashboard />}
      {user?.role === "provider" && <ProviderDashboard />}
      {user?.role === "admin" && <AdminDashboard />}
    </DashboardLayout>
  );
}
