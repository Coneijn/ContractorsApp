// app/audit-logs/page.tsx
import { prisma } from "@/lib/prisma";
import { ActorType, Prisma } from "@prisma/client";
import { AuditLogsClient } from "./audit-logs-client";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    actorType?: string;
    propertyId?: string;
    search?: string;
  }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 15;

  const actorTypeFilter = Object.values(ActorType).includes(params.actorType as ActorType)
    ? (params.actorType as ActorType)
    : undefined;

  const whereClause: Prisma.ActivityLogWhereInput = {
    ...(actorTypeFilter && { actorType: actorTypeFilter }),
    ...(params.propertyId && { propertyId: params.propertyId }),
    ...(params.search && {
      OR: [
        { action: { contains: params.search, mode: "insensitive" } },
        { actorName: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ],
    }),
  };

  const [logs, totalCount, properties] = await Promise.all([
    prisma.activityLog.findMany({
      where: whereClause,
      include: {
        property: {
          select: { id: true, address: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityLog.count({ where: whereClause }),
    prisma.property.findMany({
      select: { id: true, address: true },
      orderBy: { address: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Registro de Auditoría y Actividad
          </h1>
          <p className="text-sm text-slate-400">
            Trazabilidad en tiempo real de acciones ejecutadas por Usuarios, Contratistas e IA.
          </p>
        </div>

        <AuditLogsClient
          logs={logs}
          properties={properties}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentFilters={{
            actorType: params.actorType || "",
            propertyId: params.propertyId || "",
            search: params.search || "",
          }}
        />
      </div>
    </main>
  );
}