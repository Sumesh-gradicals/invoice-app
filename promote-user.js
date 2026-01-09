const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const email = process.argv[2];
const role = process.argv[3] || 'Admin';

if (!email) {
  console.log('Usage: node promote-user.js <email> [role]');
  process.exit(1);
}

async function promote() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE "Profile" SET "role" = $1, "updatedAt" = NOW() WHERE "email" = $2 RETURNING *',
      [role, email]
    );
    
    if (res.rowCount === 0) {
      console.log(`User with email ${email} not found in Profile table.`);
      console.log('Make sure they have logged in at least once or are present in the table.');
    } else {
      console.log(`Successfully updated ${email} to role: ${role}`);
      console.log(res.rows[0]);
    }
  } catch (err) {
    console.error('Error updating user:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

promote();
