"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const result = await query('SELECT * FROM "Customer" ORDER BY "name" ASC');
  const customers = result.rows;

  for (const customer of customers) {
    const projectsResult = await query(
      `SELECT p.name 
       FROM "Project" p 
       JOIN "ProjectCustomer" pc ON p.id = pc."projectId" 
       WHERE pc."customerId" = $1`,
      [customer.id]
    );
    customer.projects = projectsResult.rows.map((r: any) => r.name);
  }

  return customers;
}

export async function getCustomerById(id: string) {
  const result = await query('SELECT * FROM "Customer" WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  
  const customer = result.rows[0];
  const projectsResult = await query(
    `SELECT p.id, p.name 
     FROM "Project" p 
     JOIN "ProjectCustomer" pc ON p.id = pc."projectId" 
     WHERE pc."customerId" = $1`,
    [id]
  );
  customer.projects = projectsResult.rows;
  
  return customer;
}

export async function addCustomer(data: {
  id?: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  location?: string;
  notes?: string;
  attachmentUrl?: string;
  signatureUrl?: string;
}) {
  const id = Math.random().toString(36).substring(2, 11);
  const result = await query(
    'INSERT INTO "Customer" (id, name, email, address, phone, location, notes, "attachmentUrl", "signatureUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [data.id || id, data.name, data.email, data.address, data.phone, data.location, data.notes, data.attachmentUrl, data.signatureUrl]
  );
  revalidatePath("/customers");
  return result.rows[0];
}

export async function updateCustomer(id: string, data: {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  location?: string;
  notes?: string;
  attachmentUrl?: string;
  signatureUrl?: string;
}) {
  const result = await query(
    `UPDATE "Customer" 
     SET name = COALESCE($2, name), 
         email = COALESCE($3, email), 
         address = COALESCE($4, address), 
         phone = COALESCE($5, phone), 
         location = COALESCE($6, location),
         notes = COALESCE($7, notes),
         "attachmentUrl" = COALESCE($8, "attachmentUrl"),
         "signatureUrl" = COALESCE($9, "signatureUrl"),
         "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $1 
     RETURNING *`,
    [id, data.name, data.email, data.address, data.phone, data.location, data.notes, data.attachmentUrl, data.signatureUrl]
  );
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return result.rows[0];
}

export async function deleteCustomer(id: string) {
  // First remove from all projects
  await query('DELETE FROM "ProjectCustomer" WHERE "customerId" = $1', [id]);
  // Then delete the customer
  await query('DELETE FROM "Customer" WHERE id = $1', [id]);
  revalidatePath("/customers");
  revalidatePath("/payments/projects");
}
