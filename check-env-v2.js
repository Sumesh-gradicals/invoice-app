const fs = require('fs');
const path = require('path');

function checkFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`--- ${filename} ---`);
    console.log(`Size: ${content.length} bytes`);
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.startsWith('DATABASE_URL') || line.startsWith('DIRECT_URL')) {
        const [key, value] = line.split('=');
        console.log(`${key} exists: true`);
        console.log(`${key} starts with: ${value ? value.trim().substring(0, 15) : 'empty'}`);
      }
    });
  } else {
    console.log(`${filename} does not exist`);
  }
}

checkFile('.env');
checkFile('.env.local');

require('dotenv').config();
console.log('--- Process Env ---');
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'undefined');
