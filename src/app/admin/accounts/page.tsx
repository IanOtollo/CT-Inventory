"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ShieldAlert, Key, UserX, UserCheck } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const schema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from Convex
  const accounts = useQuery(api.accounts.list) || [];
  const departments = useQuery(api.departments.list) || [];
  
  const createAccount = useMutation(api.accounts.create);
  const toggleAccount = useMutation(api.accounts.toggleStatus);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const departmentIdValue = watch("departmentId") || "";

  useEffect(() => {
    if (departmentIdValue) {
      const selectedDept = departments.find(d => d._id === departmentIdValue);
      if (selectedDept && selectedDept.code) {
        // e.g., if code is "EDU", it generates "edu@busiacounty.go.ke"
        const generatedEmail = `${selectedDept.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@busiacounty.go.ke`;
        setValue("email", generatedEmail, { shouldValidate: true });
      }
    }
  }, [departmentIdValue, departments, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await createAccount({
        departmentId: data.departmentId as any,
        email: data.email,
        password: data.password,
      });
      alert("Account created successfully!");
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      alert("Failed to create account: " + error.message);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", pass, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Department Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage access credentials for departmental portals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-busia-blue)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-900 transition-colors"
        >
          <Plus size={16} className="mr-2" /> New Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search accounts by email or department..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.departmentName}</div>
                    <div className="text-xs text-gray-500">{account.departmentCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.lastLogin || "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button className="text-gray-400 hover:text-[var(--color-busia-blue)] transition-colors" title="Reset Password">
                      <Key size={18} />
                    </button>
                    <button 
                      onClick={() => toggleAccount({ accountId: account.id as any })}
                      className={`transition-colors ${account.active ? "text-gray-400 hover:text-red-600" : "text-gray-400 hover:text-green-600"}`} 
                      title={account.active ? "Deactivate Account" : "Activate Account"}
                    >
                      {account.active ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <ShieldAlert size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 italic">No department accounts configured. Click "New Account" to grant portal access.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Create Department Account
                      </h3>
                      <div className="mt-6 space-y-4">
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Department</label>
                          <input type="hidden" {...register("departmentId")} />
                          <CustomSelect
                            options={departments.map(d => ({ value: d._id, label: `${d.name} (${d.code})` }))}
                            value={departmentIdValue}
                            onChange={(val) => setValue("departmentId", val, { shouldValidate: true })}
                            placeholder="Select a department"
                            error={!!errors.departmentId}
                          />
                          {errors.departmentId && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.departmentId.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email Address</label>
                          <input
                            type="email"
                            {...register("email")}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                            placeholder="e.g. ict@busia.go.ke"
                          />
                          {errors.email && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.email.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 flex justify-between">
                            Password
                            <button type="button" onClick={generatePassword} className="text-[var(--color-busia-blue)] hover:underline text-xs">
                              Generate Random
                            </button>
                          </label>
                          <input
                            type="text"
                            {...register("password")}
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm mono-text"
                          />
                          {errors.password && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.password.message}</p>}
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
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
