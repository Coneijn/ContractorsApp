// src/components/NewAssignmentModal.tsx
import React, { useState, useEffect } from 'react';
import { createAssignment } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';

export default function NewAssignmentModal({ isOpen, onClose, properties, contractors, defaultPropertyId = '', defaultContractorId = '', defaultDescription = '', onSuccess }: any) {
  const { t } = useLanguage();
  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [contractorId, setContractorId] = useState(defaultContractorId);
  const [description, setDescription] = useState(defaultDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPropertyId(defaultPropertyId);
      setContractorId(defaultContractorId);
      setDescription(defaultDescription);
    }
  }, [isOpen, defaultPropertyId, defaultContractorId, defaultDescription]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createAssignment(propertyId, contractorId, description);
    setIsSubmitting(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      alert('Error creando la asignación');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border-t-4 border-yellow-400 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-extrabold text-white mb-4">{(t as any).dashboard?.modals?.newAssignment || 'Nueva Asignación'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t.dashboard.table.property}
              </label>
              <select 
                required
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                disabled={!!defaultPropertyId}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="" disabled>{(t as any).dashboard?.modals?.selectProperty || 'Seleccionar Propiedad...'}</option>
                {properties.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t.dashboard.table.contractor}
              </label>
              <select 
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value)}
                disabled={!!defaultContractorId}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">{(t as any).dashboard?.modals?.selectContractor || 'Seleccionar Contratista...'} (Opcional)</option>
                {contractors.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {(t as any).dashboard?.modals?.taskDesc || 'Descripción de la tarea'}
              </label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={(t as any).dashboard?.modals?.taskDescPlaceholder || 'Ej. Pintura interior, reparar techo...'}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400 min-h-[80px]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-lg transition"
              >
                {(t as any).dashboard?.modals?.cancel || 'Cancelar'}
              </button>
              <button 
                type="submit"
                disabled={isSubmitting || !propertyId || !description}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? '...' : ((t as any).dashboard?.modals?.assign || 'Asignar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}