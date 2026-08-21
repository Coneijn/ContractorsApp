"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage() as any;
  
  return (
    <button 
      type="button"
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm text-slate-300"
    >
      {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
    </button>
  );
}