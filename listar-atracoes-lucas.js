const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lucas = await prisma.user.findUnique({
    where: { email: 'natal4x4@turis-hub.com' }
  });
  
  if (lucas) {
    const attractions = await prisma.attraction.findMany({
      where: { providerId: lucas.id }
    });
    console.log('Atrações do Lucas:');
    attractions.forEach((a, i) => {
      console.log(`${i+1}. ID: ${a.id} | Título: ${a.title}`);
    });
  } else {
    console.log('Lucas não encontrado');
  }
}

main().finally(() => prisma.$disconnect());