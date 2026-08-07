import React from 'react';
import Badge from './Badge';

type PropertyCardProps = {
  propertyName: string;
  notes: string;
  status: 'in-progress' | 'scheduled' | 'pending' | 'queued' | 'unassigned';
  price?: string;
};

export default function PropertyCard({ propertyName, notes, status, price }: PropertyCardProps) {
  // Colores de borde izquierdo según el estatus (recreando el diseño de Frank)
  const borderColors = {
    'in-progress': 'border-l-green-500',
    'scheduled': 'border-l-yellow-400',
    'pending': 'border-l-orange-500',
    'queued': 'border-l-blue-500',
    'unassigned': 'border-l-red-500',
  };

  const badgeLabels = {
    'in-progress': '🔨 In Progress',
    'scheduled': `📋 Scheduled ${price ? `- ${price}` : ''}`,
    'pending': '💬 Quote Pending',
    'queued': '⏳ Queued',
    'unassigned': '⚠️ Unassigned',
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-3 md:p-4 mb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-l-4 ${borderColors[status]}`}>
      
      {/* Detalles de la Propiedad */}
      <div>
        <div className="font-bold text-[13px] text-slate-100 mb-0.5">
          {/* El enlace luego lo conectaremos a la página individual de la propiedad */}
          <a href="#" className="text-yellow-400 hover:underline">{propertyName}</a>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {notes}
        </div>
      </div>
      
      {/* Controles y Estatus */}
      <div className="flex items-center gap-3">
        <Badge type={status} text={badgeLabels[status]} />
        
        {/* BOTÓN DE ACCIÓN PARA SPENCER */}
        <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] px-3 py-1.5 rounded transition">
          Actualizar Estatus ⚙️
        </button>
      </div>

    </div>
  );
}