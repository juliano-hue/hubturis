// teste-simples.js
const { PrismaClient } = require('@prisma/client');

// Carregar variáveis de ambiente manualmente
require('dotenv').config();

const prisma = new PrismaClient();

async function test() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('\n🔄 Conectando ao banco...');
  
  try {
    await prisma.$connect();
    console.log('✅ Conectado!');
    
    const count = await prisma.attraction.count();
    console.log(`✅ Atrações encontradas: ${count}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();