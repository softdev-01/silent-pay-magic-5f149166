export type UserRole = "customer" | "provider" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  walletLinked: boolean;
  walletProvider?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  serviceId: string;
  serviceName: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  lineItems?: InvoiceLineItem[];
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  paidAt?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  providerId: string;
  providerName: string;
  price: number;
  currency: string;
  category: string;
  status: "active" | "completed" | "cancelled";
  deliveryAvailable?: boolean;
  deliveryFee?: number;
}

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  deliveryRequested: boolean;
  deliveryAddress?: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: "pending" | "accepted" | "invoiced" | "completed" | "cancelled";
  createdAt: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending" | "refunded";
  method: string;
  idempotencyKey: string;
  createdAt: string;
  customerName: string;
  providerName: string;
}
