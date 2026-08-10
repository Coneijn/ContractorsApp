"use client";
import React, { useState } from 'react';
import Badge from './Badge';
import { updateTaskStatus } from '@/actions/dashboardActions';

import { useLanguage } from '@/context/LanguageContext';

type PropertyCardProps = {
  taskId?: string;
  propertyName: string;
  notes: string;
  status: 'in-progress' | 'scheduled' | 'pending' | 'queued' | 'unassigned';
  price?: string;
  onUpdate?: () => void; 
};

export default function PropertyCard({ taskId, propertyName, notes, status, price, onUpdate }: PropertyCardProps) {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  // Función que se dispara al elegir un nuevo estatus en el menú
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!taskId) return;
    setIsUpdating(true);
    const newStatus = e.target.value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    const result = await updateTaskStatus(taskId, newStatus);
    
    if (result.success && onUpdate) {
      onUpdate(); // Recarga los datos instantáneamente
    }
    setIsUpdating(false);
  };
  // Colores de borde izquierdo según el estatus (recreando el diseño de Frank)
  const borderColors = {
    'in-progress': 'border-l-green-500',
    'scheduled': 'border-l-yellow-400',
    'pending': 'border-l-orange-500',
    'queued': 'border-l-blue-500',
    'unassigned': 'border-l-red-500',
  };

  const badgeLabels = {
    'in-progress': t.badges.inProgress,
    'scheduled': `${t.badges.scheduled} ${price ? `- ${price}` : ''}`,
    'pending': t.badges.pending,
    'queued': t.badges.queued,
    'unassigned': t.badges.unassigned,
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
        
        {/* SELECTOR DE ACCIÓN PARA SPENCER */}
        {taskId && (
          <select 
            onChange={handleStatusChange}
            disabled={isUpdating}
            // Agregamos 'appearance-none' para quitar la flecha nativa y 'text-center w-8' para hacerlo un botón cuadrado
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[14px] px-2 py-1 rounded transition outline-none cursor-pointer disabled:opacity-50 appearance-none text-center w-8 h-8 flex items-center justify-center shadow-sm"
            defaultValue=""
          >
            <option value="" disabled>{isUpdating ? '⏳' : '▼'}</option>
            <option value="PENDING">{t.propertyCard.statusPending}</option>
            <option value="IN_PROGRESS">{t.propertyCard.statusInProgress}</option>
            <option value="COMPLETED">{t.propertyCard.statusCompleted}</option>
          </select>
        )}
      </div>

    </div>
  );
}