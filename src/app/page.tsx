"use client"; 
import { useState, useEffect } from 'react';
import ContractorCard from '@/components/ContractorCard'; 
import PropertyCard from '@/components/PropertyCard';
import Badge from '@/components/Badge';
import { getActiveAssignments } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('assignments');
  const [properties, setProperties] = useState<any[]>([]);

  const loadData = async () => {
    const data = await getActiveAssignments();
    setProperties(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      
      <header className="bg-slate-800 p-5 border-b-2 border-yellow-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png" 
            alt="Spencer" 
            className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400"
          />
          <div>
            <h1 className="text-xl font-extrabold text-white">{t.dashboard.title}</h1>
            <p className="text-xs text-slate-400">{t.dashboard.subtitle}</p>
          </div>
        </div>
        
        {/* BOTÓN PARA CAMBIAR IDIOMA */}
        <button 
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
          {language === 'en' ? '🇲🇽 ES' : '🇺🇸 EN'}
        </button>
      </header>

      <div className="flex bg-slate-800 border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors ${activeTab === 'assignments' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          {t.dashboard.tabs.assignments}
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors ${activeTab === 'properties' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          {t.dashboard.tabs.properties}
        </button>
        <button 
          onClick={() => setActiveTab('pastprojects')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors ${activeTab === 'pastprojects' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          {t.dashboard.tabs.pastProjects}
        </button>
      </div>

      <main className="max-w-[1100px] mx-auto p-6">
        
        {activeTab === 'roster' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <button className="px-4 py-1.5 rounded-full border border-yellow-400 bg-yellow-400 text-slate-900 text-xs font-semibold">{t.dashboard.roster.approved}</button>
              <button className="px-4 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-400 text-xs font-semibold hover:border-yellow-400 hover:text-yellow-400 transition">{t.dashboard.roster.notUsed}</button>
            </div>

            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-3 pb-2 border-b border-slate-800">
              {t.dashboard.roster.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ContractorCard name="Mario" company="4JL Remodeling" phone="(901) 821-1502" area="Memphis, TN" hasW9={false} />
              <ContractorCard name="Tania" phone="(706) 461-4750" area="Memphis area" hasW9={false} />
              <ContractorCard name="Luis Felipe Hernandez" phone="(352) 284-9537" area="Memphis area" hasW9={false} />
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
              {t.dashboard.assignments.title}
            </h2>

            {properties.length === 0 ? (
              <p className="text-slate-400 text-sm">{t.dashboard.messages.loading}</p>
            ) : (
              properties.map((prop) => {
                const task = prop.tasks[0];
                const isUnassigned = !task || !task.subcontractor;
                
                let visualStatus = 'unassigned';
                if (task?.status === 'IN_PROGRESS') visualStatus = 'in-progress';
                if (task?.status === 'PENDING' && !isUnassigned) visualStatus = 'scheduled';
                
                return (
                  <div key={prop.id} className="mb-6">
                    {!isUnassigned && (
                      <div className="flex items-center gap-2 mb-3 p-3 bg-slate-800 rounded-lg border-l-4 border-yellow-400">
                        <div className="text-[14px] font-extrabold text-yellow-400">{task.subcontractor.name}</div>
                        <div className="text-[12px] text-slate-400">{task.subcontractor.company || ''}</div>
                      </div>
                    )}
                    
                    <PropertyCard 
                      taskId={task?.id}
                      propertyName={prop.address} 
                      notes={task?.description || t.dashboard.messages.noTasks} 
                      status={visualStatus as any} 
                      onUpdate={loadData}
                    />
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'properties' && (
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
                  {properties.filter(p => p.tasks[0]?.subcontractor).length === 0 ? (
                    <tr><td colSpan={4} className="p-3 text-slate-400 text-center">{t.dashboard.messages.noActive}</td></tr>
                  ) : (
                    properties.filter(p => p.tasks[0]?.subcontractor).map((prop) => {
                      const task = prop.tasks[0];
                      let visualStatus = task.status === 'IN_PROGRESS' ? 'in-progress' : 'scheduled';
                      let badgeText = task.status === 'IN_PROGRESS' ? t.badges.inProgress : t.badges.scheduled;                      return (
                        <tr key={prop.id} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                          <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">{prop.address}</a></td>
                          <td className="p-3">{task.subcontractor.name} {task.subcontractor.company ? `/ ${task.subcontractor.company}` : ''}</td>
                          <td className="p-3"><Badge type={visualStatus as any} text={badgeText} /></td>
                          <td className="p-3">TBD</td>
                        </tr>
                      );
                    })
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
        )}

        {activeTab === 'pastprojects' && (
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
                    properties.filter(p => p.status === 'COMPLETED').map((prop) => {
                      const task = prop.tasks[0];
                      return (
                        <tr key={prop.id} className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                          <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">{prop.address}</a></td>
                          <td className="p-3">{task?.subcontractor?.name || '—'}</td>
                          <td className="p-3 text-slate-400">{task?.description || '—'}</td>
                          <td className="p-3 font-bold">TBD</td>
                          <td className="p-3">{new Date(prop.updatedAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}