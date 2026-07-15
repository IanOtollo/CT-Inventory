"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScanLine, ArrowLeft, Plus, X } from "lucide-react";
import AssetScanner from "@/components/AssetScanner";
import CustomSelect from "@/components/CustomSelect";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

const schema = z.object({
  assetTag: z.string().min(1, "Asset Tag is required"),
  serialNumber: z.string().min(1, "Serial Number is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandModel: z.string().min(1, "Brand/Model is required"),
  departmentId: z.string().min(1, "Department is required"),
  condition: z.enum(["good", "fair", "poor", "faulty"]),
  employeeId: z.string().optional(),
  locationRoom: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminNewEquipmentPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState<"tag" | "serial" | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeTitle, setNewEmployeeTitle] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: "good" }
  });

  const departmentIdValue = watch("departmentId") || "";
  const categoryIdValue = watch("categoryId") || "";
  const conditionValue = watch("condition") || "good";
  const employeeIdValue = watch("employeeId") || "unassigned";

  // Fetch data from Convex
  const departments = useQuery(api.departments.list) || [];
  const categories = useQuery(api.categories.list) || [];
  const employees = useQuery(api.employees.listByDepartment, 
    departmentIdValue ? { departmentId: departmentIdValue as any } : "skip"
  ) || [];

  const registerEquipment = useMutation(api.equipment.registerAsset);
  const createEmployee = useMutation(api.employees.create);

  const handleQuickAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentIdValue) {
      alert("Please select a department first.");
      return;
    }
    if (!newEmployeeName) return;

    try {
      const newId = await createEmployee({
        departmentId: departmentIdValue as any,
        name: newEmployeeName,
        title: newEmployeeTitle || "Staff",
      });
      setValue("employeeId", newId, { shouldValidate: true });
      setIsAddEmployeeModalOpen(false);
      setNewEmployeeName("");
      setNewEmployeeTitle("");
    } catch (error: any) {
      alert("Failed to add employee: " + error.message);
    }
  };

  // Clear employee selection when department changes
  useEffect(() => {
    setValue("employeeId", "unassigned", { shouldValidate: true });
  }, [departmentIdValue, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await registerEquipment({
        assetTag: data.assetTag,
        serialNumber: data.serialNumber,
        categoryId: data.categoryId as any,
        brandModel: data.brandModel,
        departmentId: data.departmentId as any,
        condition: data.condition,
        employeeId: data.employeeId as any,
        locationRoom: data.locationRoom,
        notes: data.notes,
      });
      alert("Asset Registered successfully by Admin!");
      router.push("/admin/equipment");
    } catch (error: any) {
      alert("Failed to register asset: " + error.message);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    if (isScanning === "tag") {
      setValue("assetTag", decodedText);
    } else if (isScanning === "serial") {
      setValue("serialNumber", decodedText);
    }
    setIsScanning(null);
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Register New Equipment</h1>
            <p className="text-sm text-gray-500 mt-1">Add a physical asset and assign it directly to any department.</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Asset Tag *</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  {...register("assetTag")}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm mono-text uppercase"
                  placeholder="CT-ICT-0001"
                />
                <button
                  type="button"
                  onClick={() => setIsScanning("tag")}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  <ScanLine size={18} className="mr-1" /> Scan
                </button>
              </div>
              {errors.assetTag && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.assetTag.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer Serial Number *</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  {...register("serialNumber")}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm mono-text uppercase"
                />
                <button
                  type="button"
                  onClick={() => setIsScanning("serial")}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  <ScanLine size={18} className="mr-1" /> Scan
                </button>
              </div>
              {errors.serialNumber && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.serialNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Owning Department *</label>
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

            <div className="md:col-span-2">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Assign to Employee (optional)</label>
                <button 
                  type="button" 
                  onClick={() => {
                    if (!departmentIdValue) {
                      alert("Please select a Department first before adding an employee.");
                      return;
                    }
                    setIsAddEmployeeModalOpen(true);
                  }}
                  className="text-xs text-[var(--color-busia-blue)] hover:underline flex items-center"
                >
                  <Plus size={12} className="mr-1" /> Quick Add Employee
                </button>
              </div>
              <input type="hidden" {...register("employeeId")} />
              <CustomSelect
                options={[
                  { value: "unassigned", label: "Leave unassigned — asset going into storage" },
                  { value: "shared", label: "Shared Device (General Dept Use, e.g. TV, Printer)" },
                  ...employees.map((e: any) => ({ value: e._id, label: e.fullName }))
                ]}
                value={employeeIdValue}
                onChange={(val) => setValue("employeeId", val, { shouldValidate: true })}
                placeholder="Select an employee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <input type="hidden" {...register("categoryId")} />
              <CustomSelect
                options={categories.map(c => ({ value: c._id, label: c.name }))}
                value={categoryIdValue}
                onChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
                placeholder="Select a category"
                error={!!errors.categoryId}
              />
              {errors.categoryId && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Brand & Model *</label>
              <input
                type="text"
                {...register("brandModel")}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                placeholder="e.g. Dell Latitude 5420"
              />
              {errors.brandModel && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.brandModel.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Physical Condition</label>
              <input type="hidden" {...register("condition")} />
              <CustomSelect
                options={[
                  { value: "good", label: "Good (Working, no damage)" },
                  { value: "fair", label: "Fair (Working, visible wear)" },
                  { value: "poor", label: "Poor (Working poorly, damaged)" },
                  { value: "faulty", label: "Faulty (Not working)" },
                ]}
                value={conditionValue}
                onChange={(val) => setValue("condition", val as any, { shouldValidate: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location / Room (Optional)</label>
              <input
                type="text"
                {...register("locationRoom")}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                placeholder="e.g. Server Room A, Desk 12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-busia-green)] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-busia-green)]"
            >
              Register Asset
            </button>
          </div>
        </form>
      </div>

      {isScanning && (
        <AssetScanner
          isOpen={true}
          title={`Scan ${isScanning === "tag" ? "Asset Tag" : "Serial Number"}`}
          onScan={handleScanSuccess}
          onClose={() => setIsScanning(null)}
        />
      )}

      {/* Quick Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsAddEmployeeModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 font-heading">
                    Quick Add Employee
                  </h3>
                  <button onClick={() => setIsAddEmployeeModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleQuickAddEmployee} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                      placeholder="e.g. Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title / Role</label>
                    <input
                      type="text"
                      value={newEmployeeTitle}
                      onChange={(e) => setNewEmployeeTitle(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                      placeholder="e.g. Senior ICT Officer"
                    />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-busia-blue)] hover:bg-blue-900"
                    >
                      Save & Select
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
