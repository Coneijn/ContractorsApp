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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStatus, setCustomStatus] = useState('');

  // Función que se dispara al elegir un nuevo estatus en el menú
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'OTHER') {
      setShowCustomInput(true);
      return;
    }

    if (!taskId) return;
    setIsUpdating(true);
    const result = await updateTaskStatus(taskId, selectedValue);
    
    if (result.success && onUpdate) {
      onUpdate(); // Recarga los datos instantáneamente
    }
    setIsUpdating(false);
  };

  // Función exclusiva para guardar el estatus personalizado
  const handleCustomSubmit = async () => {
    if (!taskId || !customStatus.trim()) {
      setShowCustomInput(false);
      return;
    }
    setIsUpdating(true);
    const result = await updateTaskStatus(taskId, customStatus);
    if (result.success && onUpdate) {
      onUpdate();
    }
    setIsUpdating(false);
    setShowCustomInput(false);
    setCustomStatus('');
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
        {taskId && !showCustomInput && (
          <select 
            onChange={handleStatusChange}
            disabled={isUpdating}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[14px] px-2 py-1 rounded transition outline-none cursor-pointer disabled:opacity-50 appearance-none text-center w-8 h-8 flex items-center justify-center shadow-sm"
            defaultValue=""
          >
            <option value="" disabled>{isUpdating ? '⏳' : '🔽'}</option>
            <option value="PENDING">{t.propertyCard.statusPending}</option>
            <option value="IN_PROGRESS">{t.propertyCard.statusInProgress}</option>
            <option value="QUEUED">⏳ Queued</option>
            <option value="COMPLETED">{t.propertyCard.statusCompleted}</option>
            <option value="OTHER">✏️ Otro (Escribir)</option>
          </select>
        )}

        {/* INPUT PARA ESTATUS PERSONALIZADO */}
        {taskId && showCustomInput && (
          <div className="flex items-center gap-1">
            <input 
              type="text" 
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="Ej. Esperando material"
              className="bg-slate-900 border border-slate-600 text-slate-200 text-[11px] px-2 py-1.5 rounded outline-none w-32"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            />
            <button 
              onClick={handleCustomSubmit}
              disabled={isUpdating}
              className="bg-yellow-400 text-slate-900 font-bold px-2 py-1.5 rounded text-[11px] hover:bg-yellow-500 transition"
              title="Guardar"
            >
              {isUpdating ? '⏳' : '✓'}
            </button>
            <button 
              onClick={() => {
                setShowCustomInput(false);
                setCustomStatus('');
              }}
              disabled={isUpdating}
              className="bg-slate-700 text-slate-300 font-bold px-2 py-1.5 rounded text-[11px] hover:bg-slate-600 transition"
              title="Cancelar"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}