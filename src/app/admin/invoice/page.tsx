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

      <main className="max-w-[1100px] mx-auto p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-yellow-400">
              <tr>
                {["Submitted", "Contractor", "Phone", "Email", "Property", "Work", "Start", "Finish", "Agreed", "Requested", "Status", "Files"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>
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
                    <td className="whitespace-nowrap px-3 py-2">{fmt(i.createdAt)}</td>
                    <td className="px-3 py-2">{i.subcontractor.name}</td>
                    <td className="whitespace-nowrap px-3 py-2">{i.subcontractor.whatsappNumber}</td>
                    <td className="px-3 py-2">{i.subcontractor.email ?? "—"}</td>
                    <td className="px-3 py-2">{i.property.address}</td>
                    <td className="max-w-xs px-3 py-2">{i.workDescription ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{fmt(i.startDate)}</td>
                    <td className="whitespace-nowrap px-3 py-2">{fmt(i.finishDate)}</td>
                    <td className="px-3 py-2">{usd(i.agreedAmount)}</td>
                    <td className="px-3 py-2">{usd(i.requestedAmount)}</td>
                    <td className="px-3 py-2">{i.status}</td>
                    <td className="px-3 py-2">
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
    </div>
  );
}
