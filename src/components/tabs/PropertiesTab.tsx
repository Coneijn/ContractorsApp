import React from 'react';
import Badge from '@/components/Badge';
import { useLanguage } from '@/context/LanguageContext';

type PropertiesTabProps = {
  properties: any[];
};

export default function PropertiesTab({ properties }: PropertiesTabProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
        {t.dashboard.properties.workingOn}
      </h2>
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
            {properties.filter(p => p.status === 'RENOVATING' && p.tasks.some((t: any) => t.subcontractor)).length === 0 ? (
              <tr><td colSpan={4} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noActive}</td></tr>
            ) : (
              properties.filter(p => p.status === 'RENOVATING').flatMap((prop) => 
                prop.tasks.filter((t: any) => t.subcontractor).map((task: any) => {
                  let visualStatus = task.status === 'IN_PROGRESS' ? 'in-progress' : 'scheduled';
                  let badgeText = task.status === 'IN_PROGRESS' ? t.badges.inProgress : t.badges.scheduled;

                  const amountInfo = prop.estimates?.find((e: any) => e.status === 'APPROVED' || e.subcontractorId === task.subcontractor.id)?.amount 
                                    || prop.invoices?.find((i: any) => i.subcontractorId === task.subcontractor.id)?.agreedAmount;
                  const formattedAmount = amountInfo ? `$${Number(amountInfo).toLocaleString('en-US')}` : 'TBD';

                  return (
                    <tr key={`${prop.id}-${task.id}`} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                      <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">{prop.address}</a></td>
                      <td className="p-3">{task.subcontractor.name} {task.subcontractor.company ? `/ ${task.subcontractor.company}` : ''}</td>
                      <td className="p-3"><Badge type={visualStatus as any} text={badgeText} /></td>
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
            {properties.filter(p => !p.tasks[0]?.subcontractor).length === 0 ? (
              <tr><td colSpan={3} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noUnassigned}</td></tr>
            ) : (
              properties.filter(p => !p.tasks[0]?.subcontractor).map((prop) => {
                const task = prop.tasks[0];
                return (
                  <tr key={prop.id} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                    <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">{prop.address}</a></td>
                    <td className="p-3 text-slate-400">{task?.description || t.dashboard.messages.noTasks}</td>
                    <td className="p-3"><Badge type="unassigned" text={t.badges.unassigned} /></td>
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