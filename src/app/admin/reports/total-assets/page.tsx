"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowLeft, BarChart3, Package, CheckCircle2, AlertTriangle, Monitor, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TotalAssetsReport() {
  const router = useRouter();
  const assets = useQuery(api.equipment.listAll) || [];

  // Analytics Aggregation
  const totalCount = assets.length;
  
  // By Condition
  const conditionCount = {
    good: assets.filter(a => a.condition === "good").length,
    fair: assets.filter(a => a.condition === "fair").length,
    poor: assets.filter(a => a.condition === "poor").length,
    faulty: assets.filter(a => a.condition === "faulty").length,
  };

  // By Department
  const deptCount: Record<string, number> = {};
  assets.forEach(a => {
    deptCount[a.department] = (deptCount[a.department] || 0) + 1;
  });
  const topDepartments = Object.entries(deptCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // By Category
  const catCount: Record<string, number> = {};
  assets.forEach(a => {
    catCount[a.category] = (catCount[a.category] || 0) + 1;
  });
  const topCategories = Object.entries(catCount).sort((a, b) => b[1] - a[1]);

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
            <Package className="mr-3 text-[var(--color-busia-blue)]" size={28} />
            Total Assets Audit Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive breakdown of all registered county inventory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center col-span-1 border-t-4 border-t-[var(--color-busia-blue)]">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Volume</p>
          <p className="text-5xl font-bold text-gray-900 mt-4 mono-text">{totalCount}</p>
          <p className="text-xs text-gray-400 mt-2">Registered Assets</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-1 md:col-span-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">Condition Audit</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
              <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-green-700">{conditionCount.good}</p>
              <p className="text-xs font-medium text-green-600 uppercase">Good</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <CheckCircle2 className="mx-auto text-[var(--color-busia-blue)] mb-2" size={24} />
              <p className="text-2xl font-bold text-[var(--color-busia-blue)]">{conditionCount.fair}</p>
              <p className="text-xs font-medium text-blue-600 uppercase">Fair</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
              <AlertTriangle className="mx-auto text-yellow-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-yellow-700">{conditionCount.poor}</p>
              <p className="text-xs font-medium text-yellow-600 uppercase">Poor</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
              <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-red-700">{conditionCount.faulty}</p>
              <p className="text-xs font-medium text-red-600 uppercase">Faulty</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center">
              <Users className="mr-2 text-gray-400" size={16} /> 
              Top Departments by Volume
            </h3>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {topDepartments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No data available.</div>
            ) : (
              topDepartments.map(([dept, count], idx) => (
                <li key={dept} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="w-6 text-center text-xs font-bold text-gray-400 mr-3">#{idx + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{dept}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-700 w-10 text-right">{count}</span>
                    <div className="w-24 ml-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--color-busia-blue)] rounded-full" 
                        style={{ width: `${(count / totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center">
              <Monitor className="mr-2 text-gray-400" size={16} /> 
              Asset Distribution by Category
            </h3>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {topCategories.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No data available.</div>
            ) : (
              topCategories.map(([cat, count]) => (
                <li key={cat} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-900">{cat}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {count} items
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
