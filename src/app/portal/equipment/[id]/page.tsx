"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, AlertTriangle, Monitor, RotateCcw, UserPlus } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

const reassignSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  notes: z.string().optional(),
});

type ReassignFormData = z.infer<typeof reassignSchema>;

export default function AssetDetailView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);


  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReassignFormData>({
    resolver: zodResolver(reassignSchema),
  });

  const employeeIdValue = watch("employeeId") || "";

  const asset = useQuery(api.equipment.getByTag, { assetTag: decodeURIComponent(params.id) });
  const assignmentHistory = useQuery(api.assignments.getHistory, { assetTag: decodeURIComponent(params.id) }) || [];
  
  // We need the department ID of the asset to filter employees
  const employees = useQuery(api.employees.listByDepartment, { 
    departmentId: asset?.departmentId as any 
  }) || [];

  const reassignAsset = useMutation(api.equipment.reassignAsset);
  const returnToStore = useMutation(api.equipment.returnToStore);

  const handleReassignSubmit = async (data: ReassignFormData) => {
    try {
      await reassignAsset({
        assetTag: decodeURIComponent(params.id),
        newEmployeeId: data.employeeId as any,
        notes: data.notes,
      });
      alert("Asset successfully reassigned!");
      setIsReassignModalOpen(false);
      reset();
    } catch (error: any) {
      alert("Failed to reassign: " + error.message);
    }
  };

  const handleReturnToStore = async () => {
    if (confirm("Are you sure you want to return this asset to storage? It will be unassigned from its current holder.")) {
      try {
        await returnToStore({ assetTag: decodeURIComponent(params.id) });
        alert("Asset returned to storage!");
      } catch (error: any) {
        alert("Failed to return to storage: " + error.message);
      }
    }
  };

  if (asset === undefined) {
    return <div className="p-12 text-center text-gray-500">Loading asset details...</div>;
  }

  if (asset === null) {
    return <div className="p-12 text-center text-gray-500">Asset not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)] mono-text">{asset.tag}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                asset.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                asset.status === 'in_storage' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              } border`}>
                {asset.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{asset.brand}</p>
          </div>
          <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            <Edit size={16} className="mr-2" /> Edit Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700 flex items-center">
              <Monitor size={18} className="mr-2 text-gray-400" /> Hardware Details
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                <p className="font-medium text-gray-900">{asset.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Serial Number</p>
                <p className="font-medium text-gray-900 mono-text">{asset.serial}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Physical Condition</p>
                <p className="font-medium text-gray-900 capitalize">{asset.condition}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location / Room</p>
                <p className="font-medium text-gray-900">{asset.locationRoom || "N/A"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-700">{asset.notes || "No additional notes."}</p>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
              Assignment History
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignmentHistory.map((hist, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hist.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{hist.action.replace("_", " ")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hist.assignedTo || "-"}</td>
                    </tr>
                  ))}
                  {assignmentHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 italic">
                        No history recorded for this asset yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Current Assignment Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
              Current Custodian
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center border-2 border-gray-200">
                <UserAlertPlaceholder />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Currently assigned to</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{asset.holder || "Unassigned"}</p>
                <p className="text-xs text-gray-400 mt-1">{asset.holder ? asset.department : "Stored in generic inventory"}</p>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => setIsReassignModalOpen(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-[var(--color-busia-blue)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-900 transition-colors"
                >
                  <UserPlus size={16} className="mr-2" /> Reassign Asset
                </button>
                <button 
                  onClick={handleReturnToStore}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={16} className="mr-2 text-gray-400" /> Return to Store
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4 flex items-start">
            <AlertTriangle size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Need to report damage?</p>
              <p className="mt-1">Update the physical condition to flag this asset for repair.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsReassignModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(handleReassignSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Reassign Asset
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Select a new employee to take custody of this asset.</p>
                      
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">New Custodian</label>
                          <input type="hidden" {...register("employeeId")} />
                          <CustomSelect
                            options={employees.map(e => ({ value: e._id, label: e.fullName }))}
                            value={employeeIdValue}
                            onChange={(val) => setValue("employeeId", val, { shouldValidate: true })}
                            placeholder="Select an employee"
                            error={!!errors.employeeId}
                          />
                          {errors.employeeId && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.employeeId.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Reassignment Notes</label>
                          <textarea
                            {...register("notes")}
                            rows={3}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                            placeholder="Optional context for the transfer..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[var(--color-busia-blue)] text-base font-medium text-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-busia-blue)] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Confirm Reassignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReassignModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-busia-blue)] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserAlertPlaceholder() {
  return (
    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
