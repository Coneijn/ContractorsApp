"use client"; 
import QuickActions from '@/components/QuickActions';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AssignmentsTab from '@/components/tabs/AssignmentsTab';
import RosterTab from '@/components/tabs/RosterTab';
import PropertiesTab from '@/components/tabs/PropertiesTab';
import PastProjectsTab from '@/components/tabs/PastProjectsTab';
import DirectoryTab from '@/components/tabs/DirectoryTab';
import NewAssignmentModal from '@/components/NewAssignmentModal';
import AddContractorModal from '@/components/AddContractorModal';
import AddPropertyModal from '@/components/AddPropertyModal';
import { getActiveAssignments, getContractors } from '@/actions/dashboardActions';
import { useLanguage } from '@/context/LanguageContext';

type TabType = 'roster' | 'assignments' | 'properties' | 'pastprojects' | 'directory';

export default function DashboardPage() {
  const { t, language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [properties, setProperties] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [rosterFilter, setRosterFilter] = useState<'approved' | 'notUsed' | 'all'>('approved');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContractorModalOpen, setIsContractorModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  
  const [defaultPropId, setDefaultPropId] = useState('');
  const [defaultContractorId, setDefaultContractorId] = useState('');
  const [defaultDesc, setDefaultDesc] = useState('');

  const openAssignModal = (propId = '', contractorId = '', desc = '') => {
    setDefaultPropId(propId);
    setDefaultContractorId(contractorId);
    setDefaultDesc(desc);
    setIsModalOpen(true);
  };

  const loadData = async () => {
    const data = await getActiveAssignments();
    setProperties(data);
    const rosterData = await getContractors();
    setContractors(rosterData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Soporte seguro para la traducción de directory mientras se actualizan los tipos del contexto
  const directoryTabLabel = (t.dashboard.tabs as Record<string, string>)?.directory || (language === 'es' ? 'Directorio' : 'Directory');

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

      <main className="max-w-[1100px] mx-auto p-6 pb-[260px]">

        {activeTab === 'roster' && (
          <RosterTab
             contractors={contractors}
             properties={properties}
             rosterFilter={rosterFilter}
             setRosterFilter={setRosterFilter}
             onAssign={(contractorId) => openAssignModal('', contractorId)}
             onAddContractor={() => setIsContractorModalOpen(true)}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab 
            properties={properties} 
            onUpdate={loadData} 
            onAssign={(propId, contractorId, desc) => openAssignModal(propId, contractorId, desc)}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesTab 
            properties={properties} 
            onAssign={(propId, desc) => openAssignModal(propId, undefined, desc)}
            onAddProperty={() => setIsPropertyModalOpen(true)}
          />
        )}
        
        {activeTab === 'pastprojects' && (
          <PastProjectsTab properties={properties} onUpdate={loadData} />
        )}

        {activeTab === 'directory' && (
          <DirectoryTab />
        )}
      </main>

        {/* Contenedor Fijo Flotante: Barra Inferior (Quick Actions + Navegacion) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 shadow-2xl flex flex-col items-center">
        
        {/* Fila Superior: Quick Actions */}
        <div className="w-full flex justify-center px-4 pt-3 pb-2 border-b border-slate-700/50">
          <QuickActions 
            onAddAssignment={() => openAssignModal('', '', '')}
            onAddProperty={() => setIsPropertyModalOpen(true)}
            onAddContractor={() => setIsContractorModalOpen(true)}
          />
        </div>

        {/* Fila Inferior: Menu de Navegacion */}
        <div className="w-full p-3 flex gap-3 overflow-x-auto md:justify-center items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
             onClick={() => setActiveTab('roster')}
            className={`px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${activeTab === 'roster' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm'}`}
          >
              Roster
          </button>
          <button
             onClick={() => setActiveTab('assignments')}
            className={`px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${activeTab === 'assignments' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm'}`}
          >
            {t.dashboard.tabs.assignments}
          </button>
          <button
             onClick={() => setActiveTab('properties')}
            className={`px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${activeTab === 'properties' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm'}`}
          >
            {t.dashboard.tabs.properties}
          </button>
          <button
             onClick={() => setActiveTab('pastprojects')}
            className={`px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${activeTab === 'pastprojects' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm'}`}
          >
            {t.dashboard.tabs.pastProjects}
          </button>
          <button
             onClick={() => setActiveTab('directory')}
            className={`px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 ${activeTab === 'directory' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm'}`}
          >
              {directoryTabLabel}
          </button>
        </div>

        </div>

      {/* MODALES GLOBALES */}
      <NewAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        properties={properties}
        contractors={contractors}
        defaultPropertyId={defaultPropId}
        defaultContractorId={defaultContractorId}
        defaultDescription={defaultDesc}
        onSuccess={loadData}
      />

      <AddContractorModal
        isOpen={isContractorModalOpen}
        onClose={() => setIsContractorModalOpen(false)}
        contractors={contractors}
        onSuccess={loadData}
      />

      <AddPropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        contractors={contractors}
        onSuccess={loadData}
      />
    </div>
  );
}