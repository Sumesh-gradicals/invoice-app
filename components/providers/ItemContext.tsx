"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the Item type
export type Item = {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  sku?: string;
  type?: string; // 'Service', 'Physical', etc.
  stock?: "Available" | "Unavailable";
};

// Define the context shape
interface ItemContextType {
  items: Item[];
  addItem: (item: Omit<Item, "id">) => void;
  deleteItem: (id: string) => void;
}

// Create the context
const ItemContext = createContext<ItemContextType | undefined>(undefined);

// Initial Mock Data (Optional, can be empty)
const INITIAL_ITEMS: Item[] = [];

import { getItems, addItem as addItemAction, deleteItem as deleteItemAction, ensureProductTable } from "@/app/actions/items";

// Provider Component
export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from database on mount
  useEffect(() => {
    async function loadItems() {
      try {
        await ensureProductTable();
        const data = await getItems();
        setItems(data);
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadItems();
  }, []);

  const addItem = async (newItemData: Omit<Item, "id">) => {
    try {
      const newItem = await addItemAction(newItemData);
      setItems((prev) => [...prev, newItem]);
    } catch (e) {
      console.error("Failed to add item", e);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteItemAction(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  };

  return (
    <ItemContext.Provider value={{ items, addItem, deleteItem }}>
      {children}
    </ItemContext.Provider>
  );
}

// Custom hook to use the context
export function useItems() {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error("useItems must be used within a ItemProvider");
  }
  return context;
}
