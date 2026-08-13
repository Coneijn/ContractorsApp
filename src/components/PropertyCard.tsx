"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Badge from './Badge';
import { updateTaskStatus } from '@/actions/dashboardActions';

import { useLanguage } from '@/context/LanguageContext';
type PropertyCardProps = {
  taskId?: string;
  propertyId?: string;
  propertyName: string;
  notes: string;
  status: 'in-progress' | 'scheduled' | 'pending' | 'queued' | 'unassigned' | 'completed';
  price?: string;
  onUpdate?: () => void;
};

export default function PropertyCard({ taskId, propertyId, propertyName, notes, status, price, onUpdate }: PropertyCardProps) {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStatus, setCustomStatus] = useState('');

  const handleSave = async () => {
    if (!taskId || !selectedStatus) {
      setIsEditing(false);
      return;
    }
    
    setIsUpdating(true);
    const statusToSave = selectedStatus === 'OTHER' ? customStatus : selectedStatus;
    
    const result = await updateTaskStatus(taskId, statusToSave);
    
    if (result.success && onUpdate) {
      onUpdate();
    }
    setIsUpdating(false);
    setIsEditing(false);
    setShowCustomInput(false);
    setCustomStatus('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedStatus('');
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
  'completed': 'border-l-green-600',
  };

  const badgeLabels = {
    'in-progress': t.badges.inProgress,
    'scheduled': `${t.badges.scheduled} ${price ? `- ${price}` : ''}`,
    'pending': t.badges.pending,
    'queued': t.badges.queued,
    'unassigned': t.badges.unassigned,
    'completed': t.propertyCard.statusCompleted,
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-3 md:p-4 mb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-l-4 ${borderColors[status]}`}>
      
      {/* Detalles de la Propiedad */}
      <div>
        <div className="font-bold text-[13px] text-slate-100 mb-0.5">
          <Link href={`/admin/property/${propertyId || 'demo'}`} className="text-yellow-400 hover:underline">
            {propertyName}
          </Link>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {notes}
        </div>
      </div>
      
     {/* Controles y Estatus */}
      <div className="flex items-center gap-3">
        <Badge type={status} text={badgeLabels[status]} />
        
        {taskId && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                disabled={isUpdating}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[12px] rounded transition flex items-center justify-center shadow-sm w-8 h-8 disabled:opacity-50"
              >
                {isUpdating ? '⏳' : '🔽'}
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded p-1">
                {!showCustomInput ? (
                  <select 
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      if (e.target.value === 'OTHER') setShowCustomInput(true);
                    }}
                    className="bg-slate-900 text-slate-200 text-[11px] px-2 py-1.5 rounded outline-none border border-slate-700"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    <option value="PENDING">{t.propertyCard.statusPending}</option>
                    <option value="IN_PROGRESS">{t.propertyCard.statusInProgress}</option>
                    <option value="QUEUED">🔵 Queued</option>
                    <option value="COMPLETED">{t.propertyCard.statusCompleted}</option>
                    <option value="OTHER">✍️ Otro...</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="Especificar estado"
                    className="bg-slate-900 border border-slate-600 text-slate-200 text-[11px] px-2 py-1.5 rounded outline-none w-28"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                )}
                <button 
                  onClick={handleSave}
                  disabled={isUpdating || (!selectedStatus && !customStatus)}
                  className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded transition flex items-center justify-center w-7 h-7 disabled:opacity-50"
                >
                  ✅
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded transition flex items-center justify-center w-7 h-7 disabled:opacity-50"
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}