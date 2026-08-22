// app/audit-logs/audit-logs-client.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ActorType } from "@prisma/client";
import {
  Bot,
  User,
  HardHat,
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

type LogItem = {
  id: string;
  propertyId: string;
  actorType: ActorType;
  actorName: string;
  action: string;
  description: string;
  createdAt: Date;
  property: {
    id: string;
    address: string;
  };
};

type PropertyOption = {
  id: string;
  address: string;
};

interface Props {
  logs: LogItem[];
  properties: PropertyOption[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  currentFilters: {
    actorType: string;
    propertyId: string;
    search: string;
  };
}

export function AuditLogsClient({
  logs,
  properties,
  currentPage,
  totalPages,
  totalCount,
  currentFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Resetear a pág 1 al cambiar filtros

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const getActorBadge = (type: ActorType) => {
    switch (type) {
      case ActorType.AI:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
            <Bot className="h-3.5 w-3.5" /> IA (Lucy 2.0)
          </span>
        );
      case ActorType.SUBCONTRACTOR:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
            <HardHat className="h-3.5 w-3.5" /> Subcontratista
          </span>
        );
      case ActorType.USER:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
            <User className="h-3.5 w-3.5" /> Usuario
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por acción, actor o texto..."
            defaultValue={currentFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filtro ActorType */}
        <select
          value={currentFilters.actorType}
          onChange={(e) => handleFilterChange("actorType", e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Todos los Actores</option>
          <option value={ActorType.AI}>IA</option>
          <option value={ActorType.SUBCONTRACTOR}>Subcontratista</option>
          <option value={ActorType.USER}>Usuario</option>
        </select>

        {/* Filtro Propiedad */}
        <select
          value={currentFilters.propertyId}
          onChange={(e) => handleFilterChange("propertyId", e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Todas las Propiedades</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>

        {/* Contador Total */}
        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 px-4 py-2 text-sm text-slate-400">
          <span>Registros:</span>
          <span className="font-semibold text-slate-200">{totalCount}</span>
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className={`overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 ${isPending ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Fecha / Hora</th>
                <th className="px-4 py-3.5 font-semibold">Actor</th>
                <th className="px-4 py-3.5 font-semibold">Acción</th>
                <th className="px-4 py-3.5 font-semibold">Propiedad</th>
                <th className="px-4 py-3.5 font-semibold">Descripción del Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No se encontraron registros de auditoría con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {new Date(log.createdAt).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="space-y-1">
                        <div>{getActorBadge(log.actorType)}</div>
                        <div className="text-xs font-medium text-slate-200 pl-1">{log.actorName}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-xs font-semibold text-slate-200 border border-slate-700">
                        <ShieldCheck className="h-3 w-3 text-indigo-400" />
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span className="max-w-[200px] truncate">{log.property.address}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-slate-300">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
            <span className="text-xs text-slate-400">
              Página <span className="font-semibold text-slate-200">{currentPage}</span> de{" "}
              <span className="font-semibold text-slate-200">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => handlePageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Anterior
              </button>
              <button
                disabled={currentPage >= totalPages || isPending}
                onClick={() => handlePageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                Siguiente <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}