import React from 'react';
import Badge from './Badge';

// Definimos qué datos va a recibir nuestra tarjeta
type ContractorProps = {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  area: string;
  hasW9: boolean;
};

export default function ContractorCard({ name, company, phone, email, area, hasW9 }: ContractorProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 transition hover:border-yellow-400">
      {/* Encabezado de la tarjeta */}
      <div className="text-base font-extrabold text-yellow-400 mb-0.5">{name}</div>
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

      {/* Historial (Por ahora estático, luego lo conectaremos a la DB) */}
      <div className="text-[10px] font-bold uppercase tracking-[1px] text-slate-500 mb-2">Work History</div>
      <div className="bg-slate-900 rounded-md p-2.5 mb-1.5">
        <div className="text-xs font-bold text-slate-200">Ejemplo de Propiedad</div>
        <div className="text-[11px] text-slate-500 mt-0.5">Descripción del trabajo irá aquí...</div>
        <div className="text-[13px] font-extrabold text-yellow-400 mt-1">TBD</div>
      </div>
    </div>
  );
}