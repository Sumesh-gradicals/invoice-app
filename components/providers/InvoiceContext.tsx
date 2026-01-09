"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getInvoices, addInvoice as addInvoiceAction, updateInvoiceStatus } from "@/app/actions/invoices";

export type InvoiceStatus = "Draft" | "Paid" | "Overdue" | "Sent";

export type Invoice = {
  id: string;
  invoiceId: string; // The readable ID e.g. 000001
  title: string;
  customer: any; // Using any for flexibility, better to share Customer type
  items: any[];
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  date: string;
  createdAt: string;
  sentAt?: string;
  projectId?: string | null;
};

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id" | "createdAt">) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  updateStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Database
  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (e) {
        console.error("Failed to fetch invoices", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadInvoices();
  }, []);

  const addInvoice = async (newInvoiceData: Omit<Invoice, "id" | "createdAt">) => {
    try {
      await addInvoiceAction({
        ...newInvoiceData,
        customerId: newInvoiceData.customer.id,
        projectId: newInvoiceData.projectId
      });
      // Refresh from DB to get full structure
      const updatedInvoices = await getInvoices();
      setInvoices(updatedInvoices);
    } catch (e) {
      console.error("Failed to add invoice", e);
    }
  };

  const updateStatus = async (id: string, status: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(id, status);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
      );
    } catch (e) {
      console.error("Failed to update invoice status", e);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await import("@/app/actions/invoices").then(mod => mod.deleteInvoice(id));
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) {
      console.error("Failed to delete invoice", e);
    }
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice, updateStatus, deleteInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within a InvoiceProvider");
  }
  return context;
}
