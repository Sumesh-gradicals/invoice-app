"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAdmin } from "./auth";

export async function getInvoices(projectId?: string) {
  let queryText = `
    SELECT i.*, c.name as "customerName", c.email as "customerEmail"
    FROM "Invoice" i
    JOIN "Customer" c ON i."customerId" = c.id
  `;
  const params: any[] = [];

  if (projectId) {
    queryText += ` WHERE i."projectId" = $1`;
    params.push(projectId);
  }

  queryText += ` ORDER BY i."createdAt" DESC`;

  const invoicesResult = await query(queryText, params);
  const invoices = invoicesResult.rows;

  for (const invoice of invoices) {
    // Fetch items
    const itemsResult = await query('SELECT * FROM "InvoiceItem" WHERE "invoiceId" = $1', [invoice.id]);
    invoice.items = itemsResult.rows;
    
    // Format customer object to match frontend expectations
    invoice.customer = {
      id: invoice.customerId,
      name: invoice.customerName,
      email: invoice.customerEmail
    };
  }

  return invoices;
}

export async function addInvoice(data: {
  invoiceId: string;
  title: string;
  customerId: string;
  projectId?: string | null;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  total: number;
  status: string;
  date: string;
}) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Only Admins can create invoices");
  }

  const id = Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  // Insert invoice
  await query(
    `INSERT INTO "Invoice" (id, "invoiceId", title, subtotal, total, status, date, "createdAt", "customerId", "projectId") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, data.invoiceId, data.title, data.subtotal, data.total, data.status, data.date, now, data.customerId, data.projectId || null]
  );

  // Insert items
  for (const item of data.items) {
    const itemId = Math.random().toString(36).substring(2, 11);
    await query(
      'INSERT INTO "InvoiceItem" (id, name, qty, price, "invoiceId") VALUES ($1, $2, $3, $4, $5)',
      [itemId, item.name, item.qty, item.price, id]
    );
  }

  revalidatePath("/payments/invoices");
  if (data.projectId) revalidatePath(`/payments/projects/${data.projectId}`);
  return { id, ...data };
}

export async function updateInvoiceStatus(id: string, status: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Only Admins can update invoice status");
  }

  await query('UPDATE "Invoice" SET "status" = $1 WHERE id = $2', [status, id]);
  revalidatePath("/payments/invoices");
  
  // Also revalidate project path if linked
  const result = await query('SELECT "projectId" FROM "Invoice" WHERE id = $1', [id]);
  if (result.rows[0]?.projectId) {
    revalidatePath(`/payments/projects/${result.rows[0].projectId}`);
  }
}

export async function getInvoiceStats() {
  const result = await query(`
    SELECT 
      SUM(CASE WHEN status = 'Paid' THEN total ELSE 0 END) as "totalPaid",
      SUM(CASE WHEN status IN ('Sent', 'Overdue') THEN total ELSE 0 END) as "totalOutstanding",
      SUM(CASE WHEN status = 'Draft' THEN total ELSE 0 END) as "totalDraft",
      COUNT(*) as "totalCount"
    FROM "Invoice"
  `, []);
  
  const stats = result.rows[0];
  return {
    totalPaid: parseFloat(stats.totalPaid || 0),
    totalOutstanding: parseFloat(stats.totalOutstanding || 0),
    totalDraft: parseFloat(stats.totalDraft || 0),
    totalCount: parseInt(stats.totalCount || 0)
  };
}

export async function deleteInvoice(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Only Admins can delete invoices");
  }

  const result = await query(`DELETE FROM "Invoice" WHERE id = $1 RETURNING "projectId"`, [id]);
  revalidatePath("/payments/invoices");
  if (result.rows[0]?.projectId) {
    revalidatePath(`/payments/projects/${result.rows[0].projectId}`);
  }
}
