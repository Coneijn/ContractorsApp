"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QuickActions from '@/components/QuickActions';
import NewAssignmentModal from '@/components/NewAssignmentModal';
import AddContractorModal from '@/components/AddContractorModal';
import AddPropertyModal from '@/components/AddPropertyModal';
import { getActiveAssignments, getContractors } from '@/actions/dashboardActions';

const TABS = [["roster", "Roster"], ["assignments", "🔨 Assignments"], ["properties", "🏠 Properties"], ["pastprojects", "📋 Past Projects"], ["directory", "Directory"]];

// Misma barra inferior que el dashboard (Quick Actions + navegación) con sus modales.
export default function InvoiceBottomBar() {
  const [properties, setProperties] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [modal, setModal] = useState<'assignment' | 'property' | 'contractor' | null>(null);

  const loadData = async () => {
    setProperties(await getActiveAssignments());
    setContractors(await getContractors());
  };
  useEffect(() => { loadData(); }, []);

  const close = () => setModal(null);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 shadow-2xl flex flex-col items-center">
        <div className="w-full flex justify-center px-4 pt-3 pb-2 border-b border-slate-700/50">
          <QuickActions
            onAddAssignment={() => setModal('assignment')}
            onAddProperty={() => setModal('property')}
            onAddContractor={() => setModal('contractor')}
          />
        </div>
        <div className="w-full p-3 flex gap-3 overflow-x-auto md:justify-center items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map(([tab, label]) => (
            <Link key={tab} href={`/admin/dashboard?tab=${tab}`} className="px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm">
              {label}
            </Link>
          ))}
          <span className="px-5 py-2.5 text-[13px] font-bold rounded-full whitespace-nowrap shrink-0 bg-yellow-400 text-slate-900 shadow-md">Invoice</span>
        </div>
      </div>

      <NewAssignmentModal isOpen={modal === 'assignment'} onClose={close} properties={properties} contractors={contractors} defaultPropertyId="" defaultContractorId="" defaultDescription="" onSuccess={loadData} />
      <AddContractorModal isOpen={modal === 'contractor'} onClose={close} contractors={contractors} onSuccess={loadData} />
      <AddPropertyModal isOpen={modal === 'property'} onClose={close} contractors={contractors} onSuccess={loadData} />
    </>
  );
}
