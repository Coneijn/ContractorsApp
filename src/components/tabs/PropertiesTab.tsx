import React from 'react';
import Link from 'next/link';
import Badge from '@/components/Badge';
import { useLanguage } from '@/context/LanguageContext';

type PropertiesTabProps = {
  properties: any[];
  onAssign?: (propId: string, desc?: string) => void;
  onAddProperty?: () => void;
};

export default function PropertiesTab({ properties, onAssign, onAddProperty }: PropertiesTabProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
        <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
          {t.dashboard.properties.workingOn}
        </h2>
        {onAddProperty && (
          <button
            onClick={onAddProperty}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors shadow-sm"
          >
            + {(t as any).dashboard?.modals?.addProperty?.title || 'Add Property'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.property}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.contractor}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.status}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.amount}</th>
            </tr>
          </thead>
         <tbody className="text-slate-300">
            {properties.filter(p => p.status === 'RENOVATING' && p.tasks.some((t: any) => t.subcontractor && !['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'].includes(t.status))).length === 0 ? (
              <tr><td colSpan={4} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noActive}</td></tr>
            ) : (
              properties.filter(p => p.status === 'RENOVATING').flatMap((prop) => 
                 prop.tasks.filter((t: any) => t.subcontractor && !['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'].includes(t.status)).map((task: any) => {
                  let visualStatus = (task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED_OR_TO_DO') ? 'in-progress' : 'scheduled';                  let badgeText = (task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED_OR_TO_DO') ? t.badges.inProgress : t.badges.scheduled;

                  const amountInfo = prop.estimates?.find((e: any) => e.status === 'APPROVED' || e.subcontractorId === task.subcontractor.id)?.amount 
                                    || prop.invoices?.find((i: any) => i.subcontractorId === task.subcontractor.id)?.agreedAmount;
                  const formattedAmount = amountInfo ? `$${Number(amountInfo).toLocaleString('en-US')}` : 'TBD';

                  return (
                    <tr key={`${prop.id}-${task.id}`} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                      <td className="p-3">
                        <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-bold">
                          {prop.address}
                        </Link>
                      </td>
                      <td className="p-3">{task.subcontractor.name} {task.subcontractor.company ? `/ ${task.subcontractor.company}` : ''}</td>
                      <td className="p-3 flex items-center gap-2">
                        <button 
                          onClick={() => onAssign && onAssign(prop.id)} 
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase font-bold px-2 py-1 rounded transition whitespace-nowrap shadow-sm"
                          title={(t as any).dashboard.buttons?.newTaskTitle || 'Assign new task'}
                        >
                          {(t as any).dashboard.buttons?.newTask || '+ New Task'}
                        </button>
                        <Badge type={visualStatus as any} text={badgeText} />
                      </td>
                      <td className="p-3 font-bold text-yellow-400">{formattedAmount}</td>
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
        {t.dashboard.properties.unassigned}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.property}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.notes}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.status}</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {(() => {
              const unassignedItems = properties.flatMap(prop => {
                if (prop.status === 'COMPLETED') return [];
                if (!prop.tasks || prop.tasks.length === 0) return [{ prop, task: null }];
                
                // Solo mostrar tareas sin asignar que NO estén terminadas ni canceladas
                return prop.tasks
                  .filter((t: any) => !t.subcontractor && !['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'].includes(t.status))
                  .map((t: any) => ({ prop, task: t }));
              });

              if (unassignedItems.length === 0) {
                return <tr><td colSpan={3} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noUnassigned}</td></tr>;
              }

              return unassignedItems.map(({ prop, task }) => (
                <tr key={`${prop.id}-${task?.id || 'empty'}`} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                  <td className="p-3">
                    <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-bold">
                      {prop.address}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-400">{task?.description || t.dashboard.messages.noTasks}</td>
                  <td className="p-3 flex items-center gap-2">
                    <Badge type="unassigned" text={t.badges.unassigned} />
                    <button onClick={() => onAssign && onAssign(prop.id, task?.description)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] px-2 py-1 rounded transition">
                      {(t as any).dashboard.buttons?.assignContractor || '+ Assign Contractor'}
                    </button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* RENDER 3: Propiedades Terminadas */}
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800 mt-8">
        {(t as any).dashboard?.properties?.completed || 'Completed Properties'}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.property}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.status}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{(t as any).dashboard?.table?.action || 'Action'}</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {properties.filter(p => p.status === 'COMPLETED').length === 0 ? (
              <tr><td colSpan={3} className="p-3 text-slate-400 text-center">{(t as any).dashboard?.messages?.noCompleted || 'No completed properties.'}</td></tr>
            ) : (
              properties.filter(p => p.status === 'COMPLETED').map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                  <td className="p-3">
                    <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-bold">
                      {prop.address}
                    </Link>
                  </td>
                  <td className="p-3"><Badge type="completed" text={(t as any).badges?.completedBadge || 'Completed'} /></td>
                  <td className="p-3">
                    <button onClick={() => onAssign && onAssign(prop.id)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] px-2 py-1 rounded transition">
                      {(t as any).dashboard.buttons?.newTask || '+ New Task'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}