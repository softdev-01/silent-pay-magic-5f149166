import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useServices } from "@/lib/service-context";
import { mockInvoices, mockTransactions } from "@/lib/mock-data";
import { DollarSign, TrendingUp, Users, FileText, Zap, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ProviderAnalyticsPage() {
  const { user } = useAuth();
  const { services: allServices } = useServices();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const analytics = useMemo(() => {
    if (!user) return null;

    const myInvoices = mockInvoices.filter((i) => i.providerId === user.id);
    const myServices = allServices.filter((s) => s.providerId === user.id);

    // Filter by month
    const filtered = selectedMonth === "all"
      ? myInvoices
      : myInvoices.filter((inv) => {
          const d = new Date(inv.createdAt);
          return `${d.getFullYear()}-${d.getMonth()}` === selectedMonth;
        });

    const myTransactions = mockTransactions.filter((t) =>
      filtered.some((inv) => inv.id === t.invoiceId)
    );

    // Customer breakdown
    const customerMap = new Map<string, { name: string; spent: number; invoices: number; lastActivity: string }>();
    filtered.forEach((inv) => {
      const existing = customerMap.get(inv.customerId) || {
        name: inv.customerName, spent: 0, invoices: 0, lastActivity: inv.createdAt,
      };
      existing.spent += inv.status === "paid" ? inv.amount : 0;
      existing.invoices += 1;
      if (inv.createdAt > existing.lastActivity) existing.lastActivity = inv.createdAt;
      customerMap.set(inv.customerId, existing);
    });

    const customers = Array.from(customerMap.entries()).map(([id, data]) => ({ id, ...data }));

    const totalRevenue = filtered.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
    const totalInvoices = filtered.length;
    const paidCount = filtered.filter((i) => i.status === "paid").length;
    const successRate = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;
    const uniqueCustomers = customerMap.size;

    // Status distribution for pie chart
    const statusCounts: Record<string, number> = { paid: 0, pending: 0, failed: 0, refunded: 0 };
    filtered.forEach((i) => { statusCounts[i.status] += 1; });
    const statusData = Object.entries(statusCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Revenue by customer for bar chart
    const revenueByCustomer = customers
      .filter((c) => c.spent > 0)
      .map((c) => ({ name: c.name.split(" ")[0], revenue: c.spent }));

    // Monthly revenue trend (all invoices, not filtered)
    const monthlyMap = new Map<string, number>();
    myInvoices.forEach((inv) => {
      if (inv.status !== "paid") return;
      const d = new Date(inv.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + inv.amount);
    });
    const monthlyRevenue = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => {
        const [y, m] = key.split("-");
        return { month: `${MONTH_SHORT[parseInt(m)]} ${y}`, revenue };
      });

    // Service rate breakdown
    const serviceRate = myServices.map((svc) => {
      const svcInvoices = filtered.filter((inv) => inv.serviceName === svc.name);
      const count = svcInvoices.length;
      const revenue = svcInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
      return { name: svc.name, price: svc.price, count, revenue, category: svc.category, status: svc.status };
    });

    // Available months for filter
    const availableMonths = new Map<string, string>();
    myInvoices.forEach((inv) => {
      const d = new Date(inv.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      availableMonths.set(key, `${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
    });

    return {
      totalRevenue, totalInvoices, successRate, uniqueCustomers,
      customers, statusData, revenueByCustomer, myTransactions,
      monthlyRevenue, serviceRate,
      availableMonths: Array.from(availableMonths.entries()).sort(([a], [b]) => b.localeCompare(a)),
    };
  }, [user, selectedMonth, allServices]);

  if (!analytics) return null;

  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--destructive))",
    "hsl(var(--muted-foreground))",
  ];

  return (
    <DashboardLayout>
      {/* Month filter */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Customer Analytics</h2>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {analytics.availableMonths.map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue" value={`$${analytics.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Total Invoices" value={analytics.totalInvoices} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Success Rate" value={`${analytics.successRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Customers" value={analytics.uniqueCustomers} icon={<Users className="h-5 w-5" />} />
      </div>

      {/* Monthly Revenue Trend */}
      {analytics.monthlyRevenue.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Monthly Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Service Rate Breakdown */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" /> Service Rate Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Times Ordered</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.serviceRate.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No services found</TableCell>
                </TableRow>
              ) : (
                analytics.serviceRate.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.category}</TableCell>
                    <TableCell>${s.price.toFixed(2)}</TableCell>
                    <TableCell>{s.count}</TableCell>
                    <TableCell className="font-semibold">${s.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
