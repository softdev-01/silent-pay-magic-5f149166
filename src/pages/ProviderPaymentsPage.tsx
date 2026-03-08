import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, DollarSign } from "lucide-react";

interface PaymentNotification {
  id: string;
  invoice_id: string;
  payer_name: string;
  payer_email: string | null;
  invoice_number: string;
  service_name: string;
  amount: number;
  currency: string;
  paid_at: string;
  is_read: boolean;
}

export default function ProviderPaymentsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("payment-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "payment_notifications",
        },
        (payload) => {
          const newNotif = payload.new as PaymentNotification;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_notifications")
      .select("*")
      .order("paid_at", { ascending: false });

    if (!error && data) {
      setNotifications(data as PaymentNotification[]);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("payment_notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("payment_notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Bell className="h-5 w-5 text-primary" />
          Received Payments
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount} new
            </Badge>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No payments received yet. Share your invoice QR codes to get paid!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payer</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Service(s)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid At</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow
                    key={n.id}
                    className={n.is_read ? "" : "bg-primary/5"}
                  >
                    <TableCell className="font-medium">
                      <div>
                        {n.payer_name}
                        {n.payer_email && (
                          <p className="text-xs text-muted-foreground">{n.payer_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{n.invoice_number}</TableCell>
                    <TableCell>{n.service_name}</TableCell>
                    <TableCell className="font-semibold">
                      ${n.amount.toFixed(2)} {n.currency}
                    </TableCell>
                    <TableCell>
                      {new Date(n.paid_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {n.is_read ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(n.id)}
                          className="gap-1.5"
                        >
                          <CheckCheck className="h-3.5 w-3.5" /> Mark read
                        </Button>
                      )}
                    </TableCell>
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
