import { z } from 'zod';

// Validação de usuário
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['CONSUMER', 'PROVIDER']),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Validação de atração
export const attractionSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
  description: z.string().min(10, 'Descrição muito curta').max(5000),
  location: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  price: z.number().positive('Preço deve ser positivo'),
  duration: z.number().positive().optional(),
  maxCapacity: z.number().positive().optional(),
  category: z.string().optional(),
  images: z.array(z.string().url()).max(20, 'Máximo 20 imagens').optional(),
});

// Validação de reserva
export const bookingSchema = z.object({
  attractionId: z.string().uuid('ID inválido'),
  availabilityId: z.string().uuid().optional(),
  date: z.string().datetime(),
  participants: z.number().int().min(1).max(50),
  totalPrice: z.number().positive(),
  specialRequests: z.string().max(500).optional(),
});

// Validação de avaliação
export const reviewSchema = z.object({
  attractionId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});