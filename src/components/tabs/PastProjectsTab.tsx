import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import StatusUpdateModal from '@/components/StatusUpdateModal';

type PastProjectsTabProps = {
  properties: any[];
  onUpdate?: () => void;
};

export default function PastProjectsTab({ properties, onUpdate }: PastProjectsTabProps) {
  const { t } = useLanguage();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // 1. Definimos qué estados de tarea se consideran "Terminados"
  const completedTaskStatuses = ['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA'];

  // 2. Filtramos todas las tareas que ya están terminadas, sin importar el estatus general de la casa
  const completedItems = properties.flatMap(prop => {
    if (prop.tasks && prop.tasks.length > 0) {
      return prop.tasks
        .filter((task: any) => completedTaskStatuses.includes(task.status))
        .map((task: any) => ({ prop, task }));
    } else if (prop.status === 'COMPLETED') {
      // Caso extra: Si marcaste la propiedad manualmente como COMPLETED y no tiene tareas
      return [{ prop, task: null }];
    }
    return [];
  }).sort((a, b) => {
    const timeA = a.task ? new Date(a.task.updatedAt || 0).getTime() : new Date(a.prop.updatedAt || 0).getTime();
    const timeB = b.task ? new Date(b.task.updatedAt || 0).getTime() : new Date(b.prop.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
        {t.dashboard.pastProjects.title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.property}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.contractor}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.scope}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.amount}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">{t.dashboard.table.date}</th>
              <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700"></th>
            </tr>
          </thead>
        <tbody className="text-slate-300">
            {completedItems.length === 0 ? (
              <tr><td colSpan={6} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noCompleted}</td></tr>
            ) : (
              completedItems.map(({ prop, task }: any) => {
                 const amountInfo = task ? (prop.invoices?.find((i: any) => i.subcontractorId === task.subcontractorId)?.agreedAmount 
                                      || prop.estimates?.find((e: any) => e.subcontractorId === task.subcontractorId)?.amount) : null; 
                 const formattedAmount = amountInfo ? `$${Number(amountInfo).toLocaleString('en-US')}` : 'TBD';
                 
                 // Lógica para fechas
                 const targetDate = task ? new Date(task.updatedAt) : new Date(prop.updatedAt);
                 let formattedDate = new Intl.DateTimeFormat('en-US', {
                   month: 'short',
                   day: 'numeric',
                   year: 'numeric'
                 }).format(targetDate);

                 if (targetDate.getMonth() === 0 && targetDate.getDate() === 1) {
                   formattedDate = targetDate.getFullYear().toString();
                 }

                 return (
                   <tr key={`${prop.id}-${task?.id || 'no-task'}`} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                     <td className="p-3">
                       <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-bold">
                         {prop.address}
                       </Link>
                     </td>
                     <td className="p-3">{task?.subcontractor?.name || ' '}</td>
                     <td className="p-3 text-slate-400">{task?.description || 'N/A'}</td>
                     <td className="p-3 font-bold text-yellow-400">{formattedAmount}</td>
                     <td className="p-3 text-slate-400">{formattedDate}</td>
                     <td className="p-3">
                       {task && (
                         <button
                           onClick={() => setEditingTaskId(task.id)}
                           className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold px-2 py-1.5 rounded transition shadow-sm whitespace-nowrap"
                         >
                           {(t as any).common?.editStage || 'Edit Stage'}
                         </button>
                       )}
                     </td>
                   </tr>
                 );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edicion de estado (Componente) */}
      {editingTaskId && (
        <StatusUpdateModal 
          taskId={editingTaskId}
          isOpen={!!editingTaskId}
          onClose={() => setEditingTaskId(null)}
          onSuccess={() => {
            setEditingTaskId(null);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </div>
  );
}