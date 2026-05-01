const dotenv = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`🔧 Carregando ambiente: ${env}`);
console.log(`📁 Arquivo: ${envFile}`);
console.log(`✅ DATABASE_URL: ${process.env.DATABASE_URL ? '✓' : '✗'}`);