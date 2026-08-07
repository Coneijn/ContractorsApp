"use client"; // Necesario porque vamos a usar interactividad (clics en las pestañas)
import { useState } from 'react';
import ContractorCard from '@/components/ContractorCard'; 
import PropertyCard from '@/components/PropertyCard';
import Badge from '@/components/Badge';

export default function DashboardPage() {
  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      
      {/* Header (Encabezado) */}
      <header className="bg-slate-800 p-5 border-b-2 border-yellow-400 flex items-center gap-4">
        <img 
          src="https://image-cdn.carrot.com/uploads/sites/81361/2025/02/image-1.png" 
          alt="Spencer" 
          className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400"
        />
        <div>
          <h1 className="text-xl font-extrabold text-white">Contractor Dashboard</h1>
          <p className="text-xs text-slate-400">SpencerBuysHouses.com · Reconstrucción Next.js</p>
        </div>
      </header>

      {/* Pestañas (Tabs) - Solo Admin Dashboard para Leslie / Spencer */}
      <div className="flex bg-slate-800 border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors ${activeTab === 'assignments' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          🔨 Assignments
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors ${activeTab === 'properties' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          🏠 Properties
        </button>
        <button 
          onClick={() => setActiveTab('pastprojects')}
          className={`px-6 py-3 text-[13px] font-semibold border-b-4 transition-colors ${activeTab === 'pastprojects' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
        >
          📋 Past Projects
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-[1100px] mx-auto p-6">
        
        {/* Contenido de la pestaña Roster */}
        {activeTab === 'roster' && (
          <div>
            {/* Barra de Filtros (Solo visual por ahora) */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button className="px-4 py-1.5 rounded-full border border-yellow-400 bg-yellow-400 text-slate-900 text-xs font-semibold">✅ Approved / Used</button>
              <button className="px-4 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-400 text-xs font-semibold hover:border-yellow-400 hover:text-yellow-400 transition">🔍 Haven't Used Yet</button>
            </div>

            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-3 pb-2 border-b border-slate-800">
              Active / Approved Contractors
            </h2>

            {/* Cuadrícula (Grid) de Contratistas llamando al componente */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ContractorCard 
                name="Mario" 
                company="4JL Remodeling" 
                phone="(901) 821-1502" 
                area="Memphis, TN" 
                hasW9={false} 
              />
              <ContractorCard 
                name="Tania" 
                phone="(706) 461-4750" 
                area="Memphis area" 
                hasW9={false} 
              />
              <ContractorCard 
                name="Luis Felipe Hernandez" 
                phone="(352) 284-9537" 
                area="Memphis area" 
                hasW9={false} 
              />
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Assignments (Para programar después) */}
        {activeTab === 'assignments' && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
              Currently Active
            </h2>

            {/* Bloque: Mario / 4JL */}
            <div className="mb-6">
              {/* Encabezado del Contratista */}
              <div className="flex items-center gap-2 mb-3 p-3 bg-slate-800 rounded-lg border-l-4 border-yellow-400">
                <div className="text-[14px] font-extrabold text-yellow-400">Mario / 4JL</div>
                <div className="text-[12px] text-slate-400">(901) 821-1502</div>
              </div>
              
              {/* Sus Propiedades Asignadas */}
              <PropertyCard 
                propertyName="375 Sherburne" 
                notes="Interior complete Aug 4 · exterior TBD" 
                status="in-progress" 
              />
              <PropertyCard 
                propertyName="10026 Loftin Dr, Olive Branch" 
                notes="Final quote pending — after Sherburne wraps" 
                status="pending" 
              />
            </div>

            {/* Bloque: Propiedades sin asignar */}
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 mt-8 pb-2 border-b border-slate-800">
              Needs Contractor — Unassigned
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <PropertyCard 
                propertyName="6851 Stevenwoods Ave" 
                notes="11-item scope · bids pending" 
                status="unassigned" 
              />
              <PropertyCard 
                propertyName="7274 McVay Rd, Germantown" 
                notes="$66,500 budget · roof, paint, floors, baths, fixtures" 
                status="unassigned" 
              />
            </div>

          </div>
        )}

        {/* Contenido de la pestaña Properties */}
        {activeTab === 'properties' && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
              Currently Being Worked On
            </h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Property</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Contractor</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Status</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                    <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">375 Sherburne</a></td>
                    <td className="p-3">Mario / 4JL</td>
                    <td className="p-3"><Badge type="in-progress" text="🔨 In Progress" /></td>
                    <td className="p-3">TBD</td>
                  </tr>
                  <tr className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                    <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">8072 Bensford Ln</a></td>
                    <td className="p-3">Tania</td>
                    <td className="p-3"><Badge type="scheduled" text="📋 Scheduled" /></td>
                    <td className="p-3">$4,500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
              Needs Contractor — Unassigned
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Property</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Notes</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                    <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">6851 Stevenwoods Ave</a></td>
                    <td className="p-3 text-slate-400">11-item scope · bids pending</td>
                    <td className="p-3"><Badge type="unassigned" text="⚠️ Unassigned" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Past Projects */}
        {activeTab === 'pastprojects' && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
              Completed Jobs
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Property</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Contractor</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Scope</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Amount</th>
                    <th className="bg-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-[1px] p-3 border-b border-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                    <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">1566 Arcadia St</a></td>
                    <td className="p-3">Tania</td>
                    <td className="p-3 text-slate-400">Paint, carpet removal, cabinet work</td>
                    <td className="p-3 font-bold">TBD</td>
                    <td className="p-3">Aug 4, 2026</td>
                  </tr>
                  <tr className="hover:bg-slate-800 border-b border-slate-800 transition-colors">
                    <td className="p-3"><a href="#" className="text-yellow-400 hover:underline font-bold">9059 Cairn Ridge Dr</a></td>
                    <td className="p-3">Mario / 4JL</td>
                    <td className="p-3 text-slate-400">Flooring + full interior paint</td>
                    <td className="p-3 font-bold text-yellow-400">$16,257</td>
                    <td className="p-3">2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}