import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { mockTransactions } from "@/lib/mock-data";
import { RotateCcw } from "lucide-react";

export default function AdminTransactionsPage() {
  return (
    <DashboardLayout>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.idempotencyKey}</TableCell>
                  <TableCell>{t.customerName}</TableCell>
                  <TableCell>{t.providerName}</TableCell>
                  <TableCell>${t.amount.toFixed(2)}</TableCell>
                  <TableCell>{t.method}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-sm">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {t.status === "success" && (
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <RotateCcw className="h-3 w-3" /> Refund
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
