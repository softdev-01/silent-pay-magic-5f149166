import { User, Invoice, Service, Transaction } from "./types";

export const mockUsers: User[] = [
  { id: "c1", name: "Maria Santos", email: "maria@email.com", role: "customer", walletLinked: true, walletProvider: "PayPal", createdAt: "2025-11-15" },
  { id: "c2", name: "James Chen", email: "james@email.com", role: "customer", walletLinked: true, walletProvider: "PayPal", createdAt: "2025-12-01" },
  { id: "c3", name: "Aisha Patel", email: "aisha@email.com", role: "customer", walletLinked: false, createdAt: "2026-01-10" },
  { id: "p1", name: "QuickFix Plumbing", email: "hello@quickfix.com", role: "provider", walletLinked: true, walletProvider: "PayPal", createdAt: "2025-10-01" },
  { id: "p2", name: "SparkClean Co.", email: "info@sparkclean.com", role: "provider", walletLinked: true, walletProvider: "PayPal", createdAt: "2025-09-20" },
  { id: "a1", name: "System Admin", email: "admin@invisipay.com", role: "admin", walletLinked: false, createdAt: "2025-08-01" },
];

export const mockInvoices: Invoice[] = [
  { id: "inv1", invoiceNumber: "INV-2026-001", customerId: "c1", customerName: "Maria Santos", providerId: "p1", providerName: "QuickFix Plumbing", serviceName: "Pipe Repair", amount: 150.00, currency: "USD", status: "paid", createdAt: "2026-02-10", paidAt: "2026-02-10" },
  { id: "inv2", invoiceNumber: "INV-2026-002", customerId: "c2", customerName: "James Chen", providerId: "p2", providerName: "SparkClean Co.", serviceName: "Deep House Cleaning", amount: 220.00, currency: "USD", status: "paid", createdAt: "2026-02-12", paidAt: "2026-02-12" },
  { id: "inv3", invoiceNumber: "INV-2026-003", customerId: "c1", customerName: "Maria Santos", providerId: "p2", providerName: "SparkClean Co.", serviceName: "Office Cleaning", amount: 180.00, currency: "USD", status: "pending", createdAt: "2026-02-15" },
  { id: "inv4", invoiceNumber: "INV-2026-004", customerId: "c2", customerName: "James Chen", providerId: "p1", providerName: "QuickFix Plumbing", serviceName: "Faucet Installation", amount: 95.00, currency: "USD", status: "failed", createdAt: "2026-02-14" },
  { id: "inv5", invoiceNumber: "INV-2026-005", customerId: "c3", customerName: "Aisha Patel", providerId: "p1", providerName: "QuickFix Plumbing", serviceName: "Drain Unclogging", amount: 75.00, currency: "USD", status: "refunded", createdAt: "2026-02-08", paidAt: "2026-02-08" },
];

export const mockServices: Service[] = [
  { id: "s1", name: "Pipe Repair", description: "Fix leaking or broken pipes", providerId: "p1", providerName: "QuickFix Plumbing", price: 150, currency: "USD", category: "Plumbing", status: "active", deliveryAvailable: true, deliveryFee: 25 },
  { id: "s2", name: "Faucet Installation", description: "Install new faucets", providerId: "p1", providerName: "QuickFix Plumbing", price: 95, currency: "USD", category: "Plumbing", status: "active", deliveryAvailable: true, deliveryFee: 15 },
  { id: "s3", name: "Drain Unclogging", description: "Clear blocked drains", providerId: "p1", providerName: "QuickFix Plumbing", price: 75, currency: "USD", category: "Plumbing", status: "active", deliveryAvailable: false },
  { id: "s4", name: "Deep House Cleaning", description: "Full home deep clean", providerId: "p2", providerName: "SparkClean Co.", price: 220, currency: "USD", category: "Cleaning", status: "active", deliveryAvailable: true, deliveryFee: 30 },
  { id: "s5", name: "Office Cleaning", description: "Professional office cleaning", providerId: "p2", providerName: "SparkClean Co.", price: 180, currency: "USD", category: "Cleaning", status: "active", deliveryAvailable: true, deliveryFee: 20 },
];

export const mockTransactions: Transaction[] = [
  { id: "t1", invoiceId: "inv1", amount: 150, currency: "USD", status: "success", method: "PayPal", idempotencyKey: "idem-001", createdAt: "2026-02-10T14:30:00Z", customerName: "Maria Santos", providerName: "QuickFix Plumbing" },
  { id: "t2", invoiceId: "inv2", amount: 220, currency: "USD", status: "success", method: "PayPal", idempotencyKey: "idem-002", createdAt: "2026-02-12T09:15:00Z", customerName: "James Chen", providerName: "SparkClean Co." },
  { id: "t3", invoiceId: "inv4", amount: 95, currency: "USD", status: "failed", method: "PayPal", idempotencyKey: "idem-003", createdAt: "2026-02-14T16:45:00Z", customerName: "James Chen", providerName: "QuickFix Plumbing" },
  { id: "t4", invoiceId: "inv5", amount: 75, currency: "USD", status: "refunded", method: "PayPal", idempotencyKey: "idem-004", createdAt: "2026-02-08T11:00:00Z", customerName: "Aisha Patel", providerName: "QuickFix Plumbing" },
];

export const stats = {
  totalRevenue: 720,
  totalTransactions: 4,
  activeUsers: 5,
  pendingInvoices: 1,
  successRate: 50,
};
