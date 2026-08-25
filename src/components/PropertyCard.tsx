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
  onAssign?: (propId: string, desc?: string) => void;
};

export default function PropertyCard({ taskId, propertyId, propertyName, notes, status, price, onUpdate, onAssign }: PropertyCardProps) {
const { t } = useLanguage() as any;
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
              disabled={isUpdating}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[12px] rounded transition flex items-center justify-center shadow-sm w-8 h-8 disabled:opacity-50"
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      {/* STATUS UPDATE MODAL (Flotante) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border-t-4 border-yellow-400 rounded-xl p-5 w-full max-w-xs shadow-2xl">
            <h3 className="text-[13px] font-bold text-slate-200 mb-3 uppercase tracking-widest">{(t as any).dashboard?.modals?.statusTitle || 'Actualizar Estatus'}</h3>
            
            {!showCustomInput ? (
              <select 
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  if (e.target.value === 'OTHER') setShowCustomInput(true);
                }}
                className="w-full bg-slate-900 text-slate-200 text-[13px] px-3 py-2.5 rounded-lg outline-none border border-slate-600 mb-4 focus:border-yellow-400"
              >
                <option value="" disabled>{t.common?.select || 'Select...'}</option>
                <option value="PENDING_ESTIMATE">Pending Estimate</option>
                <option value="ASSIGNED_OR_TO_DO">Assigned / To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_INSPECTION_OR_QA">Pending Inspection / QA</option>
                <option value="INVOICE_SUBMITTED">Invoice Submitted</option>
                <option value="UNASSIGNED">Unassigned</option>
                <option value="WON">Won (Completed)</option>
                <option value="LOST">Lost (Cancelled)</option>
                <option value="OTHER">  {t.common?.other || 'Other...'}</option>
              </select>
            ) : (
              <input 
                type="text" 
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="Especificar estado"
                className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-[13px] px-3 py-2.5 rounded-lg outline-none mb-4 focus:border-yellow-400"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            )}

            <div className="flex gap-2">
              <button 
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 rounded-lg transition disabled:opacity-50"
              >
                {(t as any).dashboard?.modals?.cancel || 'Cancelar'}
              </button>
              <button 
                onClick={handleSave}
                disabled={isUpdating || (!selectedStatus && !customStatus)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-2 rounded-lg transition disabled:opacity-50"
              >
                {isUpdating ? '...' : ((t as any).dashboard?.modals?.save || 'Guardar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}