import React from 'react';
import Badge from './Badge';
import { useLanguage } from '@/context/LanguageContext';

export type HistoryItem = {
  address?: string;
  detail: string;
  price?: string;
};

type ContractorProps = {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  area: string;
  hasW9: boolean;
  historyType: 'Work History' | 'Bid History' | 'Trades';
  historyItems: HistoryItem[];
  onAssign?: (contractorId: string) => void;
};

export default function ContractorCard({ id, name, company, phone, email, area, hasW9, historyType, historyItems, onAssign }: ContractorProps) {
  const { t } = useLanguage() as any;
  
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 transition hover:border-yellow-400 flex flex-col relative">
      
      {onAssign && (
        <button 
          onClick={() => onAssign(id)}
          className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-yellow-400 text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
        >
          {t.common?.assign || '+ Assign'}
        </button>
      )}

      {/* Encabezado de la tarjeta */}
      <div className="text-base font-extrabold text-yellow-400 mb-0.5 pr-16">{name}</div>
      <div className="text-xs text-slate-500 mb-2.5">{company || '—'}</div>

      {/* Datos de contacto */}
      <div className="text-[13px] text-slate-300 my-1 flex gap-2 items-start">
        <span className="text-[11px] text-slate-500 w-[52px] shrink-0 mt-[1px]">📞 Phone</span>
        {phone || '—'}
      </div>
      <div className="text-[13px] text-slate-300 my-1 flex gap-2 items-start">
        <span className="text-[11px] text-slate-500 w-[52px] shrink-0 mt-[1px]">📧 Email</span>
        {email || '—'}
      </div>
      <div className="text-[13px] text-slate-300 my-1 flex gap-2 items-start">
        <span className="text-[11px] text-slate-500 w-[52px] shrink-0 mt-[1px]">🏢 Co.</span>
        {company || '—'}
      </div>
      <div className="text-[13px] text-slate-300 my-1 flex gap-2 items-start">
        <span className="text-[11px] text-slate-500 w-[52px] shrink-0 mt-[1px]">📍 Area</span>
        {area || '—'}
      </div>

      {/* Etiqueta del W-9 */}
      <div className="my-2">
        {hasW9 ? (
          <Badge type="w9-yes" text="✅ W-9 on file" />
        ) : (
          <Badge type="w9-no" text="⚠️ No W-9 on file" />
        )}
      </div>

      <hr className="border-t border-slate-700 my-3" />

      {/* Historial Dinamico */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[10px] font-bold uppercase tracking-[1px] text-slate-500 mb-2">{historyType}</div>
        
        <div className="overflow-y-auto max-h-[160px] pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {historyItems.map((item, idx) => (
            <div key={idx} className="bg-slate-900 rounded-md p-2.5 mb-1.5">
              {item.address && <div className="text-xs font-bold text-slate-200">{item.address}</div>}
            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.detail}</div>
            {item.price && <div className="text-[13px] font-extrabold text-yellow-400 mt-1">{item.price}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}