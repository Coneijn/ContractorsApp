import React, { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/Badge';
import StatusUpdateModal from '@/components/StatusUpdateModal';
import PropertyCard from '@/components/PropertyCard';
import { useLanguage } from '@/context/LanguageContext';

type AssignmentsTabProps = {
  properties: any[];
  onUpdate: () => void;
  onAssign?: (propId: string, contractorId?: string, desc?: string) => void;
};

export default function AssignmentsTab({ properties, onUpdate, onAssign }: AssignmentsTabProps) {
  const { t } = useLanguage();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // 1. Filtramos solo las propiedades que están activas (en obra)
  const activeProperties = properties.filter(p => p.status === 'RENOVATING');

  // 2. Separamos en asignadas (agrupadas por contratista) y tareas no asignadas
  const assignedGroups: Record<string, { contractor: any, properties: any[] }> = {};
  const unassignedTasks: { prop: any, task: any }[] = [];
  const completedStatuses = ['WON', 'INVOICE_SUBMITTED', 'PENDING_INSPECTION_OR_QA', 'LOST'];

  activeProperties.forEach(prop => {
    // Si la propiedad no tiene tareas en absoluto
    if (!prop.tasks || prop.tasks.length === 0) {
      unassignedTasks.push({ prop, task: null });
      return;
    }

    prop.tasks.forEach((task: any) => {
      // Ignoramos tareas terminadas o canceladas (ya viven en Past Projects)
      if (completedStatuses.includes(task.status)) return;

      if (task.subcontractor) {
        const subId = task.subcontractor.id;
        // Si el contratista no existe en nuestro grupo, lo inicializamos
        if (!assignedGroups[subId]) {
          assignedGroups[subId] = { contractor: task.subcontractor, properties: [] };
        }
        // Agregamos la propiedad y su tarea a la lista de este contratista
        assignedGroups[subId].properties.push({ prop, task });
      } else {
        // Tarea explícitamente sin asignar
        unassignedTasks.push({ prop, task });
      }
    });
  });

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
        {t.dashboard.assignments.title}
      </h2>

{/* RENDER 1: Lista de Tarjetas agrupadas por contratista (1 columna) */}
      <div className="flex flex-col gap-6">
        {Object.values(assignedGroups).map(group => (
          <div key={group.contractor.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-600 transition">
            
            {/* Header de la Tarjeta del Contratista */}
            <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-extrabold text-yellow-400 truncate">
                  {group.contractor.name} {group.contractor.company ? `/ ${group.contractor.company}` : ''}
                </div>
                <div className="text-[12px] text-slate-400 mt-0.5">{group.contractor.whatsappNumber}</div>
              </div>
              {onAssign && (
                <button
                  onClick={() => onAssign('', group.contractor.id, '')}
                  className="bg-slate-700 hover:bg-slate-600 text-yellow-400 text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap shrink-0"
                >
                  {(t as any).dashboard?.buttons?.newTask || '+ New Task'}
                </button>
              )}
            </div>
            
            {/* Lista de Propiedades dentro de la tarjeta (Vista Modular en 2 Columnas) */}
            <div className="p-4 bg-slate-800/30 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.properties.map(({ prop, task }) => {
                let visualStatus = 'queued';
                let priceLabel = undefined;
                
                const estimate = prop.estimates?.find((e: any) => e.subcontractorId === group.contractor.id);
                
                if (task.status === 'WON' || task.status === 'PENDING_INSPECTION_OR_QA' || task.status === 'INVOICE_SUBMITTED') {
                  visualStatus = 'completed';
                } else if (task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED_OR_TO_DO') {
                  visualStatus = 'in-progress'; 
                } else if (estimate) {
                  if (estimate.status === 'APPROVED') {
                    visualStatus = 'scheduled';
                    priceLabel = `$${Number(estimate.amount).toLocaleString('en-US')}`;
                  } else if (estimate.status === 'UNDER_REVIEW') {
                    visualStatus = 'pending';
                    priceLabel = `$${Number(estimate.amount).toLocaleString('en-US')}`;
                  }
                }

                const borderColors: Record<string, string> = {
                  'in-progress': 'border-l-green-500',
                  'scheduled': 'border-l-yellow-400',
                  'pending': 'border-l-orange-500',
                  'queued': 'border-l-blue-500',
                  'unassigned': 'border-l-red-500',
                  'completed': 'border-l-green-600',
                };
                const badgeLabels: Record<string, string> = {
                  'in-progress': t.badges.inProgress,
                  'scheduled': `${t.badges.scheduled} ${priceLabel ? `- ${priceLabel}` : ''}`,
                  'pending': t.badges.pending,
                  'queued': t.badges.queued,
                  'unassigned': t.badges.unassigned,
                  'completed': (t as any).propertyCard?.statusCompleted || 'Complete',
                };

                return (
                  <div key={`${prop.id}-${task.id}`} className={`bg-slate-900/60 rounded-xl p-4 border border-slate-700 border-l-4 ${borderColors[visualStatus]} shadow-sm hover:border-slate-500 transition flex flex-col justify-between gap-3`}>
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/admin/property/${prop.id}`} className="text-yellow-400 hover:underline font-extrabold text-[14px] leading-tight">
                        {prop.address}
                      </Link>
                      <Badge type={visualStatus as any} text={badgeLabels[visualStatus]} />
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-300 bg-slate-800 p-2.5 rounded-lg border border-slate-700 min-h-[44px]">
                        {task.description || "Sin descripcion"}
                      </div>
                    </div>
                    <div className="mt-1 pt-3 border-t border-slate-700/50 flex justify-end gap-2">
                      {onAssign && (
                        <button 
                          onClick={() => onAssign(prop.id, group.contractor.id, task.description)}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                        >
                          {(t as any).common?.assign || '+ Assign'}
                        </button>
                      )}
                      <button 
                        onClick={() => setEditingTaskId(task.id)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                      >
                        {(t as any).common?.editStage || 'Edit Stage'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* RENDER 2: Seccion de propiedades sin asignar con Grid de columnas (.ugrid) */}
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800 mt-8">
        {t.dashboard.properties.unassigned}
      </h2>
      
      {/* Aquí implementamos las columnas responsivas (1 en celular, 2 dividida, 3 pantalla completa) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {unassignedTasks.map(({ prop, task }) => (
          <PropertyCard 
            key={`${prop.id}-${task?.id || 'empty'}`}
            taskId={task?.id}
            propertyId={prop.id}
            propertyName={prop.address} 
            notes={task?.description || "Scope TBD"} 
            status="unassigned" 
            onUpdate={onUpdate}
            onAssign={(propId, desc) => onAssign && onAssign(propId, undefined, desc)}
          />
        ))}
      </div>
      
      {editingTaskId && (
        <StatusUpdateModal 
          taskId={editingTaskId}
          isOpen={!!editingTaskId}
          onClose={() => setEditingTaskId(null)}
          onSuccess={() => {
            setEditingTaskId(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}