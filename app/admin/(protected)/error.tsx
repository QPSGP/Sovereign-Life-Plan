"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Admin</h1>
        <div className="p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm space-y-3">
          <p className="font-medium">Something went wrong</p>
          <p>Run &quot;DB push and seed&quot; so the database has all tables (subscription_plans, members, member_categories, orders, expenditures, chores, etc.).</p>
          <p>
            <Link href="/api/db-status" target="_blank" rel="noopener noreferrer" className="underline">Open /api/db-status</Link> to see the exact error.
          </p>
          <button type="button" onClick={() => reset()} className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600">
            Try again
          </button>
        </div>
        <p className="mt-4">
          <Link href="/admin/login" className="text-neutral-400 hover:text-white text-sm">← Admin login</Link>
        </p>
      </div>
    </main>
  );
}
