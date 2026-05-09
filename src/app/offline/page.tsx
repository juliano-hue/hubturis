'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🏖️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Você está offline</h1>
        <p className="text-gray-500 mb-6">
          Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
