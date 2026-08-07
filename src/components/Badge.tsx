import React from 'react';

type BadgeProps = {
  type: 'w9-yes' | 'w9-no' | 'in-progress' | 'scheduled' | 'pending' | 'queued' | 'unassigned';
  text: string;
};

export default function Badge({ type, text }: BadgeProps) {
  // Aquí definimos los colores de Tailwind basados en el CSS original de Frank
  const styles = {
    'w9-yes': 'bg-green-900 text-green-400',
    'w9-no': 'bg-red-950 text-red-400',
    'in-progress': 'bg-green-900 text-green-400',
    'scheduled': 'bg-yellow-900 text-yellow-400',
    'pending': 'bg-orange-950 text-orange-400',
    'queued': 'bg-blue-900 text-blue-400',
    'unassigned': 'bg-red-950 text-red-400',
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${styles[type]}`}>
      {text}
    </span>
  );
}