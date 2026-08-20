// components/AddContractorModal.tsx
import React, { useState, useEffect } from 'react';
import { saveContractor } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';

export default function AddContractorModal({ isOpen, onClose, contractors, onSuccess }: any) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    company: '',
    email: '',
    specialty: '',
    status: 'ACTIVE',
    hasW9: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId('');
      setFormData({
        id: '',
        name: '',
        phone: '',
        company: '',
        email: '',
        specialty: '',
        status: 'ACTIVE',
        hasW9: false
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id) {
      const contractor = contractors.find((c: any) => c.id === id);
      if (contractor) {
        setFormData({
          id: contractor.id,
          name: contractor.name,
          phone: contractor.whatsappNumber,
          company: contractor.company || '',
          email: contractor.email || '',
          specialty: contractor.tradeSpecialty || '',
          status: contractor.status,
          hasW9: contractor.hasW9
        });
      }
    } else {
      // Resetea el formulario si escoge "Nuevo"
      setFormData({
        id: '',
        name: '',
        phone: '',
        company: '',
        email: '',
        specialty: '',
        status: 'ACTIVE',
        hasW9: false
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await saveContractor(formData);
    setIsSubmitting(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      alert('Error: ' + (result.error || 'No se pudo guardar el contratista. Revisa si el WhatsApp ya existe.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border-t-4 border-yellow-400 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="p-5">
          <h3 className="text-lg font-extrabold text-white mb-4">
            {(t as any).dashboard?.modals?.addContractor?.titleNew || 'Add / Edit Contractor'}
          </h3>

          <div className="mb-5 bg-slate-900 p-3 rounded-lg border border-slate-700">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {(t as any).dashboard?.modals?.addContractor?.selectExisting || 'Select existing (or leave blank for new)'}
            </label>
            <select
              value={selectedId}
              onChange={handleSelectChange}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
            >
              <option value="">-- Nuevo Contratista --</option>
              {contractors.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} - {c.whatsappNumber}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addContractor?.name || 'Full Name *'}
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addContractor?.phone || 'WhatsApp *'}
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addContractor?.company || 'Company'}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addContractor?.email || 'Email'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addContractor?.specialty || 'Specialty'}
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ej. Plomería"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {(t as any).dashboard?.modals?.addContractor?.status || 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-yellow-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasW9}
                  onChange={(e) => setFormData({ ...formData, hasW9: e.target.checked })}
                  className="w-4 h-4 accent-yellow-400 bg-slate-900 border-slate-600 rounded cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-300">
                  {(t as any).dashboard?.modals?.addContractor?.w9 || 'Has W-9 on file'}
                </span>
              </label>
            </div>

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
                disabled={isSubmitting || !formData.name || !formData.phone}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? '...' : ((t as any).dashboard?.modals?.addContractor?.save || 'Guardar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}