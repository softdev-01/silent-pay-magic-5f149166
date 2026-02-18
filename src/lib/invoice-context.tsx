import { createContext, useContext, useState, ReactNode } from "react";
import { Invoice } from "./types";
import { mockInvoices } from "./mock-data";

interface InvoiceContextType {
  invoices: Invoice[];
  payInvoice: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
}

const InvoiceContext = createContext<InvoiceContextType>({
  invoices: [],
  payInvoice: () => {},
  addInvoice: () => {},
});

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  const payInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: "paid" as const, paidAt: new Date().toISOString().slice(0, 10) }
          : inv
      )
    );
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  return (
    <InvoiceContext.Provider value={{ invoices, payInvoice, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export const useInvoices = () => useContext(InvoiceContext);
