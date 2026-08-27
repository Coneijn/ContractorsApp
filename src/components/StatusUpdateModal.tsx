import React, { useState, useEffect } from 'react';
import { updateTaskStatus } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';

type StatusUpdateModalProps = {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function StatusUpdateModal({ taskId, isOpen, onClose, onSuccess }: StatusUpdateModalProps) {
  const { t } = useLanguage() as any;
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Limpia el estado cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus('');
      setShowCustomInput(false);
      setCustomStatus('');
      setIsUpdating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!taskId || !selectedStatus) return;
    
    setIsUpdating(true);
    const statusToSave = selectedStatus === 'OTHER' ? customStatus : selectedStatus;
    
    const result = await updateTaskStatus(taskId, statusToSave);
    
    setIsUpdating(false);
    if (result.success) {
      onSuccess();
    } else {
      alert("Error al actualizar el estado");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border-t-4 border-yellow-400 rounded-xl p-5 w-full max-w-xs shadow-2xl">
        <h3 className="text-[13px] font-bold text-slate-200 mb-3 uppercase tracking-widest">
          {t.dashboard?.modals?.statusTitle || 'Actualizar Estatus'}
        </h3>
        
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
            <option value="OTHER">{t.common?.other || 'Other...'}</option>
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
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 rounded-lg transition disabled:opacity-50"
          >
            {t.dashboard?.modals?.cancel || 'Cancelar'}
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating || (!selectedStatus && !customStatus)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isUpdating ? '...' : (t.dashboard?.modals?.save || 'Guardar')}
          </button>
        </div>
      </div>
    </div>
  );
}