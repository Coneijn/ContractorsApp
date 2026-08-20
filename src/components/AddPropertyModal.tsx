import React, { useState, useEffect } from 'react';
import { saveProperty } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';

export default function AddPropertyModal({ isOpen, onClose, contractors = [], onSuccess }: any) {
  const { t } = useLanguage();
  const [address, setAddress] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [contractorId, setContractorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAddress('');
      setTaskDesc('');
      setContractorId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await saveProperty({ address, taskDesc, contractorId });
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      alert('Error: ' + (result.error || 'No se pudo guardar la propiedad.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border-t-4 border-yellow-400 rounded-xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="p-5">
          <h3 className="text-lg font-extrabold text-white mb-4">
            {(t as any).dashboard?.modals?.addProperty?.title || 'Add New Property'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {(t as any).dashboard?.modals?.addProperty?.address || 'Property Address *'}
              </label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. 123 Main St"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {(t as any).dashboard?.modals?.addProperty?.taskDesc || 'Task Description (Optional)'}
              </label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder={(t as any).dashboard?.modals?.taskDescPlaceholder || 'Ej. Pintura interior...'}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400 min-h-[60px]"
              />
            </div>

            {taskDesc && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addProperty?.contractor || 'Assign Contractor (Optional)'}
                </label>
                <select
                  value={contractorId}
                  onChange={(e) => setContractorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                >
                  <option value="">{(t as any).dashboard?.modals?.selectContractor || 'Select Contractor...'}</option>
                  {contractors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex gap-3 pt-4 border-t border-slate-700">
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
                disabled={isSubmitting || !address}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? '...' : ((t as any).dashboard?.modals?.addProperty?.save || 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}