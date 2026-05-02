'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Lista de imagens de fundo para slideshow
const backgroundImages = [
  '/Frank/IMG_3433.JPG',
  '/Frank/IMG_3434.JPG',
  '/Frank/IMG_3435.JPG',
  '/Frank/IMG_3436.JPG',
  '/Frank/IMG_3437.JPG',
  '/Frank/IMG_3438.JPG',
  '/Frank/IMG_3439.JPG',
  '/Frank/IMG_3440.JPG',
];

export default function SiteLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Slideshow: troca imagem a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/site-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Credenciais inválidas');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-1000"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${backgroundImages[currentImage]}')`
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HubTuris
          </h1>
          <p className="text-gray-600 mt-2 text-sm">Acesso restrito - Sistema em fase de testes</p>
        </div>

        {/* Mensagem de boas‑vindas em 3 idiomas */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="space-y-2 text-center text-sm">
            <p className="text-gray-700">
              🇵🇹 <span className="font-medium">Bem‑vindo ao HubTuris!</span> Para acessar o sistema, utilize as credenciais fornecidas pela equipe.
            </p>
            <p className="text-gray-700">
              🇺🇸 <span className="font-medium">Welcome to HubTuris!</span> To access the system, use the credentials provided by the team.
            </p>
            <p className="text-gray-700">
              🇪🇸 <span className="font-medium">¡Bienvenido a HubTuris!</span> Para acceder al sistema, utilice las credenciales proporcionadas por el equipo.
            </p>
          </div>
        </div>

        {/* Dica do botão Sair em 3 idiomas */}
        <div className="mb-6 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="space-y-1 text-center text-xs">
            <p className="text-yellow-800">
              🔔 <span className="font-medium">Dica:</span> Para sair do sistema, clique no botão <span className="font-bold text-red-600">"🚪 Sair"</span> ao lado da logo HubTuris.
            </p>
            <p className="text-yellow-800">
              🔔 <span className="font-medium">Tip:</span> To exit the system, click the <span className="font-bold text-red-600">"🚪 Sair"</span> button next to the HubTuris logo.
            </p>
            <p className="text-yellow-800">
              🔔 <span className="font-medium">Consejo:</span> Para salir del sistema, haga clic en el botón <span className="font-bold text-red-600">"🚪 Sair"</span> junto al logo de HubTuris.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário / Username / Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none bg-white"
              placeholder="Digite seu usuário"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha / Password / Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none bg-white pr-12"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Entrar / Sign In / Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>© 2026 HubTuris - Todos os direitos reservados</p>
          <p className="mt-1">Sistema em fase de testes - Acesso autorizado</p>
        </div>

        {/* Indicadores de slide (pontinhos) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {backgroundImages.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                currentImage === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}