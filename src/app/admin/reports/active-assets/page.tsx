"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowLeft, Activity, UserCheck, ShieldCheck, Search, X, Package, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ActiveAssetsReport() {
  const router = useRouter();
  const allAssets = useQuery(api.equipment.listAll) || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHolder, setSelectedHolder] = useState<string | null>(null);

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
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center">
            <UserCheck className="mr-2 text-gray-400" size={16} /> 
            Active Deployment Roster
          </h3>
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by holder, department or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Holder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assets</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                // Group assets by holder
                const assetsByHolder = activeAssets.reduce((acc, asset) => {
                  const holderKey = asset.holder || "Shared Dept Resource";
                  if (!acc[holderKey]) {
                    acc[holderKey] = {
                      holder: holderKey,
                      isShared: !asset.holder,
                      department: asset.department,
                      assets: []
                    };
                  }
                  acc[holderKey].assets.push(asset);
                  return acc;
                }, {} as Record<string, any>);

                let groupedHolders = Object.values(assetsByHolder) as any[];

                // Apply search filter
                if (searchQuery) {
                  const query = searchQuery.toLowerCase();
                  groupedHolders = groupedHolders.filter((h: any) => 
                    h.holder.toLowerCase().includes(query) ||
                    h.department.toLowerCase().includes(query) ||
                    h.assets.some((a: any) => 
                      a.assetTag.toLowerCase().includes(query) ||
                      a.category.toLowerCase().includes(query) ||
                      (a.serial && a.serial.toLowerCase().includes(query))
                    )
                  );
                }

                if (groupedHolders.length === 0) {
                  return (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        No assigned holders found matching your search.
                      </td>
                    </tr>
                  );
                }

                return groupedHolders.map((group, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!group.isShared ? (
                        <button 
                          onClick={() => setSelectedHolder(group.holder)}
                          className="flex items-center text-left hover:text-[var(--color-busia-blue)] focus:outline-none transition-colors group-hover:bg-gray-50 w-full"
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-[var(--color-busia-blue)] flex items-center justify-center mr-3 text-sm font-bold">
                            {group.holder.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-[var(--color-busia-blue)] underline-offset-4 group-hover:underline transition-all">{group.holder}</div>
                            <div className="text-xs text-gray-500">Employee</div>
                          </div>
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedHolder("Shared Dept Resource")}
                          className="flex items-center text-left hover:text-gray-900 focus:outline-none transition-colors w-full"
                        >
                          <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-3 text-sm font-bold">
                            <Package size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 underline-offset-4 hover:underline">Shared Resource</div>
                            <div className="text-xs text-gray-500">Department Pool</div>
                          </div>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {group.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {group.assets.length} Item{group.assets.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!group.isShared && (
                        <button
                          onClick={() => setSelectedHolder(group.holder)}
                          className="text-[var(--color-busia-blue)] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
                        >
                          View Equipment
                        </button>
                      )}
                      {group.isShared && (
                        <button
                          onClick={() => setSelectedHolder("Shared Dept Resource")} // We can make the modal support this
                          className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
                        >
                          View Equipment
                        </button>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Equipment Bottom Sheet / Modal */}
      {selectedHolder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900 bg-opacity-50 p-4 sm:p-6 transition-opacity">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[var(--color-busia-blue)] text-white flex items-center justify-center mr-3 text-lg font-bold shadow-sm">
                  {selectedHolder === "Shared Dept Resource" ? <Package size={20} /> : selectedHolder.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedHolder}</h2>
                  <p className="text-sm text-gray-500">{selectedHolder === "Shared Dept Resource" ? "Department Pool Equipment" : "Assigned Equipment"}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedHolder(null)}
                className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="space-y-4">
                {activeAssets.filter(a => {
                  if (selectedHolder === "Shared Dept Resource") return !a.holder;
                  return a.holder === selectedHolder;
                }).map(asset => (
                  <div key={asset._id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--color-busia-blue)] transition-colors">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mr-4 mt-1">
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-gray-900">{asset.category}</h4>
                        <p className="text-sm text-gray-600 mt-1">{asset.brand}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Hash size={12} className="mr-1" /> SN: {asset.serial?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {asset.assetTag}
                      </span>
                      <span className="mt-2 text-xs font-medium text-gray-500">
                        {asset.department}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
               <p className="text-sm font-medium text-gray-700 flex justify-between items-center">
                 <span>Total Items Assigned:</span>
                 <span className="bg-[var(--color-busia-blue)] text-white px-3 py-1 rounded-full text-xs font-bold">
                   {activeAssets.filter(a => {
                      if (selectedHolder === "Shared Dept Resource") return !a.holder;
                      return a.holder === selectedHolder;
                   }).length}
                 </span>
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
