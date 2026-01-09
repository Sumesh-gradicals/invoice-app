require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 10));
}
