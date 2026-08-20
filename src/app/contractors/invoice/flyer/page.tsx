"use client";
import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function InvoiceFlyerPage() {
  const { t } = useLanguage() as any;
  const ft = t.flyer || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex justify-center items-center p-5 font-sans text-slate-900 print:p-0 print:block">
             
      <div className="max-w-[480px] w-full text-center border-[3px] border-slate-800 rounded-2xl py-10 px-8 bg-white print:border-[3px] print:border-slate-800 print:max-w-full print:rounded-2xl print:m-0 print:break-inside-avoid">
                 
        <img 
           src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png" 
           alt="Spencer" 
           className="w-16 h-16 rounded-full border-[3px] border-yellow-400 object-cover mx-auto mb-4 print:border-yellow-400"
        />
                 
        <div className="text-[13px] font-bold text-slate-500 uppercase tracking-[2px] mb-1">
          {ft.subtitle || "Volunteer Homes, LLC | SpencerBuysHouses.com"}
        </div>
                 
        <h1 className="text-[28px] font-black text-slate-800 mb-6 leading-tight">
          {ft.title1 || "Send Invoice or Estimate"}
        </h1>

        <div className="bg-slate-800 text-yellow-400 text-[11px] font-bold px-4 py-1.5 rounded-full inline-block mb-4 tracking-[1px] uppercase print:bg-slate-800 print:text-yellow-400 print:!print-color-adjust-exact">
            📷 {ft.scanQr || "Scan QR Code"}
        </div>

        <div className="bg-slate-50 rounded-xl p-5 inline-block mb-5 border-2 border-slate-200 print:bg-slate-50 print:border-slate-200 print:!print-color-adjust-exact">
          <img src="/qr.png" alt="QR Code" className="w-[200px] h-[200px] block mx-auto" />
        </div>

        <div className="text-[15px] font-bold text-slate-800 mb-5">
          {ft.scanText1 || "Scan to send your invoice or estimate"}
        </div>
                 
        <div className="text-[13px] text-slate-500 bg-slate-100 px-4 py-2 rounded-full inline-block mb-6 font-mono print:bg-slate-100 print:!print-color-adjust-exact">
          myfrank.ai/subcontractors/invoice.html
        </div>

        <hr className="border-t border-slate-200 my-5" />

        <ul className="text-left text-xs text-slate-600 leading-[1.8] list-none p-0 space-y-1">
          <li>✅ {ft.rules?.r1 || "Deadline: Wednesday at 5:00 PM"}</li>
          <li>✅ {ft.rules?.r2 || "Work must be 100% complete before submitting"}</li>
          <li>✅ {ft.rules?.r3 || "Include photos & videos of completed work"}</li>
          <li>✅ {ft.rules?.r4 || "Be specific - list every task and material"}</li>
          <li>✅ {ft.rules?.r5 || "W-9 required before first payment"}</li>
          <li>✅ {ft.rules?.r6 || "Checks issued Fridays after Thursday walkthrough"}</li>
        </ul>

        <div className="mt-6 text-[11px] text-slate-400">
          {ft.questions || "Questions? WhatsApp (901) 318-1736 | admin@volunteerbuyers.com"}
        </div>
      </div>
    </div>
  );
}