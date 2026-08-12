import React from 'react';
import PropertyCard from '@/components/PropertyCard';
import { useLanguage } from '@/context/LanguageContext';

type AssignmentsTabProps = {
  properties: any[];
  onUpdate: () => void;
};

export default function AssignmentsTab({ properties, onUpdate }: AssignmentsTabProps) {
  const { t } = useLanguage();

  // 1. Filtramos solo las propiedades que están activas (en obra)
  const activeProperties = properties.filter(p => p.status === 'RENOVATING');

  // 2. Separamos en asignadas (agrupadas por contratista) y no asignadas
  const assignedGroups: Record<string, { contractor: any, properties: any[] }> = {};
  const unassignedProperties: any[] = [];

  activeProperties.forEach(prop => {
    // Verificamos si la propiedad tiene al menos una tarea con contratista asignado
    const hasAssignedTask = prop.tasks.some((t: any) => t.subcontractor);
    
    if (!hasAssignedTask) {
      unassignedProperties.push(prop);
    } else {
      prop.tasks.forEach((task: any) => {
        if (task.subcontractor) {
          const subId = task.subcontractor.id;
          // Si el contratista no existe en nuestro grupo, lo inicializamos
          if (!assignedGroups[subId]) {
            assignedGroups[subId] = { contractor: task.subcontractor, properties: [] };
          }
          // Agregamos la propiedad y su tarea a la lista de este contratista
          assignedGroups[subId].properties.push({ prop, task });
        }
      });
    }
  });

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
        {t.dashboard.assignments.title}
      </h2>

      {/* RENDER 1: Bloques agrupados por contratista (Copiando el estilo original .ablock) */}
      {Object.values(assignedGroups).map(group => (
        <div key={group.contractor.id} className="mb-6">
          
          {/* Header del Contratista (.a-header) */}
          <div className="flex items-center gap-2 mb-2 p-2.5 bg-slate-800 rounded-lg border-l-4 border-yellow-400">
            <div>
              <div className="text-[14px] font-extrabold text-yellow-400">
                {group.contractor.name} {group.contractor.company ? `/ ${group.contractor.company}` : ''}
              </div>
              <div className="text-[12px] text-slate-400">{group.contractor.whatsappNumber}</div>
            </div>
          </div>

          {/* Propiedades asignadas a este contratista */}
          {group.properties.map(({ prop, task }) => {
            
            // Lógica para recuperar la variedad de estatus visuales del HTML original
            let visualStatus = 'queued'; // Si hay tarea pero no hay presupuesto, está "En cola" (⏳)
            let priceLabel = undefined;
            
            // Buscamos si hay un presupuesto (estimate) para este contratista en esta propiedad
            const estimate = prop.estimates?.find((e: any) => e.subcontractorId === group.contractor.id);

            if (task.status === 'IN_PROGRESS') {
              visualStatus = 'in-progress'; // (🔨)
            } else if (estimate) {
              if (estimate.status === 'APPROVED') {
                visualStatus = 'scheduled'; // (📋)
                priceLabel = `$${Number(estimate.amount).toLocaleString('en-US')}`;
              } else if (estimate.status === 'UNDER_REVIEW') {
                visualStatus = 'pending'; // Quote Pending / Bid Received (💬)
                priceLabel = `$${Number(estimate.amount).toLocaleString('en-US')}`;
              }
            }

            return (
              <PropertyCard 
                key={`${prop.id}-${task.id}`}
                taskId={task.id}
                propertyId={prop.id}
                propertyName={prop.address} 
                notes={task.description || "Sin descripción"} 
                status={visualStatus as any} 
                price={priceLabel}
                onUpdate={onUpdate}
              />
            );
          })}
        </div>
      ))}

      {/* RENDER 2: Sección de propiedades sin asignar con Grid de columnas (.ugrid) */}
      <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500 mb-4 pb-2 border-b border-slate-800 mt-8">
        {t.dashboard.properties.unassigned}
      </h2>
      
      {/* Aquí implementamos las columnas responsivas (1 en celular, 2 dividida, 3 pantalla completa) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {unassignedProperties.map(prop => {
          const task = prop.tasks[0];
          return (
            <PropertyCard 
              key={prop.id}
              taskId={task?.id}
              propertyId={prop.id}
              propertyName={prop.address} 
              notes={task?.description || "Scope TBD"} 
              status="unassigned" 
              onUpdate={onUpdate}
            />
          );
        })}
      </div>
    </div>
  );
}