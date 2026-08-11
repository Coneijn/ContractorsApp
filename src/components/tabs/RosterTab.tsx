import React from 'react';
import ContractorCard, { HistoryItem } from '@/components/ContractorCard';
import { useLanguage } from '@/context/LanguageContext';

type RosterTabProps = {
  contractors: any[];
  properties: any[];
  rosterFilter: 'approved' | 'notUsed' | 'all';
  setRosterFilter: (filter: 'approved' | 'notUsed' | 'all') => void;
};

export default function RosterTab({ contractors, properties, rosterFilter, setRosterFilter }: RosterTabProps) {
  const { t } = useLanguage();

  const filteredContractors = contractors.filter(c => 
    rosterFilter === 'all' || 
    (rosterFilter === 'approved' ? c.status === 'ACTIVE' : c.status === 'INACTIVE')
  );

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button 
          onClick={() => setRosterFilter('approved')} 
          className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${rosterFilter === 'approved' ? 'border-yellow-400 bg-yellow-400 text-slate-900' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-yellow-400 hover:text-yellow-400'}`}
        >
          {t.dashboard.roster.approved}
        </button>
        <button 
          onClick={() => setRosterFilter('notUsed')} 
          className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${rosterFilter === 'notUsed' ? 'border-yellow-400 bg-yellow-400 text-slate-900' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-yellow-400 hover:text-yellow-400'}`}
        >
          {t.dashboard.roster.notUsed}
        </button>
        <button 
          onClick={() => setRosterFilter('all')} 
          className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${rosterFilter === 'all' ? 'border-yellow-400 bg-yellow-400 text-slate-900' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-yellow-400 hover:text-yellow-400'}`}
        >
          All
        </button>
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-3 pb-2 border-b border-slate-800 mt-6">
        {rosterFilter === 'notUsed' ? "Contractors We Haven't Used Yet" : t.dashboard.roster.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContractors.map((contractor) => {
          
          const historyItems: HistoryItem[] = [];
          let historyType: 'Work History' | 'Bid History' | 'Trades' = 'Trades';

          // 1. Buscamos si tiene "Work History" (Tareas asignadas en cualquier propiedad)
          const contractorTasks = properties.flatMap(p => 
            p.tasks
             .filter((t: any) => t.subcontractorId === contractor.id)
             .map((t: any) => ({ propAddress: p.address, task: t, prop: p }))
          );

          if (contractorTasks.length > 0) {
            historyType = 'Work History';
            contractorTasks.forEach(({ propAddress, task, prop }) => {
               const amountInfo = prop.invoices?.find((i: any) => i.subcontractorId === contractor.id)?.agreedAmount 
                                 || prop.estimates?.find((e: any) => e.subcontractorId === contractor.id && e.status === 'APPROVED')?.amount;
               
               historyItems.push({
                 address: propAddress,
                 detail: task.description,
                 price: amountInfo ? `$${Number(amountInfo).toLocaleString('en-US')}` : 'TBD'
               });
            });
          } else {
            // 2. Si no tiene tareas, buscamos si tiene "Bid History" (Estimaciones enviadas)
            const contractorBids = properties.flatMap(p => 
              (p.estimates || [])
               .filter((e: any) => e.subcontractorId === contractor.id)
               .map((e: any) => ({ propAddress: p.address, estimate: e }))
            );

            if (contractorBids.length > 0) {
              historyType = 'Bid History';
              contractorBids.forEach(({ propAddress, estimate }) => {
                 historyItems.push({
                   address: propAddress,
                   detail: estimate.workDescription || 'Bid received',
                   price: `$${Number(estimate.amount).toLocaleString('en-US')}`
                 });
              });
            } else {
              // 3. Si no tiene ni tareas ni estimaciones, mostramos "Trades" (Especialidad de la base de datos)
              historyType = 'Trades';
              historyItems.push({
                detail: contractor.tradeSpecialty || 'N/A'
              });
            }
          }

          return (
            <ContractorCard 
              key={contractor.id}
              name={contractor.name} 
              company={contractor.company} 
              phone={contractor.whatsappNumber} 
              email={contractor.email}
              area="Memphis, TN" // Hardcodeado a la zona como en el HTML original
              hasW9={contractor.hasW9} 
              historyType={historyType}
              historyItems={historyItems}
            />
          );
        })}
      </div>
    </div>
  );
}