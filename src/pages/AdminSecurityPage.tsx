import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Key, Lock, RefreshCw } from "lucide-react";

const securityItems = [
  { icon: <Key className="h-5 w-5" />, title: "Token Vaulting", desc: "All payment tokens are encrypted at rest using AES-256 and stored in PCI-DSS compliant vaults.", status: "Active" },
  { icon: <RefreshCw className="h-5 w-5" />, title: "Idempotency Keys", desc: "Every transaction uses unique idempotency keys to prevent duplicate charges.", status: "Enabled" },
  { icon: <Lock className="h-5 w-5" />, title: "SCA Compliance", desc: "Strong Customer Authentication is triggered for high-value transactions (>$500).", status: "Configured" },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Auto-Retry Logic", desc: "Failed transactions auto-retry after 24h with customer notification.", status: "Active" },
];

export default function AdminSecurityPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 sm:grid-cols-2">
        {securityItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <span className="text-xs font-medium text-success">{item.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
