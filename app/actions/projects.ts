"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const projectsResult = await query('SELECT * FROM "Project" ORDER BY "createdAt" DESC');
  const projects = projectsResult.rows;

  // Fetch customers for each project
  for (const project of projects) {
    const customersResult = await query(
      `SELECT c.*, pc."isPrimary" 
       FROM "Customer" c 
       JOIN "ProjectCustomer" pc ON c.id = pc."customerId" 
       WHERE pc."projectId" = $1 
       ORDER BY pc."isPrimary" DESC`,
      [project.id]
    );
    project.customers = customersResult.rows;
  }

  return projects;
}

export async function addProject(data: {
  name: string;
  phase: string;
  customers: { id: string; isPrimary: boolean }[];
  date?: string;
  description?: string;
  estimatedValue?: number;
  winConfidence?: string;
}) {
  const id = Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  // Insert project
  await query(
    `INSERT INTO "Project" (id, name, phase, date, description, "estimatedValue", "winConfidence", "createdAt", "lastActivity") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, data.name, data.phase, data.date, data.description, data.estimatedValue, data.winConfidence, now, now]
  );

  // Insert project-customer relationships
  for (const customer of data.customers) {
    await query(
      'INSERT INTO "ProjectCustomer" ("projectId", "customerId", "isPrimary") VALUES ($1, $2, $3)',
      [id, customer.id, customer.isPrimary]
    );
  }

  revalidatePath("/payments/projects");
  return { id, ...data };
}

export async function updateProjectPhase(id: string, newPhase: string) {
  await query('UPDATE "Project" SET "phase" = $1, "lastActivity" = $2 WHERE id = $3', [
    newPhase,
    new Date().toISOString(),
    id,
  ]);
  revalidatePath("/payments/projects");
}

export async function addCustomerToProject(projectId: string, customerId: string, isPrimary: boolean = false) {
  await query(
    'INSERT INTO "ProjectCustomer" ("projectId", "customerId", "isPrimary") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [projectId, customerId, isPrimary]
  );
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/payments/projects");
}

export async function removeCustomerFromProject(projectId: string, customerId: string) {
  await query(
    'DELETE FROM "ProjectCustomer" WHERE "projectId" = $1 AND "customerId" = $2',
    [projectId, customerId]
  );
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/payments/projects");
}
