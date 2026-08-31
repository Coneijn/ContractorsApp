"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function ContractorBottomNav() {
  const { t, language, setLanguage } = useLanguage() as any;
  const pathname = usePathname();

  // Variables booleanas para identificar en qué ruta estamos
  const isHome = pathname === '/contractors';
  const isInvoice = pathname === '/contractors/invoice';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 p-3 shadow-2xl print:hidden">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
        
        {/* Boton Home: Dinamico segun si estamos en Home */}
        <Link
          href="/contractors"
          className={`w-11 h-11 rounded-full transition flex items-center justify-center shrink-0 ${
            isHome 
              ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-md' 
              : 'bg-slate-800 border border-slate-700 hover:border-yellow-400 text-yellow-400 shadow-sm'
          }`}
          title="Home"
          aria-label="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>

        {/* Boton Submit Invoice: Dinamico segun si estamos en Invoice */}
        <Link
          href="/contractors/invoice"
          className={`px-5 py-2.5 font-extrabold text-sm rounded-full transition whitespace-nowrap ${
            isInvoice 
              ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-md' 
              : 'bg-slate-800 border border-slate-700 hover:border-yellow-400 text-yellow-400 shadow-sm'
          }`}
        >
          {t.policy?.submit || "Submit Invoice"}
        </Link>

        {/* Boton Contextual: Imprimir Politica (Home) o Imprimir Volante (Invoice) */}
        {isHome ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-yellow-400 font-bold text-sm rounded-full transition shadow-sm whitespace-nowrap"
          >
            {t.policy?.print || "Print Policy"}
          </button>
        ) : (
          <Link
            href="/contractors/invoice/flyer"
            target="_blank"
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-yellow-400 font-bold text-sm rounded-full transition shadow-sm whitespace-nowrap"
          >
            {t.invoiceForm?.printFlyer?.replace('🖨️ ', '') || "Print Flyer"}
          </Link>
        )}

        {/* Boton Alternante de Idioma */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="w-11 h-11 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-extrabold text-xs rounded-full transition shadow-sm flex items-center justify-center shrink-0"
        >
          {language === 'en' ? 'ES' : 'EN'}
        </button>

      </div>
    </div>
  );
}