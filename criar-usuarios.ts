import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Criando usuários, atrações...')
  const passwordHash = await bcrypt.hash('123456', 10)

  // 1. Admin
  await prisma.user.create({
    data: {
      email: 'admin@hubturis.com.br',
      password: passwordHash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin criado')

  // 2. Consumidores (CPFs únicos, sem zipCode)
  const consumers = [
    { email: 'carla@consumidor.com', name: 'Carla Souza', cpf: '12345678901', card: { number: '4242424242424242', expiry: '12/28', cvv: '123', brand: 'visa' } },
    { email: 'john@consumer.com', name: 'John Consumer', cpf: '23456789012', card: { number: '5555555555554444', expiry: '10/27', cvv: '456', brand: 'mastercard' } },
  ]
  for (const c of consumers) {
    await prisma.user.create({
      data: {
        email: c.email,
        password: passwordHash,
        name: c.name,
        role: 'CONSUMER',
        consumerProfile: {
          create: {
            fullName: c.name,
            cpf: c.cpf,
            phone: '11999999999',
            address: 'Rua dos Consumidores, 123',
            city: 'São Paulo',
            state: 'SP',
            paymentType: 'cartao',
            cardNumber: c.card.number,
            cardExpiry: c.card.expiry,
            cardCvv: c.card.cvv,
            cardBrand: c.card.brand,
          },
        },
      },
    })
  }
  console.log('✅ Consumidores criados')

  // 3. Provedores (com zipCode, CPFs únicos)
  const providers = [
    { email: 'aventura@natal.com', name: 'Aventura Turismo Natal', cpf: '34567890123', address: 'Av. Praia de Ponta Negra, 5000', phone: '84999999999', zipCode: '59090-000', bank: 'Banco do Brasil', agency: '0001', account: '12345-6', pix: 'aventura@natal.com' },
    { email: 'adventure@natal.com', name: 'Adventure Natal Tours', cpf: '45678901234', address: 'Rua da Praia, 1000', phone: '84888888888', zipCode: '59090-000', bank: 'Caixa', agency: '0002', account: '98765-0', pix: 'adventure@natal.com' },
  ]
  for (const p of providers) {
    await prisma.user.create({
      data: {
        email: p.email,
        password: passwordHash,
        name: p.name,
        role: 'PROVIDER',
        providerProfile: {
          create: {
            fullName: p.name,
            cpf: p.cpf,
            phone: p.phone,
            address: p.address,
            city: 'Natal',
            state: 'RN',
            zipCode: p.zipCode,
            bankName: p.bank,
            agency: p.agency,
            accountNumber: p.account,
            accountType: 'CORRENTE',
            pixKey: p.pix,
          },
        },
      },
    })
  }
  console.log('✅ Provedores criados')

  // 4. Atrações (com placeholders)
  const attractions = [
    { providerEmail: 'aventura@natal.com', title: 'Passeio de Buggy', desc: 'Dunas de Genipabu', city: 'Natal', price: 250, image: 'https://via.placeholder.com/800x400?text=Buggy' },
    { providerEmail: 'aventura@natal.com', title: 'Caiaque', desc: 'Lagoa de Extremoz', city: 'Extremoz', price: 180, image: 'https://via.placeholder.com/800x400?text=Caiaque' },
    { providerEmail: 'adventure@natal.com', title: 'City Tour', desc: 'Historic Natal', city: 'Natal', price: 120, image: 'https://via.placeholder.com/800x400?text=City+Tour' },
    { providerEmail: 'adventure@natal.com', title: 'Speedboat', desc: 'Potengi River', city: 'Natal', price: 300, image: 'https://via.placeholder.com/800x400?text=Speedboat' },
  ]
  for (const a of attractions) {
    const provider = await prisma.user.findUnique({ where: { email: a.providerEmail } })
    if (provider) {
      await prisma.attraction.create({
        data: {
          title: a.title,
          description: a.desc,
          location: a.city,
          city: a.city,
          state: 'RN',
          price: a.price,
          providerId: provider.id,
          images: [a.image],
          pricingType: 'PER_PERSON',
        },
      })
    }
  }
  console.log('✅ Atrações criadas')
  console.log('🎉 Tudo pronto! Senha: 123456')
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect())