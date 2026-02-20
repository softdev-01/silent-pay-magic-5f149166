import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { mockInvoices, mockTransactions } from "@/lib/mock-data";
import { DollarSign, TrendingUp, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo } from "react";

export default function ProviderAnalyticsPage() {
  const { user } = useAuth();

  const analytics = useMemo(() => {
    if (!user) return null;

    const myInvoices = mockInvoices.filter((i) => i.providerId === user.id);
    const myTransactions = mockTransactions.filter((t) =>
      myInvoices.some((inv) => inv.id === t.invoiceId)
    );

    // Customer breakdown
    const customerMap = new Map<string, { name: string; spent: number; invoices: number; lastActivity: string }>();
    myInvoices.forEach((inv) => {
      const existing = customerMap.get(inv.customerId) || {
        name: inv.customerName,
        spent: 0,
        invoices: 0,
        lastActivity: inv.createdAt,
      };
      existing.spent += inv.status === "paid" ? inv.amount : 0;
      existing.invoices += 1;
      if (inv.createdAt > existing.lastActivity) existing.lastActivity = inv.createdAt;
      customerMap.set(inv.customerId, existing);
    });

    const customers = Array.from(customerMap.entries()).map(([id, data]) => ({ id, ...data }));

    const totalRevenue = myInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
    const totalInvoices = myInvoices.length;
    const paidCount = myInvoices.filter((i) => i.status === "paid").length;
    const successRate = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;
    const uniqueCustomers = customerMap.size;

    // Status distribution for pie chart
    const statusCounts = { paid: 0, pending: 0, failed: 0, refunded: 0 };
    myInvoices.forEach((i) => { statusCounts[i.status] += 1; });
    const statusData = Object.entries(statusCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Revenue by customer for bar chart
    const revenueByCustomer = customers
      .filter((c) => c.spent > 0)
      .map((c) => ({ name: c.name.split(" ")[0], revenue: c.spent }));

    return { totalRevenue, totalInvoices, successRate, uniqueCustomers, customers, statusData, revenueByCustomer, myTransactions };
  }, [user]);

  if (!analytics) return null;

  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--destructive))",
    "hsl(var(--muted-foreground))",
  ];

  return (
    <DashboardLayout>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Revenue" value={`$${analytics.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Total Invoices" value={analytics.totalInvoices} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Success Rate" value={`${analytics.successRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Customers" value={analytics.uniqueCustomers} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Customer</CardTitle></CardHeader>
          <CardContent>
            {analytics.revenueByCustomer.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.revenueByCustomer}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Invoice Status</CardTitle></CardHeader>
          <CardContent>
            {analytics.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={analytics.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {analytics.statusData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No invoice data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Customer Breakdown</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>${c.spent.toFixed(2)}</TableCell>
                  <TableCell>{c.invoices}</TableCell>
                  <TableCell>{c.lastActivity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
