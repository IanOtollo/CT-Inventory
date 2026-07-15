"use client";

import { Search, Filter, History } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import CustomSelect from "@/components/CustomSelect";

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [userFilter, setUserFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  
  const departments = useQuery(api.departments.list) || [];

  const auditLogs = useQuery(api.audit.list, { 
    searchTerm: searchTerm || undefined,
    actionFilter: actionFilter || undefined,
    sortOrder,
    userFilter: userFilter || undefined,
    departmentFilter: departmentFilter || undefined
  }) || [];

  const actions = ["All", "LOGIN", "CREATE_ASSET", "ASSIGN_ASSET", "RETURN_ASSET", "CREATE_EMPLOYEE"];

  const renderActionLabel = (action: string) => {
    if (action === "All") return "All Actions";
    return action.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">System Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Immutable record of all system activities.</p>
        </div>
        <div className="flex space-x-2 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter size={16} className="mr-2 text-gray-400" /> Filters
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 top-12 mt-2 w-80 rounded-xl shadow-2xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[var(--color-busia-black)] uppercase tracking-wider">Advanced Filters</h3>
                <button onClick={() => {
                  setActionFilter("All");
                  setSortOrder("desc");
                  setUserFilter("");
                  setDepartmentFilter("All");
                }} className="text-xs text-[var(--color-busia-blue)] hover:underline font-medium">Clear All</button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Date Sort */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 z-50">Sort by Date</label>
                  <CustomSelect 
                    options={[
                      { value: "desc", label: "Newest First" },
                      { value: "asc", label: "Oldest First" }
                    ]}
                    value={sortOrder}
                    onChange={(val) => setSortOrder(val as "desc" | "asc")}
                    searchable={false}
                  />
                </div>

                {/* Filter by Action */}
                <div className="z-40">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Action</label>
                  <CustomSelect 
                    options={[
                      { value: "All", label: "All Actions" },
                      ...actions.filter(a => a !== "All").map(a => ({ value: a, label: renderActionLabel(a) }))
                    ]}
                    value={actionFilter}
                    onChange={(val) => setActionFilter(val)}
                    searchable={false}
                  />
                </div>

                {/* Filter by Department */}
                <div className="z-30">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Department</label>
                  <CustomSelect 
                    options={[
                      { value: "All", label: "All Departments" },
                      { value: "System", label: "System (Admin)" },
                      ...departments.map(d => ({ value: d.code, label: `${d.name} (${d.code})` }))
                    ]}
                    value={departmentFilter}
                    onChange={(val) => setDepartmentFilter(val)}
                    searchable={true}
                  />
                </div>

                {/* Filter by User */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by User</label>
                  <input 
                    type="text" 
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    placeholder="Enter user name or ID..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setIsFilterOpen(false)} className="px-4 py-2 bg-[var(--color-busia-blue)] text-white text-sm font-medium rounded shadow-sm hover:bg-blue-900 transition-colors w-full">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by entity ID, action, or user..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-busia-black)] focus:border-[var(--color-busia-black)] sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <History size={14} className="mr-1.5 text-gray-400" />
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 mono-text">
                    {log.entityId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {log.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.details}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500 italic">No audit records match the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
