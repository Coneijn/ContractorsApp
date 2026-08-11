"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

type Mode = 'invoice' | 'estimate';

export default function InvoiceFormPage() {
  const { t, language, setLanguage } = useLanguage();
  
  const [mode, setMode] = useState<Mode>('invoice');
  const [w9Status, setW9Status] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 20)); // Max 20
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // AQUÍ IRÁ LA CONEXIÓN A TU API NEXT.JS POSTERIORMENTE
      // await fetch('/api/submit', { method: 'POST', body: formData });
      
      // Simulamos la carga por 1.5s
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
    } catch (error) {
      // Fallback a Mailto (el mismo que tenías en HTML original)
      const subject = encodeURIComponent(`${mode === 'invoice' ? 'Invoice' : 'Estimate'}: ${data.firstName} ${data.lastName} - ${data.address}`);
      const body = encodeURIComponent(
        `Contractor: ${data.firstName} ${data.lastName}\n` +
        `Phone: ${data.phone}\n` +
        `Email: ${data.email || 'N/A'}\n` +
        `Property: ${data.address}\n` +
        `Work Done: ${data.workDescription}\n` +
        `Agreed Amount: ${data.agreedAmount}\n` +
        `Requesting: ${data.requestedAmount}\n` +
        `W-9 on file: ${data.w9Status}`
      );
      window.location.href = `mailto:admin@volunteerbuyers.com?subject=${subject}&body=${body}`;
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-200 font-sans">
        <div className="max-w-md w-full bg-green-950/30 border-2 border-green-600 rounded-xl p-8 text-center shadow-xl">
          <h2 className="text-2xl font-extrabold text-green-400 mb-4">
            {mode === 'invoice' ? t.invoiceForm.successInvoiceTitle : t.invoiceForm.successEstimateTitle}
          </h2>
          <p className="text-sm text-green-200 leading-relaxed mb-6">
            {mode === 'invoice' ? t.invoiceForm.successInvoiceDesc : t.invoiceForm.successEstimateDesc}
          </p>
          <p className="text-xs text-green-400/80 mb-6">{t.invoiceForm.questions}</p>
          
          <Link href="/contractors" className="inline-block bg-slate-800 border border-slate-600 text-slate-200 font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition">
            {t.invoiceForm.backToPolicy}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-10">
      
      {/* Hero Header */}
      <div className="bg-slate-800 border-b-4 border-yellow-400 p-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png" alt="Spencer" className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover" />
          <div>
            <h1 className="text-lg font-extrabold text-white">{t.invoiceForm.title}</h1>
            <p className="text-xs text-slate-400 mt-1">SpencerBuysHouses.com · Volunteer Homes, LLC</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        {/* Nav Bar */}
        <div className="flex flex-wrap gap-2 items-center mb-6 print:hidden">
          <Link href="/contractors" className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-700 transition">
            {t.invoiceForm.back}
          </Link>
          <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition ml-auto ${language === 'en' ? 'bg-slate-700 border-slate-600 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            🇺🇸 EN
          </button>
          <button onClick={() => setLanguage('es')} className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition ${language === 'es' ? 'bg-slate-700 border-slate-600 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            🇲🇽 ES
          </button>
        </div>

        {/* QR CODE BLOCK */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center mb-6 print:bg-white print:border-slate-300 print:text-black">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 print:text-slate-600">
            📱 {language === 'en' ? 'Scan to Send Invoice' : 'Escanea para Enviar Factura'}
          </div>
          <img 
            src="/qr2.png" 
            alt="QR Code" 
            className="w-40 h-40 mx-auto rounded-lg bg-white p-2 mb-2 border border-slate-300" 
          />
          <div className="text-xs text-slate-500 mb-4 print:text-slate-500">myfrank.ai/subcontractors/invoice.html</div>
          
          <Link 
            href="/contractors/invoice/flyer" 
            target="_blank"
            className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-700 hover:bg-slate-700 text-yellow-400 font-bold py-3 px-4 rounded-lg transition-colors print:hidden block text-center"
          >
            {t.invoiceForm.printFlyer}
          </Link>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setMode('invoice')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${mode === 'invoice' ? 'border-yellow-400 bg-slate-800' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}>
            <div className="text-2xl">✅</div>
            <div>
              <strong className="block text-sm text-slate-100">{t.invoiceForm.modeInvoice}</strong>
              <span className="text-xs text-slate-400">{t.invoiceForm.modeInvoiceDesc}</span>
            </div>
          </button>
          <button onClick={() => setMode('estimate')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${mode === 'estimate' ? 'border-yellow-400 bg-slate-800' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}>
            <div className="text-2xl">📋</div>
            <div>
              <strong className="block text-sm text-slate-100">{t.invoiceForm.modeEstimate}</strong>
              <span className="text-xs text-slate-400">{t.invoiceForm.modeEstimateDesc}</span>
            </div>
          </button>
        </div>

        {/* Notification Box */}
        {mode === 'invoice' ? (
          <div className="bg-orange-950/40 border border-orange-900/50 rounded-lg p-3 mb-6">
            <strong className="block text-sm text-orange-400 mb-1">{t.invoiceForm.noteInvoiceTitle}</strong>
            <p className="text-xs text-orange-200">{t.invoiceForm.noteInvoiceDesc}</p>
          </div>
        ) : (
          <div className="bg-blue-950/40 border border-blue-900/50 rounded-lg p-3 mb-6">
            <strong className="block text-sm text-blue-400 mb-1">{t.invoiceForm.noteEstimateTitle}</strong>
            <p className="text-xs text-blue-200">{t.invoiceForm.noteEstimateDesc}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Card 1: Info */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h2 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 pb-2 border-b border-slate-700">{t.invoiceForm.personalInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.firstName}</label>
                <input type="text" name="firstName" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.lastName}</label>
                <input type="text" name="lastName" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.phone}</label>
                <input type="tel" name="phone" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.email}</label>
                <input type="email" name="email" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
              </div>
            </div>
          </div>

          {/* Card 2: Job Details */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h2 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 pb-2 border-b border-slate-700">{t.invoiceForm.jobDetails}</h2>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.address}</label>
              <input type="text" name="address" required placeholder="1234 Main St" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.workDescTitle}</label>
              <p className="text-[11px] text-slate-500 mb-2">{t.invoiceForm.workDescHint}</p>
              <textarea name="workDescription" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition min-h-[100px] resize-y"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{mode === 'invoice' ? t.invoiceForm.startDate : t.invoiceForm.estStartDate}</label>
                <input type="date" name="startDate" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition [color-scheme:dark]" />
              </div>
              {mode === 'invoice' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.finishDate}</label>
                  <input type="date" name="finishDate" required className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition [color-scheme:dark]" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.agreedAmount}</label>
                <input type="number" name="agreedAmount" required placeholder="$0.00" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.invoiceForm.reqAmount}</label>
                <input type="number" name="requestedAmount" required placeholder="$0.00" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition" />
              </div>
            </div>
          </div>

          {/* Card 3: Photos (Only for Invoice) */}
          {mode === 'invoice' && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-2 pb-2 border-b border-slate-700">{t.invoiceForm.photosTitle}</h2>
              <p className="text-[11px] font-bold text-red-400 mb-3">{t.invoiceForm.photosWarning}</p>
              
              <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-yellow-400 hover:bg-slate-800/50 transition cursor-pointer mb-3 bg-slate-900">
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div className="text-3xl mb-2">📸</div>
                <strong className="block text-sm text-slate-200">{t.invoiceForm.photosTap}</strong>
                <span className="text-xs text-slate-500 mt-1">{t.invoiceForm.photosHint}</span>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg text-xs">
                      <span className="truncate text-slate-300 w-4/5">{file.type.startsWith('video') ? '🎬' : '🖼️'} {file.name} <em className="text-slate-500">({(file.size / 1024 / 1024).toFixed(1)}MB)</em></span>
                      <button type="button" onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-300 font-bold px-2 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card 4: W9 */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h2 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 pb-2 border-b border-slate-700">{t.invoiceForm.w9StatusTitle}</h2>
            
            <label className="block text-xs font-semibold text-slate-300 mb-2">{t.invoiceForm.w9Question}</label>
            <select 
              name="w9Status" 
              required 
              value={w9Status}
              onChange={(e) => setW9Status(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-yellow-400 transition appearance-none"
            >
              <option value="" disabled></option>
              <option value="yes">{t.invoiceForm.w9Yes}</option>
              <option value="no">{t.invoiceForm.w9No}</option>
            </select>

            {w9Status === 'no' && (
              <div className="mt-4 bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                <strong className="block text-sm text-red-400 mb-1">{t.invoiceForm.w9WarningTitle}</strong>
                <p className="text-xs text-red-200">
                  {t.invoiceForm.w9WarningDesc} <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" className="font-bold underline text-blue-400">irs.gov/pub/irs-pdf/fw9.pdf</a>
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-600 disabled:text-slate-400 text-slate-900 font-extrabold py-4 px-4 rounded-xl transition text-base shadow-sm"
          >
            {isSubmitting ? t.invoiceForm.submitting : (mode === 'invoice' ? t.invoiceForm.submitInvoice : t.invoiceForm.submitEstimate)}
          </button>
        </form>

      </div>
    </div>
  );
}