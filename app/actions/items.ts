"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getItems() {
  const result = await query('SELECT * FROM "Product" ORDER BY "name" ASC');
  return result.rows;
}

export async function addItem(data: {
  name: string;
  price: number;
  description?: string;
  category?: string;
  sku?: string;
  type?: string;
}) {
  const id = Math.random().toString(36).substring(2, 11);
  const result = await query(
    'INSERT INTO "Product" (id, name, price, description, category, sku, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [id, data.name, data.price, data.description, data.category, data.sku, data.type]
  );
  revalidatePath("/payments/items");
  return result.rows[0];
}

export async function deleteItem(id: string) {
  await query('DELETE FROM "Product" WHERE id = $1', [id]);
  revalidatePath("/payments/items");
}

// Helper to create the table if it doesn't exist (as a fallback)
export async function ensureProductTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "price" DOUBLE PRECISION NOT NULL,
      "description" TEXT,
      "category" TEXT,
      "sku" TEXT,
      "type" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
