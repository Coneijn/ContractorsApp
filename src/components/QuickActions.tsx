"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

type QuickActionsProps = {
  onAddAssignment: () => void;
  onAddProperty: () => void;
  onAddContractor: () => void;
};

export default function QuickActions({ onAddAssignment, onAddProperty, onAddContractor }: QuickActionsProps) {
  const { t } = useLanguage() as any;
  const labels = t.dashboard?.quickActions || {};

  return (
    <div className="mb-3 p-4 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg drop-shadow-2xl">
      <h3 className="text-[12px] font-bold tracking-widest uppercase text-slate-500 mb-4 text-center">
        {labels.title || 'Quick Actions'}
      </h3>
      
      {/* Contenedor Flex centrado (justify-center) */}
      <div className="flex justify-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 pb-2">
        
        {/* Boton 1: Nueva Asignacion */}
        <button onClick={onAddAssignment} className="flex flex-col items-center gap-2.5 group min-w-[72px]">
          <div className="w-14 h-14 rounded-full border border-slate-500 bg-transparent flex items-center justify-center text-slate-300 group-hover:border-yellow-400 group-hover:text-yellow-400 group-hover:bg-yellow-400/10 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Casa */}
              <path d="M2 11l4-3 4 3v6H2z"/>
              {/* Símbolo de + */}
              <path d="M10 13h4m-2-2v4"/>
              {/* Persona */}
              <circle cx="19" cy="10" r="2"/>
              <path d="M15 17v-1a4 4 0 0 1 8 0v1"/>
            </svg>
          </div>
          <span className="text-[11px] font-medium text-slate-300 whitespace-nowrap group-hover:text-yellow-400 transition-colors">
            {labels.newAssignment || 'Assignment'}
          </span>
        </button>

        {/* Boton 2: Agregar Propiedad */}
        <button onClick={onAddProperty} className="flex flex-col items-center gap-2.5 group min-w-[72px]">
          <div className="w-14 h-14 rounded-full border border-slate-500 bg-transparent flex items-center justify-center text-slate-300 group-hover:border-yellow-400 group-hover:text-yellow-400 group-hover:bg-yellow-400/10 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M12 10v6M9 13h6"/>
            </svg>
          </div>
          <span className="text-[11px] font-medium text-slate-300 whitespace-nowrap group-hover:text-yellow-400 transition-colors">
            {labels.addProperty || 'Property'}
          </span>
        </button>

        {/* Boton 3: Agregar Contratista */}
        <button onClick={onAddContractor} className="flex flex-col items-center gap-2.5 group min-w-[72px]">
          <div className="w-14 h-14 rounded-full border border-slate-500 bg-transparent flex items-center justify-center text-slate-300 group-hover:border-yellow-400 group-hover:text-yellow-400 group-hover:bg-yellow-400/10 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <span className="text-[11px] font-medium text-slate-300 whitespace-nowrap group-hover:text-yellow-400 transition-colors">
            {labels.addContractor || 'Contractor'}
          </span>
        </button>

      </div>
    </div>
  );
}