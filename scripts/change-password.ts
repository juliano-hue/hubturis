import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Alterando senha do usuário postgres...');
  
  // Executar comando SQL diretamente
  await prisma.$executeRawUnsafe(`ALTER USER postgres PASSWORD 'YIrUyEaM2AS27GlTXhmZEYAheFYXJwbX';`);
  
  console.log('✅ Senha alterada com sucesso!');
  console.log('⚠️ Agora atualize o .env.local com a nova senha');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());