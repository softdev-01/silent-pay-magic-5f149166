import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stats } from "@/lib/mock-data";
import { DollarSign, TrendingUp, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const chartData = [
  { name: "Jan", revenue: 420 },
  { name: "Feb", revenue: 720 },
  { name: "Mar", revenue: 0 },
  { name: "Apr", revenue: 0 },
];

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Success Rate" value={`${stats.successRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Active Users" value={stats.activeUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Transactions" value={stats.totalTransactions} icon={<Activity className="h-5 w-5" />} />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Revenue Overview</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
