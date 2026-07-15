"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Loader2, Tag } from "lucide-react";

export default function PortalDashboardPage() {
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    setDepartmentId(localStorage.getItem("ct_inventory_dept"));
    setAccountId(localStorage.getItem("ct_inventory_account_id"));
  }, []);

  const data = useQuery(api.departments.getDepartmentDashboardData, departmentId ? { id: departmentId as any } : "skip");
  const accountDetails = useQuery(api.accounts.getAccountDetails, accountId ? { accountId: accountId as any } : "skip");

  if (departmentId && data === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-busia-blue)]" />
      </div>
    );
  }

  const deptName = data?.department.name || "Department";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">{deptName} Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your department's inventory</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {accountDetails?.role === "procurement" && (
            <Link 
              href="/portal/equipment/new"
              className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-busia-blue)] hover:shadow-sm transition-all group"
            >
              <div className="p-3 bg-blue-50 text-[var(--color-busia-blue)] rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Tag size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">Register New Equipment</span>
            </Link>
          )}
        <Link href="/portal/equipment" className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-busia-blue)] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Assets</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </Link>
        <Link href="/portal/equipment" className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-busia-green)] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Assigned</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </Link>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-status-info)]">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">In Storage</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-status-warning)]">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">In Repair</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center italic mt-2">No assets recorded yet. System is ready and waiting.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Recent Assignments</h3>
          <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">No recent assignment history.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/portal/scan" className="block w-full text-center py-2 px-4 border border-[var(--color-busia-blue)] text-[var(--color-busia-blue)] rounded-md hover:bg-blue-50 transition-colors">
              Scan Asset Tag
            </a>
            {accountDetails?.role === "procurement" && (
              <a href="/portal/equipment/new" className="block w-full text-center py-2 px-4 bg-[var(--color-busia-green)] text-white rounded-md hover:bg-green-800 transition-colors">
                Register New Equipment
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
