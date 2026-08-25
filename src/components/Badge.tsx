import React from 'react';

// Tipos basados en los enums de tu schema.prisma + flags auxiliares
export type BadgeType =
  // TaskStatus
  | 'PENDING_ESTIMATE'
  | 'ASSIGNED_OR_TO_DO'
  | 'IN_PROGRESS'
  | 'PENDING_INSPECTION_OR_QA'
  | 'INVOICE_SUBMITTED'
  | 'UNASSIGNED'
  | 'WON'
  | 'LOST'
  | 'OTHER'
  // PropertyStatus
  | 'RENOVATING'
  | 'COMPLETED'
  | 'SOLD'
  // EstimateStatus
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  // AgreementStatus
  | 'UNSIGNED'
  | 'SIGNED'
  // PaymentStatus
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  // SubcontractorStatus
  | 'ACTIVE'
  | 'INACTIVE'
  // Flags auxiliares
  | 'w9-yes'
  | 'w9-no'
  | string;

type BadgeProps = {
  type: BadgeType;
  text?: string;
};

// Formato amigable por defecto si no pasas la prop "text"
const formatLabel = (val: string): string =>
  val
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function Badge({ type, text }: BadgeProps) {
  const styles: Record<string, string> = {
    // --- Flags Auxiliares / W9 ---
    'w9-yes': 'bg-emerald-950 text-emerald-400 border border-emerald-800/50',
    'w9-no': 'bg-rose-950 text-rose-400 border border-rose-800/50',

    // --- TaskStatus ---
    UNASSIGNED: 'bg-rose-950 text-rose-400 border border-rose-800/50',
    PENDING_ESTIMATE: 'bg-amber-950 text-amber-400 border border-amber-800/50',
    ASSIGNED_OR_TO_DO: 'bg-blue-950 text-blue-400 border border-blue-800/50',
    IN_PROGRESS: 'bg-indigo-950 text-indigo-300 border border-indigo-800/50',
    PENDING_INSPECTION_OR_QA: 'bg-purple-950 text-purple-300 border border-purple-800/50',
    INVOICE_SUBMITTED: 'bg-cyan-950 text-cyan-300 border border-cyan-800/50',
    WON: 'bg-emerald-950 text-emerald-300 border border-emerald-700/50',
    LOST: 'bg-zinc-800 text-zinc-400 border border-zinc-700/50',
    OTHER: 'bg-slate-800 text-slate-400 border border-slate-700/50',

    // --- PropertyStatus ---
    RENOVATING: 'bg-amber-950 text-amber-400 border border-amber-800/50',
    COMPLETED: 'bg-emerald-900 text-emerald-200 border border-emerald-700/50',
    SOLD: 'bg-teal-900 text-teal-200 border border-teal-700/50',

    // --- EstimateStatus & AgreementStatus ---
    UNDER_REVIEW: 'bg-amber-950 text-amber-400 border border-amber-800/50',
    APPROVED: 'bg-emerald-950 text-emerald-300 border border-emerald-800/50',
    REJECTED: 'bg-rose-950 text-rose-400 border border-rose-800/50',
    UNSIGNED: 'bg-orange-950 text-orange-400 border border-orange-800/50',
    SIGNED: 'bg-emerald-950 text-emerald-300 border border-emerald-800/50',

    // --- PaymentStatus ---
    PENDING: 'bg-amber-950 text-amber-400 border border-amber-800/50',
    PARTIALLY_PAID: 'bg-sky-950 text-sky-300 border border-sky-800/50',
    PAID: 'bg-emerald-900 text-emerald-200 border border-emerald-700/50',

    // --- SubcontractorStatus ---
    ACTIVE: 'bg-emerald-950 text-emerald-400 border border-emerald-800/50',
    INACTIVE: 'bg-zinc-800 text-zinc-400 border border-zinc-700/50',
  };

  const badgeStyle =
    styles[type] || 'bg-slate-800 text-slate-300 border border-slate-700';

  const label = text || formatLabel(type);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap ${badgeStyle}`}
    >
      {label}
    </span>
  );
}