"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the Customer type
export type Customer = {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  location?: string;
  lastVisited?: string;
  projects?: { id: string; name: string }[];
  notes?: string;
  attachmentUrl?: string;
  signatureUrl?: string;
};

// Define the context shape
interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "lastVisited">) => Promise<Customer | null>;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, "id">>) => Promise<Customer | null>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  refreshCustomers: () => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

// Create the context
const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

import { 
  getCustomers, 
  addCustomer as addCustomerAction, 
  updateCustomer as updateCustomerAction,
  getCustomerById as getCustomerByIdAction,
  deleteCustomer as deleteCustomerAction 
} from "@/app/actions/customers";

// Provider Component
export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load customers from database on mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (e) {
        console.error("Failed to fetch customers", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadCustomers();
  }, []);

  const refreshCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error("Failed to refresh customers", e);
    }
  };

  const addCustomer = async (newCustomerData: Omit<Customer, "id" | "lastVisited">) => {
    try {
      const newCustomer = await addCustomerAction(newCustomerData);
      // Refresh customers to get updated list
      const data = await getCustomers();
      setCustomers(data);
      return newCustomer;
    } catch (e) {
      console.error("Failed to add customer", e);
      return null;
    }
  };

  const updateCustomer = async (id: string, updatedData: Partial<Omit<Customer, "id">>) => {
    try {
      const updatedCustomer = await updateCustomerAction(id, updatedData);
      const data = await getCustomers();
      setCustomers(data);
      return updatedCustomer;
    } catch (e) {
      console.error("Failed to update customer", e);
      return null;
    }
  };

  const getCustomerById = async (id: string) => {
    try {
      return await getCustomerByIdAction(id);
    } catch (e) {
      console.error("Failed to get customer by id", e);
      return null;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteCustomerAction(id);
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error("Failed to delete customer", e);
    }
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, getCustomerById, refreshCustomers, deleteCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

// Custom hook to use the context
export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
}
