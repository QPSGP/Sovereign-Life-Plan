import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        <section className="space-y-4">
          <div className="rounded bg-neutral-900 p-4">
            <h2 className="font-medium text-neutral-300 mb-2">Members (PERSONAL / MARKEVNT-style)</h2>
            <p className="text-neutral-500 text-sm mb-2">Export all members with contact info and categories as CSV.</p>
            <a href="/api/reports/members" className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Download members.csv</a>
          </div>
          <div className="rounded bg-neutral-900 p-4">
            <h2 className="font-medium text-neutral-300 mb-2">Transactions (TRANSCOL-style)</h2>
            <p className="text-neutral-500 text-sm mb-2">Export invoices and payment balances as CSV.</p>
            <a href="/api/reports/transactions" className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Download transactions.csv</a>
          </div>
        </section>
      </div>
    </main>
  );
}
