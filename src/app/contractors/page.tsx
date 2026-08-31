"use client";
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import ContractorBottomNav from '@/components/ContractorBottomNav';

export default function ContractorPolicyPage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24 print:bg-white print:text-black print:pb-0">
      <div className="max-w-3xl mx-auto p-5">
        
        {/* Encabezado */}
        <div className="bg-slate-800 border-b-4 border-yellow-400 p-4 rounded-xl flex items-center gap-4 mb-4 print:bg-slate-100 print:border-black print:text-black">
          <img
            src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png"
            alt="Spencer"
            className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover shrink-0 print:border-black"
          />
          <div>
            <h1 className="text-lg font-extrabold text-white print:text-black">{t.policy.title}</h1>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">{t.policy.subtitle}</p>
          </div>
        </div>

        {/* WhatsApp & QR */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 items-stretch">
          <div className="bg-green-950/30 border-2 border-green-600 rounded-xl p-4 flex-1 text-center flex flex-col justify-center print:bg-white print:border-green-800">
            <p className="text-sm text-green-400 mb-1 font-semibold print:text-green-800">{t.policy.whatsapp}</p>
            <div className="text-2xl font-extrabold text-green-500 tracking-wider print:text-green-700">(901) 318-1736</div>
            <div className="text-xs mt-2 text-slate-300 print:text-gray-600">
              {t.policy.email} <a href="mailto:admin@volunteerbuyers.com" className="text-green-400 font-bold hover:underline print:text-green-700">admin@volunteerbuyers.com</a>
            </div>
            <div className="text-xs text-green-300 mt-3 font-semibold print:text-green-800">
              {t.policy.deadlineTitle} <strong className="text-green-400 print:text-green-700">{t.policy.deadlineSub}</strong>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 shrink-0 md:w-40 text-center print:bg-white print:border-gray-300">
            {/* OJO: Necesitarás poner la imagen qr.png en tu carpeta /public/ */}
            <img src="/qr.png" alt="QR Code" className="w-24 h-24 rounded-lg bg-white p-1" />
            <p className="text-[11px] text-slate-400 mt-1 leading-tight print:text-gray-600">{t.policy.qrScan}</p>
          </div>
        </div>

        {/* Timeline y Reglas en Minitarjetas a 2 Columnas */}
        <div className="flex flex-col gap-6 mb-4">
          
          {/* Seccion: Weekly Schedule */}
          <div>
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3 pb-2 border-b-2 border-slate-800 print:text-gray-500 print:border-gray-200">
              {t.policy.scheduleTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TimelineRow cardHeader={(t.policy as any).cardWed || "Wednesday"} dotColor="bg-red-500" dotText={t.policy.wed} title={t.policy.wedTitle} desc={t.policy.wedDesc} />
              <TimelineRow cardHeader={(t.policy as any).cardThu || "Thursday"} dotColor="bg-green-600" dotText={t.policy.thu} title={t.policy.thuTitle} desc={t.policy.thuDesc} />
              <TimelineRow cardHeader={(t.policy as any).cardFri || "Friday"} dotColor="bg-green-600" dotText={t.policy.fri} title={t.policy.friTitle} desc={t.policy.friDesc} />
              <TimelineRow cardHeader={(t.policy as any).cardCaution || "Caution"} dotColor="bg-slate-600" dotText={t.policy.thuFri} title={t.policy.thuFriTitle} desc={t.policy.thuFriDesc} smallDot />
            </div>
          </div>

          {/* Seccion: Payment Rules */}
          <div>
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3 pb-2 border-b-2 border-slate-800 print:text-gray-500 print:border-gray-200">
              {t.policy.rulesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RuleRow icon="🔨" type="danger" title={t.policy.rule1Title} desc={t.policy.rule1Desc} />
              <RuleRow icon="✅" type="success" title={t.policy.rule2Title} desc={t.policy.rule2Desc} />
              <RuleRow icon="⏰" type="danger" title={t.policy.rule3Title} desc={t.policy.rule3Desc} />
              <RuleRow icon="🚫" type="danger" title={t.policy.rule4Title} desc={t.policy.rule4Desc} />
            </div>
          </div>

        </div>

        {/* Formulario W-9 */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 print:bg-gray-100 print:border-gray-300 print:text-black">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-yellow-400 mb-2">
            {t.policy.w9Title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed print:text-gray-700">
            {t.policy.w9Desc}
            <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noreferrer" className="text-blue-400 font-bold hover:underline print:text-blue-600">
              irs.gov/pub/irs-pdf/fw9.pdf
            </a>
          </p>
        </div>

       {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800 print:border-gray-300 print:text-gray-500">
          {t.policy.subtitle}   {t.policy.questions} (901) 318-1736 WhatsApp   admin@volunteerbuyers.com
        </div>
      </div>

      <ContractorBottomNav />
    </div>
  );
}

// === Sub-componentes Locales (Solo se usan en esta vista) ===

function TimelineRow({ cardHeader, dotColor, dotText, title, desc, smallDot = false }: { cardHeader?: string, dotColor: string, dotText: string, title: string, desc: string, smallDot?: boolean }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:border-slate-600 transition print:bg-white print:border-gray-300">
      {cardHeader && (
        <div className="bg-slate-700/50 px-3.5 py-1.5 border-b border-slate-700/50 text-[11px] font-bold uppercase tracking-wider text-slate-300 print:bg-gray-100 print:text-black">
          {cardHeader}
        </div>
      )}
      <div className="p-3.5 flex gap-3 items-start flex-1">
        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-center leading-tight shadow-sm ${dotColor} ${smallDot ? 'text-[9px]' : 'text-[11px]'}`}>
          {dotText}
        </div>
        <div className="flex-1 min-w-0">
          <strong className="block text-[13px] text-slate-100 mb-1 print:text-black">{title}</strong>
          <p className="text-xs text-slate-400 leading-snug print:text-gray-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function RuleRow({ icon, type, title, desc }: { icon: string, type: 'danger' | 'success' | 'warning', title: string, desc: string }) {
  const styles = {
    danger: 'bg-red-950/30 border-red-900/50 print:bg-red-50 print:border-red-200',
    success: 'bg-green-950/30 border-green-900/50 print:bg-green-50 print:border-green-200',
    warning: 'bg-yellow-950/30 border-yellow-900/50 print:bg-yellow-50 print:border-yellow-200',
  };

  return (
    <div className={`flex gap-3 items-start p-2.5 rounded-lg border mb-2 last:mb-0 ${styles[type]}`}>
      <div className="text-base shrink-0">{icon}</div>
      <div>
        <strong className="block text-[12px] text-slate-100 mb-0.5 print:text-black">{title}</strong>
        <p className="text-[11px] text-slate-400 leading-snug print:text-gray-600">{desc}</p>
      </div>
    </div>
  );
}