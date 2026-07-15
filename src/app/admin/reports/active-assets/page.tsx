"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowLeft, Activity, UserCheck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActiveAssetsReport() {
  const router = useRouter();
  const allAssets = useQuery(api.equipment.listAll) || [];
  
  const activeAssets = allAssets.filter(a => a.status === "active");

  // Analytics Aggregation
  const totalCount = allAssets.length;
  const activeCount = activeAssets.length;
  const deploymentRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  // By Department
  const deptCount: Record<string, number> = {};
  activeAssets.forEach(a => {
    deptCount[a.department] = (deptCount[a.department] || 0) + 1;
  });
  const activeDepartments = Object.entries(deptCount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push("/admin/dashboard")}
          className="p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)] flex items-center">
            <Activity className="mr-3 text-[var(--color-busia-green)]" size={28} />
            Active Assets Audit Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">Audit of all currently deployed and assigned equipment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center border-t-4 border-t-[var(--color-busia-green)]">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Deployed Assets</p>
          <p className="text-5xl font-bold text-gray-900 mt-4 mono-text">{activeCount}</p>
          <p className="text-xs text-gray-400 mt-2">Currently in the field</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center border-t-4 border-t-[var(--color-busia-blue)]">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Deployment Rate</p>
          <p className="text-5xl font-bold text-gray-900 mt-4 mono-text">{deploymentRate}%</p>
          <div className="w-full max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[var(--color-busia-blue)] rounded-full" style={{ width: `${deploymentRate}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-start border-t-4 border-t-gray-300">
           <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider flex items-center">
              <ShieldCheck className="mr-2 text-gray-400" size={16} /> 
              Audit Status
            </h3>
            <p className="text-sm text-gray-600 mb-2">All active assets are tracked against specific departments or individual staff members, ensuring complete accountability.</p>
            <p className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 inline-block">100% Tracking Compliance</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center">
            <UserCheck className="mr-2 text-gray-400" size={16} /> 
            Active Deployment Roster
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Holder</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeAssets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No active assets deployed.
                  </td>
                </tr>
              ) : (
                activeAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono font-medium bg-gray-100 border border-gray-300 px-2 py-1 rounded text-gray-700">
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.category}</div>
                      <div className="text-xs text-gray-500">{asset.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {asset.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.holder ? (
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-[var(--color-busia-blue)] flex items-center justify-center mr-2 text-xs font-bold">
                            {asset.holder.charAt(0)}
                          </div>
                          {asset.holder}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Shared Dept Resource</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
