const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  console.log('Starting database migration...');
  try {
    // Add notes column if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='notes') THEN
          ALTER TABLE "Customer" ADD COLUMN "notes" TEXT;
        END IF;
      END $$;
    `);
    console.log('Column "notes" checked/added.');

    // Add attachmentUrl column if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='attachmentUrl') THEN
          ALTER TABLE "Customer" ADD COLUMN "attachmentUrl" TEXT;
        END IF;
      END $$;
    `);
    console.log('Column "attachmentUrl" checked/added.');

    // Add signatureUrl column if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='signatureUrl') THEN
          ALTER TABLE "Customer" ADD COLUMN "signatureUrl" TEXT;
        END IF;
      END $$;
    `);
    console.log('Column "signatureUrl" checked/added.');

    console.log('Database migration completed successfully!');
  } catch (err) {
    console.error('Error migrating database:', err);
  } finally {
    await pool.end();
  }
}

migrate();
