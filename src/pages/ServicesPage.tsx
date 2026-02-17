import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { mockServices } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { Zap } from "lucide-react";

export default function ServicesPage() {
  const { user } = useAuth();
  const services = user?.role === "provider"
    ? mockServices.filter((s) => s.providerId === "p1")
    : mockServices;

  return (
    <DashboardLayout>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <StatusBadge status={s.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.providerName}</span>
                <span className="font-display text-lg font-bold">${s.price}</span>
              </div>
              {user?.role === "customer" && (
                <Button className="w-full gap-2" size="sm">
                  <Zap className="h-4 w-4" /> Request Service
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
