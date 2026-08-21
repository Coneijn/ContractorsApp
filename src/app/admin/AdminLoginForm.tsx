"use client";
import React, { useState } from 'react';
import { verifyPin } from '@/actions/dashboardActions';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    const success = await verifyPin(pin);
    
    if (success) {
      // Refrescamos la ruta para que el Layout lea la nueva cookie
      router.refresh(); 
    } else {
      setError(true);
      setPin('');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full bg-slate-800 rounded-2xl p-8 border-t-4 border-yellow-400 shadow-xl text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h1 className="text-xl font-extrabold text-white mb-2">Access restricted</h1>
      <p className="text-sm text-slate-400 mb-6">Insert your pin to continue.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            maxLength={6} // Cambia este 6 si decides hacer tu contraseña más larga
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} // Permite letras y números
            placeholder="••••••"
            className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-yellow-400 text-slate-200 transition`}
          />
          {error && <p className="text-red-400 text-xs font-bold mt-2">PIN incorrecto. Inténtalo de nuevo.</p>}
        </div>
        
        <button
          type="submit"
          disabled={pin.length < 4 || isLoading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}