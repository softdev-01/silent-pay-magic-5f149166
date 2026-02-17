import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Link2, Unlink, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function WalletPage() {
  const { user } = useAuth();
  const [linked, setLinked] = useState(user?.walletLinked ?? false);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> E-Wallet Connection
            </CardTitle>
            <CardDescription>
              Link your PayPal wallet to enable invisible background payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">PayPal</p>
                  <p className="text-sm text-muted-foreground">
                    {linked ? `Connected as ${user?.email}` : "Not connected"}
                  </p>
                </div>
              </div>
              <Badge variant={linked ? "default" : "secondary"} className={linked ? "bg-success text-success-foreground" : ""}>
                {linked ? "Active" : "Inactive"}
              </Badge>
            </div>

            {linked ? (
              <Button variant="destructive" className="w-full gap-2" onClick={() => setLinked(false)}>
                <Unlink className="h-4 w-4" /> Revoke Wallet Access
              </Button>
            ) : (
              <Button className="w-full gap-2" onClick={() => setLinked(true)}>
                <Link2 className="h-4 w-4" /> Link PayPal Wallet
              </Button>
            )}

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Security Notice</p>
                  <p className="text-xs text-muted-foreground">
                    We never store your wallet credentials. A secure token is used for all transactions following PCI-DSS standards.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
