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
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-2xl font-bold text-white">Invoices ({invoices.length})</h1>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-xs uppercase text-slate-400">
              <tr>
                {["Submitted", "Contractor", "Phone", "Email", "Property", "Work", "Start", "Finish", "Agreed", "Requested", "Status", "Files"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((i) => {
                // ponytail: Media no enlaza con la factura; se infiere por propiedad + contratista.
                const files = i.property.media.filter((m) => m.uploadedBy === i.subcontractorId);
                const urls = [...new Set([i.invoiceUrl, ...files.map((m) => m.fileUrl)].filter(Boolean))] as string[];
                return (
                  <tr key={i.id} className="align-top hover:bg-slate-900">
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
      </div>
    </main>
  );
}
