"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPropertyById, getPropertyFieldOptions, updatePropertyData } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ImageUpload, { type ImageFile } from '@/components/ImageUpload';

// --- SUB-COMPONENTE ACORDEÓN ---
function AccordionSection({ title, defaultOpen = false, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-800 rounded-xl mb-4 border border-slate-700 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700/50 transition-colors"
      >
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-yellow-400">{title}</h2>
        <span className="text-slate-400 text-xs">{isOpen ? '▼ COLLAPSE' : '▶ EXPAND'}</span>
      </button>
      <div className={`p-5 border-t border-slate-700/50 bg-slate-800/80 ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE INPUT ---
function FormField({ label, name, type = "text", defaultValue, list, step }: { label: string, name: string, type?: string, defaultValue: any, list?: string, step?: string }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        name={name}
        list={list}
        step={step}
        defaultValue={defaultValue || ''}
        className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
      />
    </div>
  );
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const propertyId = resolvedParams.id;
  const router = useRouter();
  const { t, language } = useLanguage() as any;
  const pt = t.propertyDetail || {};
  const common = t.common || {};

  const [property, setProperty] = useState<any>(null);
  const [options, setOptions] = useState({ propertyTypes: [], strategies: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<ImageFile[]>([]);

  const [conditionNotes, setConditionNotes] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [propData, fieldOptions] = await Promise.all([
          getPropertyById(propertyId),
          getPropertyFieldOptions()
        ]);
        setProperty(propData);
        setOptions(fieldOptions as any);
        
        if (propData?.conditionNotes) {
          setConditionNotes(propData.conditionNotes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    // Anexamos las fotos si el admin subió alguna
    if (photos.length > 0) {
      const photoUrls = photos.map(p => p.url);
      formData.append('photos', JSON.stringify(photoUrls));
    }

    // Anexamos las notas de condición
    formData.append('conditionNotes', JSON.stringify(conditionNotes));

    const result = await updatePropertyData(propertyId, formData);
    if (result.success) {
      router.push(`/admin/property/${propertyId}`);
    } else {
      alert("Error saving property");
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-yellow-400 font-bold">{pt.loading || 'Loading...'}</div>;
  if (!property) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Property not found</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-10">
      
      {/* DATALISTS PARA AUTOCOMPLETADO */}
      <datalist id="types-list">
        {options.propertyTypes.map((type: string) => <option key={type} value={type} />)}
      </datalist>
      <datalist id="strategies-list">
        {options.strategies.map((strategy: string) => <option key={strategy} value={strategy} />)}
      </datalist>

      {/* HEADER HERO */}
      <div className="bg-slate-900 p-6 border-b-4 border-yellow-400 mb-6">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link href={`/admin/property/${propertyId}`} className="text-yellow-400 hover:text-yellow-300 font-extrabold text-2xl mr-2"> </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white">
              {language === 'en' ? 'Edit Property' : 'Editar Propiedad'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{property.address}</p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-auto flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="max-w-[800px] mx-auto p-4">
        <form onSubmit={handleSubmit}>
          
          <AccordionSection title="General Information" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={pt.specs?.address || "Address"} name="address" defaultValue={property.address} />
              
              <div className="flex flex-col mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{pt.specs?.status || "Status"}</label>
                <select name="status" defaultValue={property.status} className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm outline-none">
                  {options.statuses.map((status: string) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <FormField label={pt.specs?.type || "Property Type"} name="propertyType" list="types-list" defaultValue={property.propertyType} />
              <FormField label={pt.specs?.strategy || "Strategy"} name="strategy" list="strategies-list" defaultValue={property.strategy} />
              
              <div className="flex flex-col mb-4 justify-center md:mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isRaisingCapital" 
                    defaultChecked={property.isRaisingCapital} 
                    className="w-5 h-5 accent-yellow-400 bg-slate-900 border-slate-700 rounded cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-300">Raising Capital (Seeking Funds)</span>
                </label>
              </div>
              
              <FormField label={pt.specs?.county || "County"} name="county" defaultValue={property.county} />
              <FormField label={pt.specs?.lockbox || "Lockbox / Code"} name="accessCodeOrLockbox" defaultValue={property.accessCodeOrLockbox} />
            </div>
          </AccordionSection>

          <AccordionSection title={pt.propertySpecs || "Property Specs"}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label={pt.specs?.beds || "Beds"} name="beds" type="number" step="any" defaultValue={property.beds} />
              <FormField label={pt.specs?.baths || "Baths"} name="baths" type="number" step="any" defaultValue={property.baths} />
              <FormField label={pt.specs?.sqft || "SqFt"} name="sqft" type="number" step="any" defaultValue={property.sqft} />
              <FormField label={pt.specs?.built || "Year Built"} name="yearBuilt" type="number" defaultValue={property.yearBuilt} />
            </div>
          </AccordionSection>

          <AccordionSection title="Financial & Parties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={pt.specs?.purchasePrice || "Purchase Price"} name="purchasePrice" type="number" defaultValue={property.purchasePrice} />
              <FormField label={pt.specs?.avm || "AVM"} name="avm" type="number" defaultValue={property.avm} />
              <FormField label={pt.specs?.estRent || "Est. Rent"} name="estRent" type="number" defaultValue={property.estRent} />
              
              <FormField 
                label="Close Date" 
                name="closeDate" 
                type="date" 
                defaultValue={property.closeDate ? new Date(property.closeDate).toISOString().split('T')[0] : ''} 
              />

              <FormField label={pt.specs?.seller || "Seller"} name="sellerName" defaultValue={property.sellerName} />
              <FormField label={pt.specs?.buyer || "Buyer"} name="buyerName" defaultValue={property.buyerName} />
            </div>
          </AccordionSection>

          <AccordionSection title={pt.loanTerms || "Loan Terms"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={pt.specs?.lender || "Lender"} name="loanLender" defaultValue={property.loanLender} />
              <FormField label={pt.specs?.loanAmount || "Loan Amount"} name="loanAmount" type="number" defaultValue={property.loanAmount} />
              <FormField label={pt.specs?.interestRate || "Interest Rate"} name="loanRate" defaultValue={property.loanRate} />
              <FormField label={pt.specs?.monthlyPmt || "Monthly Pmt"} name="loanMonthly" type="number" defaultValue={property.loanMonthly} />
              
              <FormField 
                label={pt.specs?.maturityDate || "Maturity Date"} 
                name="loanMaturity" 
                type="date" 
                defaultValue={property.loanMaturity ? new Date(property.loanMaturity).toISOString().split('T')[0] : ''} 
              />
              <div className="hidden md:block"></div>
              
              <FormField label={pt.specs?.holdback || "Holdback"} name="loanHoldback" type="number" defaultValue={property.loanHoldback} />
              <FormField label={pt.specs?.cashToClose || "Cash to Close"} name="loanCashToClose" type="number" defaultValue={property.loanCashToClose} />
            </div>
          </AccordionSection>

          <AccordionSection title="Manual Progress Log">
            <div className="flex flex-col mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Add a new log entry</label>
              <textarea
                name="newLog"
                placeholder="Ej. Se reunieron con el inspector y todo se ve bien..."
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-400 outline-none min-h-[80px]"
              />
            </div>
          </AccordionSection>

          <AccordionSection title="Condition Notes">
            <div className="space-y-3">
              {conditionNotes.map((note, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-start bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Category (e.g. Roof, Plumbing)"
                      value={note.category}
                      onChange={(e) => {
                        const newNotes = [...conditionNotes];
                        newNotes[idx].category = e.target.value;
                        setConditionNotes(newNotes);
                      }}
                      className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none mb-2"
                    />
                    <textarea
                      placeholder="Description of the condition"
                      value={note.description}
                      onChange={(e) => {
                        const newNotes = [...conditionNotes];
                        newNotes[idx].description = e.target.value;
                        setConditionNotes(newNotes);
                      }}
                      className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none min-h-[60px] resize-y"
                    />
                  </div>
                  <div className="flex flex-row md:flex-col items-center justify-between gap-3 shrink-0 h-full pt-1">
                     <label className="flex items-center gap-2 cursor-pointer" title="Mark as critical">
                      <input
                        type="checkbox"
                        checked={note.isCritical}
                        onChange={(e) => {
                          const newNotes = [...conditionNotes];
                          newNotes[idx].isCritical = e.target.checked;
                          setConditionNotes(newNotes);
                        }}
                        className="w-5 h-5 accent-red-500 bg-slate-800 border-slate-600 rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider md:hidden">Critical</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setConditionNotes(conditionNotes.filter((_, i) => i !== idx))}
                      className="bg-slate-800 hover:bg-red-950/80 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold transition w-full md:w-auto"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConditionNotes([...conditionNotes, { category: '', description: '', isCritical: false }])}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 py-2.5 rounded-lg text-sm transition font-bold"
              >
                + Add Condition Note
              </button>
            </div>
          </AccordionSection>

          <AccordionSection title="Photos">
            <div className="mb-2">
              <ImageUpload
                label="Drop your photos here"
                hint="JPG, PNG, WEBP or GIF - Max 5 MB each"
                value={photos}
                onChange={setPhotos}
                multiple
                maxFiles={20}
                disableMetadata
              />
            </div>
          </AccordionSection>

          <div className="flex justify-end gap-3 mt-8 border-t border-slate-800 pt-6">
            <Link 
              href={`/admin/property/${propertyId}`}
              className="px-6 py-3 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800 transition border border-slate-700"
            >
              {common.cancel || "Cancel"}
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-3 rounded-lg text-sm font-extrabold transition shadow-md disabled:opacity-50"
            >
              {saving ? '...' : (common.save || "Save Changes")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}