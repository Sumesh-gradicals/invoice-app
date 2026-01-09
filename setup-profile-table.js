const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  const client = await pool.connect();
  try {
    console.log('Creating Profile table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Profile" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'Ops',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Profile_email_key" ON "Profile"("email");
    `);
    
    console.log('Profile table created successfully.');
  } catch (err) {
    console.error('Error creating Profile table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
