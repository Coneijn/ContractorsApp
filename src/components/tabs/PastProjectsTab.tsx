import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

type PastProjectsTabProps = {
  properties: any[];
};

export default function PastProjectsTab({ properties }: PastProjectsTabProps) {
  const { t } = useLanguage();

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
            </tr>
          </thead>
        <tbody className="text-slate-300">
            {properties.filter(p => p.status === 'COMPLETED').length === 0 ? (
              <tr><td colSpan={5} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noCompleted}</td></tr>
            ) : (
              properties.filter(p => p.status === 'COMPLETED').flatMap(prop => 
                prop.tasks.map((task: any) => ({ prop, task }))
              )
              .sort((a, b) => new Date(b.task.updatedAt || 0).getTime() - new Date(a.task.updatedAt || 0).getTime())
              .map(({ prop, task }: any) => {
                const amountInfo = prop.invoices?.find((i: any) => i.subcontractorId === task.subcontractorId)?.agreedAmount
                                     || prop.estimates?.find((e: any) => e.subcontractorId === task.subcontractorId)?.amount;                  const formattedAmount = amountInfo ? `$${Number(amountInfo).toLocaleString('en-US')}` : 'TBD';

                  // Lógica para que coincida exactamente con las fechas del HTML estático original
                  const taskDate = new Date(task.updatedAt);
                  let formattedDate = new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(taskDate);

                  // Trampa visual: Si inyectamos el 1 de enero en la semilla, asumimos que solo sabemos el año.
                  if (taskDate.getMonth() === 0 && taskDate.getDate() === 1) {
                    formattedDate = taskDate.getFullYear().toString();
                  }

                  return (
                    <tr key={`${prop.id}-${task.id}`} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                      <td className="p-3">
                        <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-bold">
                          {prop.address}
                        </Link>
                      </td>
                      <td className="p-3">{task?.subcontractor?.name || ' '}</td>
                      <td className="p-3 text-slate-400">{task?.description || '—'}</td>
                      <td className="p-3 font-bold text-yellow-400">{formattedAmount}</td>
                      <td className="p-3 text-slate-400">{formattedDate}</td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}