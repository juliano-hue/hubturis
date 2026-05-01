import { NextRequest, NextResponse } from 'next/server';

// Armazenamento simples em memória (para produção, considere usar Redis)
const ipRequests = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;   // Janela de tempo em milissegundos (ex: 15 * 60 * 1000 = 15 minutos)
  maxRequests: number; // Número máximo de requisições permitidas na janela
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;

  // Esta função retorna um NextResponse se o limite foi excedido, ou null se está ok
  return function checkLimit(request: NextRequest): NextResponse | null {
    // Tenta obter o IP real do cliente (levando em conta proxies)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const record = ipRequests.get(ip);
    
    // Limpa registros antigos
    if (record && record.resetTime <= now) {
      ipRequests.delete(ip);
    }
    
    const currentRecord = ipRequests.get(ip);
    
    if (!currentRecord) {
      // Primeira requisição deste IP
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Permite a requisição
    }
    
    // Verifica se o limite foi excedido
    if (currentRecord.count >= maxRequests) {
      const waitTime = Math.ceil((currentRecord.resetTime - now) / 1000);
      return new NextResponse(
        JSON.stringify({ 
          error: `Muitas tentativas. Por favor, aguarde ${waitTime} segundos antes de tentar novamente.`,
          retryAfter: waitTime
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(waitTime),
          }
        }
      );
    }
    
    // Incrementa o contador
    currentRecord.count++;
    return null; // Permite a requisição
  };
}

// Limpa registros antigos a cada 5 minutos para evitar vazamento de memória
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequests.entries()) {
    if (record.resetTime <= now) {
      ipRequests.delete(ip);
    }
  }
}, 5 * 60 * 1000);