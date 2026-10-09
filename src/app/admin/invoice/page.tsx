import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null) => (d ? d.toLocaleDateString("en-US") : "—");
const usd = (n: unknown) => `$${Number(n).toFixed(2)}`;

export default async function AdminInvoicePage() {
  const invoices = await prisma.invoicePayment.findMany({
    orderBy: { createdAt: "desc" },
    include: { subcontractor: true, property: { include: { media: true } } },
  });

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
            <h1 className="text-xl font-extrabold text-white">Invoice</h1>
            <p className="text-xs text-slate-400">{invoices.length} submissions</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
          ← Dashboard
        </Link>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 pb-28">
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 shadow-sm">
          <table className="w-full table-fixed text-left text-[11px] leading-tight">
            <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-yellow-400">
              <tr>
                {["Submitted", "Contractor", "Property", "Work", "Dates", "Amount", "Status", "Files"].map((h) => (
                  <th key={h} className="px-2 py-1.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {invoices.map((i) => {
                // ponytail: Media no enlaza con la factura; se infiere por propiedad + contratista.
                const files = i.property.media.filter((m) => m.uploadedBy === i.subcontractorId);
                const urls = [...new Set([i.invoiceUrl, ...files.map((m) => m.fileUrl)].filter(Boolean))] as string[];
                return (
                  <tr key={i.id} className="align-top hover:bg-slate-700/30">
                    <td className="px-2 py-1.5">{fmt(i.createdAt)}</td>
                    <td className="break-words px-2 py-1.5">
                      {i.subcontractor.name}
                      <div className="text-slate-400">{i.subcontractor.whatsappNumber}</div>
                      <div className="break-all text-slate-400">{i.subcontractor.email}</div>
                    </td>
                    <td className="break-words px-2 py-1.5">{i.property.address}</td>
                    <td className="break-words px-2 py-1.5">{i.workDescription ?? "—"}</td>
                    <td className="px-2 py-1.5">{fmt(i.startDate)} → {fmt(i.finishDate)}</td>
                    <td className="px-2 py-1.5">
                      {usd(i.requestedAmount)}
                      <div className="text-slate-400">agreed {usd(i.agreedAmount)}</div>
                    </td>
                    <td className="px-2 py-1.5">{i.status}</td>
                    <td className="px-2 py-1.5">
                      {urls.length === 0 ? "—" : (
                        <details>
                          <summary className="cursor-pointer rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-slate-900">
                            Files ({urls.length})
                          </summary>
                          <ul className="mt-2 space-y-1">
                            {urls.map((u, n) => (
                              <li key={u}><a href={u} target="_blank" rel="noreferrer" className="text-blue-400 underline">File {n + 1}</a></li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 shadow-2xl">
        <div className="w-full p-3 flex gap-3 overflow-x-auto md:justify-center items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[["roster", "Roster"], ["assignments", "🔨 Assignments"], ["properties", "🏠 Properties"], ["pastprojects", "📋 Past Projects"], ["directory", "Directory"]].map(([tab, label]) => (
            <Link key={tab} href={`/admin/dashboard?tab=${tab}`} className="px-5 py-2.5 text-[13px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 bg-slate-800 border border-slate-700 text-slate-300 hover:border-yellow-400 shadow-sm">
              {label}
            </Link>
          ))}
          <span className="px-5 py-2.5 text-[13px] font-bold rounded-full whitespace-nowrap shrink-0 bg-yellow-400 text-slate-900 shadow-md">Invoice</span>
        </div>
      </div>
    </div>
  );
}
