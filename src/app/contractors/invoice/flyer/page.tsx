"use client";

import { useEffect } from 'react';

export default function InvoiceFlyerPage() {
  
  useEffect(() => {
    // Damos un peque o tiempo para que carguen las im genes antes de abrir el di logo de impresi n
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
          Volunteer Homes, LLC · SpencerBuysHouses.com
        </div>
        
        <h1 className="text-[28px] font-black text-slate-800 mb-1 leading-tight">
          Send Invoice or Estimate
        </h1>
        <h2 className="text-[20px] font-bold text-slate-500 mb-6">
          Enviar Factura o Cotización
        </h2>

        <div className="bg-slate-800 text-yellow-400 text-[11px] font-bold px-4 py-1.5 rounded-full inline-block mb-4 tracking-[1px] uppercase print:bg-slate-800 print:text-yellow-400 print:!print-color-adjust-exact">
          📱 Scan QR Code
        </div>

        <div className="bg-slate-50 rounded-xl p-5 inline-block mb-5 border-2 border-slate-200 print:bg-slate-50 print:border-slate-200 print:!print-color-adjust-exact">
          {/* Aseg rate de tener qr.png en tu carpeta public */}
          <img src="/qr.png" alt="QR Code" className="w-[200px] h-[200px] block mx-auto" />
        </div>

        <div className="text-[15px] font-bold text-slate-800 mb-1">
          Scan to send your invoice or estimate
        </div>
        <div className="text-[13px] text-slate-500 mb-5">
          Escanea para enviar tu factura o cotización
        </div>
        
        <div className="text-[13px] text-slate-500 bg-slate-100 px-4 py-2 rounded-full inline-block mb-6 font-mono print:bg-slate-100 print:!print-color-adjust-exact">
          myfrank.ai/subcontractors/invoice.html
        </div>

        <hr className="border-t border-slate-200 my-5" />

        <ul className="text-left text-xs text-slate-600 leading-[1.8] list-none p-0 space-y-1">
          <li>⏰ <strong className="text-slate-800">Deadline:</strong> Wednesday at 5:00 PM / <em>Miércoles a las 5 PM</em></li>
          <li>✅ <strong className="text-slate-800">Work must be 100% complete</strong> before submitting / <em>El trabajo debe estar completo</em></li>
          <li>📸 <strong className="text-slate-800">Include photos & videos</strong> of completed work / <em>Incluye fotos y videos</em></li>
          <li>📋 <strong className="text-slate-800">Be specific</strong> — list every task and material / <em>Sé específico/a</em></li>
          <li>🪪 <strong className="text-slate-800">W-9 required</strong> before first payment / <em>W-9 requerido antes del primer pago</em></li>
          <li>💵 <strong className="text-slate-800">Checks issued Fridays</strong> after Thursday walkthrough / <em>Cheques los viernes</em></li>
        </ul>

        <div className="mt-6 text-[11px] text-slate-400">
          Questions? WhatsApp (901) 318-1736 · admin@volunteerbuyers.com
        </div>

      </div>
    </div>
  );
}