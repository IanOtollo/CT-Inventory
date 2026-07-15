"use client";

import { useState } from "react";
import { Users, Plus, Monitor, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "Department Name is required"),
  code: z.string().min(1, "Department Code is required (e.g., ICT)"),
  location: z.string().min(1, "Location is required"),
  headOfDepartment: z.string().optional(),
  procurementOfficer: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DepartmentsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const departments = useQuery(api.departments.list);
  const createDepartment = useMutation(api.departments.create);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createDepartment({
        name: data.name,
        code: data.code,
        location: data.location,
        headOfDepartment: data.headOfDepartment,
        procurementOfficer: data.procurementOfficer,
      });
      alert("Department created successfully!");
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      alert("Failed to create department: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all county departments and their assigned assets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[var(--color-busia-green)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-800 transition-colors"
        >
          <Plus size={16} className="mr-2" /> Add Department
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments === undefined ? (
                // Skeleton Loader
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-5/6"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div></td>
                  </tr>
                ))
              ) : departments.map((dept: any) => (
                <tr 
                  key={dept._id} 
                  onClick={() => router.push(`/admin/departments/${dept._id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                      <Users size={14} />
                      <span>--</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                      <Monitor size={14} />
                      <span>--</span>
                    </div>
                  </td>
                </tr>
              ))}
              {departments !== undefined && departments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">No departments configured yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 font-heading" id="modal-title">
                    Add New Department
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Name *</label>
                    <input
                      type="text"
                      {...register("name")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                      placeholder="e.g. Health And Sanitation"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Code *</label>
                    <input
                      type="text"
                      {...register("code")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm uppercase"
                      placeholder="e.g. HLT"
                    />
                    {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    <input
                      type="text"
                      {...register("location")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                      placeholder="e.g. County Headquarters"
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Head of Department (Optional)</label>
                    <input
                      type="text"
                      {...register("headOfDepartment")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Procurement Officer (Optional)</label>
                    <input
                      type="text"
                      {...register("procurementOfficer")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                      placeholder="e.g. Jane Smith"
                    />
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-busia-blue)] hover:bg-blue-900"
                    >
                      Save Department
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
