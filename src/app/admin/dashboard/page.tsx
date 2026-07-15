"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ExternalLink } from "lucide-react";

export default function AdminDashboardPage() {
  const assets = useQuery(api.equipment.listAll) || [];
  
  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === "active").length;
  const inRepair = assets.filter((a) => a.condition === "faulty" || a.condition === "poor").length; // Rough estimation for dashboard
  const retired = assets.filter((a) => a.status === "retired").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">System Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">County-wide inventory overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/admin/reports/total-assets" className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-busia-blue)] hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Assets</h3>
            <ExternalLink size={16} className="text-gray-300 group-hover:text-[var(--color-busia-blue)] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 mt-1 sm:mt-2 mono-text">{totalAssets}</p>
        </Link>
        <Link href="/admin/reports/active-assets" className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-busia-green)] hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Active Assets</h3>
            <ExternalLink size={16} className="text-gray-300 group-hover:text-[var(--color-busia-green)] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 mt-1 sm:mt-2 mono-text">{activeAssets}</p>
        </Link>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-status-warning)]">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">In Repair / Poor</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 mt-1 sm:mt-2 mono-text">{inRepair}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-gray-400">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Retired</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 mt-1 sm:mt-2 mono-text">{retired}</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 text-center italic mt-2">No assets recorded yet. System is ready and waiting.</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Needs Attention</h3>
        <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-sm text-gray-500">No assets currently flagged for extended repair or faulty condition.</p>
        </div>
      </div>
    </div>
  );
}
