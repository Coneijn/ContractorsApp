"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans text-slate-200">
      
      {/* Botón de Idioma */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm text-slate-300"
        >
          {language === 'en' ? '🇲🇽 ES' : '🇺🇸 EN'}
        </button>
      </div>

      {/* Tarjeta de Acceso */}
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border-t-4 border-yellow-400 shadow-xl text-center">
        <img
          src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png"
          alt="Spencer Buys Houses"
          className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400 mx-auto mb-6"
        />
        <h1 className="text-2xl font-extrabold text-white mb-2">SpencerBuysHouses</h1>
        <p className="text-slate-400 text-sm mb-8">
          {language === 'en' ? 'Select your access portal' : 'Selecciona tu portal de acceso'}
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            href="/contractors" 
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-slate-600"
          >
            {language === 'en' ? '👷‍♂️ Public (Contractors)' : '👷‍♂️ Público (Contratistas)'}
          </Link>
          
          <Link 
            href="/admin/dashboard" 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-3 px-4 rounded-lg transition-colors"
          >
            {language === 'en' ? '🔐 I have an account (Admin)' : '🔐 Tengo cuenta (Admin)'}
          </Link>
        </div>
      </div>

    </div>
  );
}