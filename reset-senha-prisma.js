const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'consumer@turis-hub.com';
    const newPassword = 'consumer123';
    
    // Gerar hash bcrypt
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    // Atualizar diretamente via Prisma
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log(`✅ Senha atualizada para: ${user.email}`);
    console.log(`🔑 Nova senha: ${newPassword}`);
    console.log(`🔒 Hash gerado: ${hashedPassword}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();