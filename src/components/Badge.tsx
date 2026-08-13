import React from 'react';
type BadgeProps = {
  type: string;
  text: string;
}

export default function Badge({ type, text }: BadgeProps) {
  // Aquí definimos los colores de Tailwind basados en el CSS original de Frank
  const styles: Record<string, string> = {
    'w9-yes': 'bg-green-900 text-green-400',
    'w9-no': 'bg-red-950 text-red-400',
    'in-progress': 'bg-green-900 text-green-400',
    'scheduled': 'bg-yellow-900 text-yellow-400',
    'pending': 'bg-orange-950 text-orange-400',
    'queued': 'bg-blue-900 text-blue-400',
    'unassigned': 'bg-red-950 text-red-400',
    'completed': 'bg-green-600 text-white',
  };

  // Color por defecto para los estados personalizados
  const badgeStyle = styles[type] || 'bg-slate-700 text-slate-300 border border-slate-500';

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${badgeStyle}`}>
      {text}
    </span>
  );
}