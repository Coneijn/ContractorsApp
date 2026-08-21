"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPropertyById } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// --- SUB-COMPONENTES PARA MANTENER EL CODIGO LIMPIO ---

function BannerItem({ label, value, sub, highlight = false }: { label: string, value: string | number, sub: string, highlight?: boolean }) {
  return (
    <div className={`flex-1 min-w-[140px] p-4 border-r border-slate-800 last:border-r-0 ${highlight ? 'border-l-4 border-yellow-400 bg-slate-800/50' : ''}`}>
      <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${highlight ? 'text-yellow-400' : 'text-slate-100'}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function SectionCard({ title, children, badge }: { title: string, children: React.ReactNode, badge?: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 mb-5 border border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700/50">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-yellow-400">{title}</h2>
        {badge && <div>{badge}</div>}
      </div>
      {children}
    </div>
  );
}

function SpecBox({ val, lbl }: { val: string | number, lbl: string }) {
  return (
    <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
      <div className="text-lg font-bold text-white">{val}</div>
      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{lbl}</div>
    </div>
  );
}

function TableRow({ lbl, val, isBold = false }: { lbl: string, val: React.ReactNode, isBold?: boolean }) {
  return (
    <tr>
      <td className="text-slate-400 w-[40%] py-2 border-b border-slate-700/50 text-[13px]">{lbl}</td>
      <td className={`py-2 border-b border-slate-700/50 text-[13px] ${isBold ? 'font-bold text-slate-200' : 'font-medium text-slate-300'}`}>{val}</td>
    </tr>
  );
}

// Helper para formatear dinero estilo US (ej. $172k, $172,500 o $757.36)
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'TBD';
  
  // Si tiene decimales (ej. 757.36), forzamos 2 decimales y comas en miles
  if (value % 1 !== 0) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Si es una cantidad cerrada de miles (ej. 172000), usamos formato 'k'
  if (value >= 1000 && value % 1000 === 0) {
    return `$${value / 1000}k`;
  }
  
  // Enteros regulares que no son millares cerrados (ej. 172500 -> $172,500)
  return `$${value.toLocaleString('en-US')}`;
}

// --- COMPONENTE PRINCIPAL ---

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const propertyId = resolvedParams.id;
  const { t, language, setLanguage } = useLanguage() as any;
  const pt = t.propertyDetail || {};
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [checklist, setChecklist] = useState({
    psa: true,
    alta: false,
    close: false,
    loan: false,
    rehab: false,
    buyer: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPropertyById(propertyId);
        if (!data) {
          setHasError(true);
        } else {
          setProperty(data);
        }
      } catch (err) {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-yellow-400 font-bold">{pt.loading || 'Loading...'}</div>;

  // Render Amigable Si Falla la Búsqueda o los Datos
  if (hasError || !property) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-200 font-sans text-center">
        <div className="bg-slate-800 border-t-4 border-yellow-400 p-8 rounded-2xl max-w-md w-full shadow-xl">
          <div className="text-5xl mb-4">🚧</div>
          <h1 className="text-xl font-extrabold text-white mb-2">
            {pt.error?.title || 'Property Not Ready Yet'}
          </h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {pt.error?.desc || 'Please be patient, we are currently working on the details for this property.'}
          </p>
          <Link href="/admin/dashboard" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-3 px-6 rounded-lg transition-colors shadow-sm">
            {pt.error?.back || pt.backDashboard || 'Back to Dashboard'}
          </Link>
        </div>
      </div>
    );
  }

  // Logica de datos
  const latestUpdate = property.activityLogs?.length > 0 ? property.activityLogs[0] : null;
  const totalRehabBudget = property.estimates?.filter((e: any) => e.status === 'APPROVED').reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  
  // Separar Fotos y Videos
  const photos = property.media?.filter((m: any) => m.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i)) || [];
  const videos = property.media?.filter((m: any) => m.fileUrl.match(/\.(mp4|mov|webm)$/i)) || [];

  // Consolidar Documentos
  const docs = [
    ...(property.agreements?.filter((a:any) => a.documentUrl).map((a:any) => ({ title: `Agreement - ${a.status}`, url: a.documentUrl })) || []),
    ...(property.estimates?.filter((e:any) => e.documentUrl).map((e:any) => ({ title: `Estimate - ${e.status}`, url: e.documentUrl })) || []),
    ...(property.invoices?.filter((i:any) => i.invoiceUrl).map((i:any) => ({ title: `Invoice - ${i.status}`, url: i.invoiceUrl })) || []),
    ...(property.documents || [])
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-10">
      
      {/* HEADER HERO */}
      <div className="bg-slate-900 p-6 border-b-4 border-yellow-400">
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link href="/admin/dashboard" className="text-yellow-400 hover:text-yellow-300 font-extrabold text-2xl mr-2">←</Link>
          <img src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png" alt="Spencer" className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400 shrink-0" />
          
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white">{property.address || 'Address TBD'}</h1>
            <p className="text-sm text-slate-400 mt-1">SpencerBuysHouses.com</p>
            
            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-600 rounded-full text-[11px] font-bold">
                {pt.dbStatus || 'Status:'} {property.status}
              </span>
              {property.strategy === 'Rental' && <span className="px-3 py-1 bg-green-950 text-green-400 border border-green-900 rounded-full text-[11px] font-bold">🏘️ Rental</span>}
              {property.strategy === 'Flip' && <span className="px-3 py-1 bg-pink-950 text-pink-300 border border-pink-900 rounded-full text-[11px] font-bold">🏠 Flip</span>}
              {property.seekingCapital && <span className="px-3 py-1 bg-amber-950 text-yellow-400 border border-amber-900 rounded-full text-[11px] font-bold">💰 Raising Capital</span>}
            </div>
          </div>

         {/* ACCIONES DE CABECERA */}
          <div className="mt-4 md:mt-0 md:ml-auto flex flex-wrap items-center justify-end gap-3">
            <Link 
              href={`/admin/property/${propertyId}/edit`}
              className="bg-yellow-400 border border-yellow-500 hover:bg-yellow-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm text-slate-900 flex items-center gap-2"
            >
              ✏️ {language === 'en' ? 'Edit' : 'Editar'}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* FINANCIAL BANNER */}
      <div className="bg-slate-950 border-b border-slate-800 mb-6 flex flex-wrap">
        <div className="max-w-[960px] mx-auto w-full flex flex-wrap">
          <BannerItem label={pt.specs?.purchasePrice || "Purchase Price"} value={formatCurrency(property.purchasePrice)} sub={property.seller || (pt.pendingDocs || 'Pending')} />
          <BannerItem label={pt.specs?.avm || "AVM"} value={formatCurrency(property.avm)} sub="RentCast" />
          <BannerItem label="Rehab Budget" value={totalRehabBudget > 0 ? formatCurrency(totalRehabBudget) : 'TBD'} sub="Estimates Approved" />
          <BannerItem label="Close Date" value={property.closeDate ? new Date(property.closeDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'TBD'} sub={property.status || 'TBD'} />
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-[960px] mx-auto p-4">
        
        {/* LATEST UPDATE */}
        {latestUpdate && (
          <SectionCard title={pt.latestUpdate || "Latest Update"}>
            <div className="bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-[13px] text-blue-400">{latestUpdate.action}</div>
                <div className="text-[11px] text-blue-300/70">{new Date(latestUpdate.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-blue-100/90 leading-relaxed">
                <strong className="text-yellow-400">[{latestUpdate.actorName}]</strong> {latestUpdate.description}
              </div>
            </div>
          </SectionCard>
        )}

        {/* PROPERTY SPECS */}
        <SectionCard title={pt.propertySpecs || "Property Specs"}>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <SpecBox val={property.beds || 'TBD'} lbl={pt.specs?.beds || "Beds"} />
            <SpecBox val={property.baths || 'TBD'} lbl={pt.specs?.baths || "Baths"} />
            <SpecBox val={property.sqft ? property.sqft.toLocaleString('en-US') : 'TBD'} lbl={pt.specs?.sqft || "SqFt"} />
            <SpecBox val={property.yearBuilt || 'TBD'} lbl={pt.specs?.built || "Built"} />
            <SpecBox val={formatCurrency(property.avm)} lbl={pt.specs?.avm || "AVM"} />
            <SpecBox val={property.estRent ? `${formatCurrency(property.estRent)}/mo` : 'TBD'} lbl={pt.specs?.estRent || "Est. Rent"} />
          </div>
        </SectionCard>

        {/* DETAILS & LOAN (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title={pt.propertyDetails || "Property Details"}>
            <table className="w-full border-collapse">
              <tbody>
                <TableRow lbl={pt.specs?.address || "Address"} val={property.address || 'TBD'} isBold />
                <TableRow lbl={pt.specs?.county || "County"} val={property.county || 'TBD'} />
                <TableRow lbl={pt.specs?.seller || "Seller"} val={property.seller || 'TBD'} />
                <TableRow lbl={pt.specs?.buyer || "Buyer"} val={property.buyer || 'Volunteer Homes, LLC'} />
                <TableRow lbl={pt.specs?.type || "Property Type"} val={property.propertyType || 'Single Family'} />
                <TableRow lbl={pt.specs?.lockbox || "Lockbox / Code"} val={property.accessCodeOrLockbox || 'N/A'} isBold />
                <TableRow lbl={pt.specs?.purchasePrice || "Purchase Price"} val={formatCurrency(property.purchasePrice)} />
                <TableRow lbl={pt.specs?.strategy || "Strategy"} val={property.strategy || 'TBD'} />
                <TableRow lbl={pt.specs?.status || "Status"} val={property.status || 'TBD'} isBold />
              </tbody>
            </table>
          </SectionCard>

          {/* LOAN TERMS CONDICIONAL */}
          {(property.loanLender || property.loanAmount) ? (
            <SectionCard title={pt.loanTerms || "Loan Terms"}>
              <table className="w-full border-collapse">
                <tbody>
                  <TableRow lbl={pt.specs?.lender || "Lender"} val={property.loanLender || 'TBD'} isBold />
                  <TableRow lbl={pt.specs?.loanAmount || "Loan Amount"} val={formatCurrency(property.loanAmount)} />
                  <TableRow lbl={pt.specs?.interestRate || "Interest Rate"} val={property.loanRate || 'TBD'} />
                  <TableRow lbl={pt.specs?.monthlyPmt || "Monthly Pmt"} val={formatCurrency(property.loanMonthly)} />
                  <TableRow lbl={pt.specs?.maturityDate || "Maturity Date"} val={<span className="text-orange-400 font-bold">  {property.loanMaturity ? new Date(property.loanMaturity).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'N/A'}</span>} />                  
                  <TableRow lbl={pt.specs?.holdback || "Holdback"} val={formatCurrency(property.loanHoldback)} />
                  <TableRow lbl={pt.specs?.cashToClose || "Cash to Close"} val={formatCurrency(property.loanCashToClose)} />
                </tbody>
              </table>
            </SectionCard>
          ) : (
            <SectionCard title={pt.loanTerms || "Loan Terms"}>
              <div className="text-center text-slate-500 py-6 text-sm">
                {pt.noLoanDetails || "No loan details registered yet."}
              </div>
            </SectionCard>
          )}
        </div>

        {/* CONDITION NOTES (Condicional) */}
        {property.conditionNotes && property.conditionNotes.length > 0 && (
          <SectionCard title={pt.conditionNotes || "Condition Notes / Walkthrough"}>
            <table className="w-full border-collapse">
              <tbody>
                {property.conditionNotes.map((note: any, idx: number) => (
                  <TableRow key={idx} lbl={note.category} val={note.isCritical ? <span className="text-red-400 font-bold">⚠️ {note.description}</span> : note.description} />
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {/* CLOSING CHECKLIST */}
        <SectionCard title={pt.closingChecklist || "Closing / Workflow Checklist"}>
          <div className="space-y-1">
            {[
              { id: 'psa', label: 'PSA signed', role: 'Pam' },
              { id: 'alta', label: 'ALTA filed', role: 'Pam' },
              { id: 'loan', label: 'Loan docs filed', role: 'Pam' },
              { id: 'close', label: 'Closed', role: 'Bradsher' },
              { id: 'rehab', label: 'Rehab complete', role: 'Alex' },
              { id: 'buyer', label: 'Buyer / Tenant found', role: 'Daniela' },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0">
                <input 
                  type="checkbox" 
                  id={`cl-${item.id}`} 
                  checked={checklist[item.id as keyof typeof checklist]}
                  onChange={() => toggleCheck(item.id as keyof typeof checklist)}
                  className="w-4 h-4 cursor-pointer accent-yellow-400"
                />
                <label htmlFor={`cl-${item.id}`} className="cursor-pointer text-slate-300 text-[13px] flex-1 flex items-center gap-2">
                  {item.label}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-400 font-medium">{item.role}</span>
                </label>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* DOCUMENTS */}
        <SectionCard title={`${pt.documents || 'Documents'} (${docs.length})`}>
          {docs.length > 0 ? (
            <ul className="space-y-2">
              {docs.map((doc: any, idx: number) => (
                <li key={idx} className="border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                  <a href={doc.url} target="_blank" className="text-blue-400 hover:text-blue-300 text-[13px] font-medium transition flex items-center gap-2">
                      {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">{pt.noDocuments || "No documents on file."}</p>
          )}
        </SectionCard>

        {/* PROGRESS LOG */}
        <SectionCard title={pt.progressLog || "Progress Log"}>
          {property.activityLogs?.length > 0 ? (
            <ul className="space-y-3">
              {property.activityLogs.map((log: any) => (
                <li key={log.id} className="pb-3 border-b border-slate-700/50 last:border-0 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div className="text-slate-300 text-[13px] leading-relaxed flex-1">
                    <strong className="text-yellow-400">[{log.actorName}]</strong> {log.description}
                  </div>
                  <div className="text-slate-500 text-[11px] whitespace-nowrap font-bold">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">{pt.noActivity || "No activity logged yet."}</p>
          )}
        </SectionCard>

        {/* MEDIA: PHOTOS & VIDEOS */}
        <SectionCard title={`${pt.media || 'Media: Photos & Videos'} (${photos.length + videos.length})`}>
          {/* VIDEOS */}
          {videos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">🎥 {pt.videos || 'Videos'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {videos.map((vid: any) => (
                  <a key={vid.id} href={vid.fileUrl} target="_blank" className="relative group block rounded-lg overflow-hidden border border-slate-600 bg-slate-900 aspect-video">
                    <video src={vid.fileUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                    <span className="absolute inset-0 flex items-center justify-center text-3xl group-hover:scale-110 transition drop-shadow-lg">▶️</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* PHOTOS */}
          {photos.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">📸 {pt.photos || 'Photos'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {photos.map((pic: any) => (
                  <a key={pic.id} href={pic.fileUrl} target="_blank" className="block rounded-lg overflow-hidden border border-slate-600 bg-slate-900 aspect-square">
                    <img src={pic.fileUrl} alt="Propiedad" className="w-full h-full object-cover hover:opacity-80 transition hover:scale-105" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
             <p className="text-xs text-slate-500">{pt.noMedia || "No media uploaded."}</p>
          )}
        </SectionCard>

      </div>
    </div>
  );
}