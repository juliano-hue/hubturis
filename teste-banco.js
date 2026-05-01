const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testar() {
  console.log('🔄 Testando conexão com o banco...');
  
  try {
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Tentar contar usuários
    const totalUsuarios = await prisma.user.count();
    console.log(`✅ Total de usuários: ${totalUsuarios}`);
    
    // Tentar contar atrações
    const totalAtracoes = await prisma.attraction.count();
    console.log(`✅ Total de atrações: ${totalAtracoes}`);
    
    console.log('\n🎉 Banco de dados funcionando perfeitamente!');
    console.log('🚀 Agora você pode rodar: npm run dev');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se o container Docker está rodando: docker ps');
    console.log('2. Confirme a senha no .env: postgres:984698ju');
    console.log('3. Teste manual: docker exec -it turis-hub-db-1 psql -U postgres -c "SELECT 1"');
  } finally {
    await prisma.$disconnect();
  }
}

testar();