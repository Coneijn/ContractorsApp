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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {properties.filter(p => p.status === 'RENOVATING' && p.tasks.some((t: any) => t.subcontractor && !['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'].includes(t.status))).length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-6 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 text-center text-sm shadow-sm">
            {t.dashboard.messages.noActive}
          </div>
        ) : (
          properties.filter(p => p.status === 'RENOVATING').flatMap((prop) => 
            prop.tasks.filter((t: any) => t.subcontractor && !['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'].includes(t.status)).map((task: any) => {
              let visualStatus = (task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED_OR_TO_DO') ? 'in-progress' : 'scheduled';
              let badgeText = (task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED_OR_TO_DO') ? t.badges.inProgress : t.badges.scheduled;
              
              const amountInfo = prop.estimates?.find((e: any) => e.status === 'APPROVED' || e.subcontractorId === task.subcontractor.id)?.amount 
                                 || prop.invoices?.find((i: any) => i.subcontractorId === task.subcontractor.id)?.agreedAmount;
              const formattedAmount = amountInfo ? `$${Number(amountInfo).toLocaleString('en-US')}` : 'TBD';

              return (
                <div key={`${prop.id}-${task.id}`} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm hover:border-yellow-400 transition flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-extrabold text-[15px] leading-tight">
                      {prop.address}
                    </Link>
                    <Badge type={visualStatus as any} text={badgeText} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{t.dashboard.table.contractor}</div>
                    <div className="text-[13px] font-semibold text-slate-200">
                      {task.subcontractor.name} {task.subcontractor.company ? `/ ${task.subcontractor.company}` : ''}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-1 pt-3 border-t border-slate-700/50">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{t.dashboard.table.amount}</div>
                      <div className="text-[14px] font-black text-yellow-400">{formattedAmount}</div>
                    </div>
                    <button 
                      onClick={() => onAssign && onAssign(prop.id)} 
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap"
                      title={(t as any).dashboard.buttons?.newTaskTitle || 'Assign new task'}
                    >
                      {(t as any).dashboard.buttons?.newTask || '+ New Task'}
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
        {t.dashboard.properties.unassigned}
      </h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(() => {
          const unassignedItems = properties.flatMap(prop => {
            if (prop.status === 'COMPLETED') return [];
            if (!prop.tasks || prop.tasks.length === 0) return [{ prop, task: null }];
            
            return prop.tasks
              .filter((t: any) => !t.subcontractor && !['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'].includes(t.status))
              .map((t: any) => ({ prop, task: t }));
          });

          if (unassignedItems.length === 0) {
            return (
              <div className="col-span-1 md:col-span-2 p-6 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 text-center text-sm shadow-sm">
                {t.dashboard.messages.noUnassigned}
              </div>
            );
          }

          return unassignedItems.map(({ prop, task }) => (
            <div key={`${prop.id}-${task?.id || 'empty'}`} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm hover:border-yellow-400 transition flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start gap-2">
                <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-extrabold text-[15px] leading-tight">
                  {prop.address}
                </Link>
                <Badge type="unassigned" text={t.badges.unassigned} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{t.dashboard.table.notes}</div>
                <div className="text-[12px] text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 min-h-[44px]">
                  {task?.description || t.dashboard.messages.noTasks}
                </div>
              </div>
              <div className="mt-1 pt-3 border-t border-slate-700/50 flex justify-end">
                <button 
                  onClick={() => onAssign && onAssign(prop.id, task?.description)} 
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  {(t as any).dashboard.buttons?.assignContractor || '+ Assign Contractor'}
                </button>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* RENDER 3: Propiedades Terminadas */}
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800 mt-8">
        {(t as any).dashboard?.properties?.completed || 'Completed Properties'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.filter(p => p.status === 'COMPLETED').length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-6 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 text-center text-sm shadow-sm">
            {(t as any).dashboard?.messages?.noCompleted || 'No completed properties.'}
          </div>
        ) : (
          properties.filter(p => p.status === 'COMPLETED').map((prop) => (
            <div key={prop.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm hover:border-yellow-400 transition flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start gap-2">
                <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-extrabold text-[15px] leading-tight">
                  {prop.address}
                </Link>
                <Badge type="completed" text={(t as any).badges?.completedBadge || 'Completed'} />
              </div>
              <div className="mt-1 pt-3 border-t border-slate-700/50 flex justify-end">
                <button 
                  onClick={() => onAssign && onAssign(prop.id)} 
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  {(t as any).dashboard.buttons?.newTask || '+ New Task'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}