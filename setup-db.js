const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  console.log('Starting database setup...');
  try {
    // Create Customer table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Customer" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "location" TEXT,
        "lastVisited" TEXT DEFAULT 'Never',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "notes" TEXT,
        "attachmentUrl" TEXT,
        "signatureUrl" TEXT
      )
    `);
    console.log('Table "Customer" checked/created.');

    // Create Project table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phase" TEXT NOT NULL,
        "date" TEXT,
        "description" TEXT,
        "estimatedValue" DOUBLE PRECISION,
        "winConfidence" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "Project" checked/created.');

    // Create ProjectCustomer table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ProjectCustomer" (
        "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
        "customerId" TEXT NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE,
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,
        PRIMARY KEY ("projectId", "customerId")
      )
    `);
    console.log('Table "ProjectCustomer" checked/created.');

    // Create Invoice table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Invoice" (
        "id" TEXT PRIMARY KEY,
        "invoiceId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "subtotal" DOUBLE PRECISION NOT NULL,
        "total" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "sentAt" TIMESTAMP(3),
        "customerId" TEXT NOT NULL REFERENCES "Customer"("id"),
        "projectId" TEXT REFERENCES "Project"("id")
      )
    `);
    console.log('Table "Invoice" checked/created.');

    // Create InvoiceItem table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "InvoiceItem" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "qty" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "invoiceId" TEXT NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE
      )
    `);
    console.log('Table "InvoiceItem" checked/created.');

    // Create Product table
    await pool.query(`
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
    console.log('Table "Product" checked/created.');

    console.log('Database setup completed successfully!');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
}

setup();
