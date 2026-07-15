"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowLeft, Users, Monitor, Box, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // Use Convex "skip" to prevent querying before params are available
  const departmentId = params?.id as string | undefined;
  const data = useQuery(
    api.departments.getDepartmentDashboardData, 
    departmentId ? { id: departmentId as any } : "skip"
  );

  if (data === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (data === null || !data.department) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Department Not Found</h3>
        <button onClick={() => router.push("/admin/departments")} className="mt-4 text-[var(--color-busia-blue)] hover:underline">
          Go back to Departments
        </button>
      </div>
    );
  }

  const { department, employees, sharedAssets, storageAssets } = data;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push("/admin/departments")}
          className="p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">{department.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {department.code}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{department.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-[var(--color-busia-blue)] mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active members with designated equipments</p>
            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-[var(--color-busia-green)] mr-4">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Shared Devices</p>
            <p className="text-2xl font-bold text-gray-900">{sharedAssets.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Box size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Storage</p>
            <p className="text-2xl font-bold text-gray-900">{storageAssets.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Staff & Assigned Assets Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-heading flex items-center">
              <Users className="mr-2 text-gray-400" size={18} /> 
              Staff Roster & Assigned Devices
            </h2>
          </div>
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            {employees.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm italic">
                No staff registered in this department yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {employees.map((emp: any) => (
                  <li key={emp._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-base font-semibold text-gray-900">{emp.fullName}</h3>
                        <p className="text-sm text-gray-500">{emp.designation || "Staff"}</p>
                      </div>
                      <div className="flex-1 md:ml-10">
                        {emp.assets.length === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            No devices assigned
                          </span>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {emp.assets.map((asset: any) => (
                              <div key={asset._id} className="bg-white rounded-md p-3 border border-gray-200 shadow-sm flex justify-between items-center group cursor-pointer hover:border-blue-300 transition-colors">
                                <div>
                                  <p className="text-xs font-medium text-gray-900">{asset.categoryName}</p>
                                  <p className="text-xs text-gray-500">{asset.brandModel}</p>
                                </div>
                                <span className="text-[10px] font-mono bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[var(--color-busia-blue)]">
                                  {asset.assetTag}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shared Devices */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 font-heading flex items-center mb-4">
              <Monitor className="mr-2 text-gray-400" size={18} /> 
              Shared Department Devices
            </h2>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
              {sharedAssets.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm italic h-full flex items-center justify-center min-h-[150px]">
                  No shared devices registered.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {sharedAssets.map((asset: any) => (
                    <li key={asset._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{asset.categoryName}</p>
                          <p className="text-xs text-gray-500">{asset.brandModel}</p>
                          {asset.locationRoom && <p className="text-xs text-gray-400 mt-1">📍 {asset.locationRoom}</p>}
                        </div>
                        <span className="text-xs font-mono bg-green-50 border border-green-200 px-2 py-1 rounded text-green-700">
                          {asset.assetTag}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Storage */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 font-heading flex items-center mb-4">
              <Box className="mr-2 text-gray-400" size={18} /> 
              Unassigned Storage
            </h2>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
              {storageAssets.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm italic h-full flex items-center justify-center min-h-[150px]">
                  No assets currently in storage.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {storageAssets.map((asset: any) => (
                    <li key={asset._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{asset.categoryName}</p>
                          <p className="text-xs text-gray-500">{asset.brandModel}</p>
                        </div>
                        <span className="text-xs font-mono bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-yellow-700">
                          {asset.assetTag}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
