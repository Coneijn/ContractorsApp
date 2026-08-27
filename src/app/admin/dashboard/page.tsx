"use client"; 

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

      <div className="flex bg-slate-800 border-b border-slate-700 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors whitespace-nowrap ${activeTab === 'roster' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          👷 Roster
        </button>
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors whitespace-nowrap ${activeTab === 'assignments' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          {t.dashboard.tabs.assignments}
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors whitespace-nowrap ${activeTab === 'properties' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          {t.dashboard.tabs.properties}
        </button>
        <button 
          onClick={() => setActiveTab('pastprojects')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors whitespace-nowrap ${activeTab === 'pastprojects' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          {t.dashboard.tabs.pastProjects}
        </button>
        <button 
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors whitespace-nowrap ${activeTab === 'directory' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          📁 {directoryTabLabel}
        </button>
      </div>

      <main className="max-w-[1100px] mx-auto p-6">
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