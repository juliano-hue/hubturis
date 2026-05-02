import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Carregar as variáveis do arquivo .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  console.log(`🔍 Conectando ao banco de dados...`)
  console.log(`📌 DATABASE_URL está definida?`, !!process.env.DATABASE_URL)

  // Contar usuários
  const userCount = await prisma.user.count()
  console.log(`📦 Usuários encontrados: ${userCount}`)

  // Contar atrações
  const attractionCount = await prisma.attraction.count()
  console.log(`🏖️ Atrações encontradas: ${attractionCount}`)

  if (userCount === 0 && attractionCount === 0) {
    console.log(`⚠️ Nenhum dado encontrado no banco local.`)
  } else {
    console.log(`✅ Banco local tem dados! Pronto para migrar.`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })