"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Badge from './Badge';
import { useLanguage } from '@/context/LanguageContext';
import StatusUpdateModal from './StatusUpdateModal';
type PropertyCardProps = {
  taskId?: string;
  propertyId?: string;
  propertyName: string;
  notes: string;
  status: 'in-progress' | 'scheduled' | 'pending' | 'queued' | 'unassigned' | 'completed';
  price?: string;
  onUpdate?: () => void;
  onAssign?: (propId: string, desc?: string) => void;
};

export default function PropertyCard({ taskId, propertyId, propertyName, notes, status, price, onUpdate, onAssign }: PropertyCardProps) {
  const { t } = useLanguage() as any;
  const [isEditing, setIsEditing] = useState(false);

  // Colores de borde izquierdo seg n el estatus (recreando el dise o de Frank)
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
        
       <div className="flex items-center gap-2">
          {onAssign && (
            <button 
              onClick={() => propertyId && onAssign(propertyId, status === 'unassigned' ? notes : '')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold px-2 py-1.5 rounded transition flex items-center justify-center shadow-sm whitespace-nowrap"
            >
              {t.common?.assign || '+ Assign'}
            </button>
          )}
          {taskId && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold px-2 py-1.5 rounded transition shadow-sm whitespace-nowrap"
            >
              {(t as any).common?.editStage || 'Edit Stage'}
            </button>
          )}
        </div>
      </div>

      {/* STATUS UPDATE MODAL (Flotante - Componente) */}
      {isEditing && taskId && (
        <StatusUpdateModal 
          taskId={taskId}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </div>
  );
}