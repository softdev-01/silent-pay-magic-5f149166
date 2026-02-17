import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserRole } from "@/lib/types";
import { Zap } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("customer");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login("", role);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Sign in to InvisiPay</CardTitle>
          <CardDescription>Select a role to preview the demo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="provider">Provider</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" defaultValue="demo@invisipay.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" defaultValue="demo1234" />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
