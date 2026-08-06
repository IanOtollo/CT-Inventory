"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, X, Tag, User, MapPin, StickyNote, Building2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../../../../convex/_generated/api";
import CustomSelect from "@/components/CustomSelect";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "in_repair", label: "In Repair" },
  { value: "in_storage", label: "In Storage" },
  { value: "retired", label: "Retired" },
  { value: "lost", label: "Lost" },
  { value: "disposed", label: "Disposed" },
];

const CONDITION_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "working", label: "Working (No damage)" },
  { value: "faulty_repairable", label: "Faulty - Repairable" },
  { value: "faulty_unrepairable", label: "Faulty - Beyond Repair" },
  { value: "faulty", label: "Faulty" },
  { value: "in_store", label: "In Store" },
  { value: "missing", label: "Missing" },
];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "in_repair":
      return "bg-yellow-100 text-yellow-800";
    case "in_storage":
      return "bg-blue-100 text-blue-800";
    case "retired":
    case "disposed":
      return "bg-gray-200 text-gray-700";
    case "lost":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const conditionBadgeClass = (condition: string) => {
  if (["good", "working"].includes(condition)) return "bg-green-100 text-green-800";
  if (["fair", "in_store"].includes(condition)) return "bg-blue-100 text-blue-800";
  if (["poor", "faulty_repairable"].includes(condition)) return "bg-yellow-100 text-yellow-800";
  if (["faulty", "faulty_unrepairable", "missing"].includes(condition)) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-800";
};

const editSchema = z.object({
  assetTag: z.string().min(1, "Asset Tag is required"),
  serialNumber: z.string().min(1, "Serial Number is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandModel: z.string().min(1, "Brand/Model is required"),
  technicalSpecifications: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  status: z.enum(["active", "in_repair", "in_storage", "retired", "lost", "disposed"]),
  condition: z.enum([
    "working",
    "faulty_repairable",
    "faulty_unrepairable",
    "in_store",
    "missing",
    "good",
    "fair",
    "poor",
    "faulty",
  ]),
  employeeId: z.string().optional(),
  locationRoom: z.string().optional(),
  notes: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

function EditAssetModal({ asset, onClose }: { asset: any; onClose: () => void }) {
  const departments = useQuery(api.departments.list) || [];
  const categories = useQuery(api.categories.list) || [];
  const updateAsset = useMutation(api.equipment.updateAsset);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      assetTag: asset.assetTag,
      serialNumber: asset.serialNumber,
      categoryId: asset.categoryId,
      brandModel: asset.brandModel,
      technicalSpecifications: asset.technicalSpecifications || "",
      departmentId: asset.departmentId,
      status: asset.status,
      condition: asset.condition,
      employeeId: asset.currentEmployeeId ? asset.currentEmployeeId : asset.status === "active" ? "shared" : "unassigned",
      locationRoom: asset.locationRoom || "",
      notes: asset.notes || "",
    },
  });

  const departmentIdValue = watch("departmentId");
  const categoryIdValue = watch("categoryId");
  const statusValue = watch("status");
  const conditionValue = watch("condition");
  const employeeIdValue = watch("employeeId") || "unassigned";

  const employees = useQuery(
    api.employees.listByDepartment,
    departmentIdValue ? { departmentId: departmentIdValue as any } : "skip"
  ) || [];

  const onSubmit = async (data: EditFormData) => {
    try {
      await updateAsset({
        id: asset._id,
        assetTag: data.assetTag,
        serialNumber: data.serialNumber,
        categoryId: data.categoryId as any,
        brandModel: data.brandModel,
        technicalSpecifications: data.technicalSpecifications,
        departmentId: data.departmentId as any,
        status: data.status,
        condition: data.condition,
        employeeId: data.employeeId as any,
        locationRoom: data.locationRoom,
        notes: data.notes,
      });
      onClose();
    } catch (error: any) {
      alert("Failed to update asset: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="edit-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-start justify-center min-h-screen pt-8 px-4 pb-8">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="relative z-10 bg-white rounded-lg text-left shadow-xl w-full max-w-2xl">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <h3 className="text-lg font-medium text-gray-900 font-heading" id="edit-modal-title">
              Edit Asset — {asset.assetTag}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Tag *</label>
                <input
                  type="text"
                  {...register("assetTag")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm mono-text uppercase"
                />
                {errors.assetTag && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.assetTag.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number *</label>
                <input
                  type="text"
                  {...register("serialNumber")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm mono-text uppercase"
                />
                {errors.serialNumber && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.serialNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Owning Department *</label>
                <input type="hidden" {...register("departmentId")} />
                <CustomSelect
                  options={departments.map((d: any) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
                  value={departmentIdValue}
                  onChange={(val) => {
                    setValue("departmentId", val, { shouldValidate: true });
                    setValue("employeeId", "unassigned");
                  }}
                  placeholder="Select a department"
                  error={!!errors.departmentId}
                />
                {errors.departmentId && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.departmentId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <input type="hidden" {...register("categoryId")} />
                <CustomSelect
                  options={categories.map((c: any) => ({ value: c._id, label: c.name }))}
                  value={categoryIdValue}
                  onChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
                  placeholder="Select a category"
                  error={!!errors.categoryId}
                />
                {errors.categoryId && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.categoryId.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assign to Employee</label>
              <input type="hidden" {...register("employeeId")} />
              <CustomSelect
                options={[
                  { value: "unassigned", label: "Leave unassigned — asset going into storage" },
                  { value: "shared", label: "Shared Device (General Dept Use, e.g. TV, Printer)" },
                  ...employees.map((e: any) => ({ value: e._id, label: e.fullName })),
                ]}
                value={employeeIdValue}
                onChange={(val) => setValue("employeeId", val, { shouldValidate: true })}
                placeholder="Select an employee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Brand & Model *</label>
              <input
                type="text"
                {...register("brandModel")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
              />
              {errors.brandModel && <p className="mt-1 text-sm text-[var(--color-status-warning)]">{errors.brandModel.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Technical Specifications</label>
              <input
                type="text"
                {...register("technicalSpecifications")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input type="hidden" {...register("status")} />
                <CustomSelect
                  options={STATUS_OPTIONS}
                  value={statusValue}
                  onChange={(val) => setValue("status", val as any, { shouldValidate: true })}
                  searchable={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Physical Condition</label>
                <input type="hidden" {...register("condition")} />
                <CustomSelect
                  options={CONDITION_OPTIONS}
                  value={conditionValue}
                  onChange={(val) => setValue("condition", val as any, { shouldValidate: true })}
                  searchable={false}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location / Room</label>
              <input
                type="text"
                {...register("locationRoom")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                placeholder="e.g. Server Room A, Desk 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3 border-t border-gray-200 -mx-6 px-6 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-busia-blue)] hover:bg-blue-900 disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  if (!assetId) notFound();

  const assetData = useQuery(api.equipment.getById, { id: assetId as any });
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Close the edit modal if the asset is deleted or the id becomes invalid mid-edit
  useEffect(() => {
    if (assetData === null) setIsEditOpen(false);
  }, [assetData]);

  if (assetData === undefined) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-[var(--color-busia-blue)]" size={32} />
      </div>
    );
  }

  if (assetData === null) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Asset not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[var(--color-busia-blue)] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const asset = assetData;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)] truncate">{asset.assetTag}</h1>
          <p className="text-sm text-gray-500 mt-1">{asset.brandModel} · {asset.category}</p>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(asset.status)}`}>
            {asset.status.replace("_", " ").toUpperCase()}
          </span>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-[var(--color-busia-blue)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-900 transition-colors"
          >
            <Pencil size={14} className="mr-2" /> Edit Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-[var(--color-busia-blue)]">
            <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Tag size={16} className="text-[var(--color-busia-blue)]" />
              <h3 className="text-base leading-6 font-semibold text-gray-900 font-heading">Identity</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Asset Tag</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 mono-text bg-gray-100 px-2 py-1 rounded border border-gray-300 inline-block">
                  {asset.assetTag}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono uppercase">{asset.serialNumber?.toUpperCase()}</dd>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500">Brand / Model</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.brandModel}</dd>
              </div>
              {asset.technicalSpecifications && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Technical Specifications</dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.technicalSpecifications}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.category}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-[var(--color-busia-green)]">
            <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Building2 size={16} className="text-[var(--color-busia-green)]" />
              <h3 className="text-base leading-6 font-semibold text-gray-900 font-heading">Current State</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Owning Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <User size={12} /> Current Holder
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">{asset.holder || "Shared / Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Condition</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${conditionBadgeClass(asset.condition)}`}>
                    {asset.condition.replace("_", " ")}
                  </span>
                </dd>
              </div>
              {asset.locationRoom && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MapPin size={12} /> Location / Room
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.locationRoom}</dd>
                </div>
              )}
              {asset.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <StickyNote size={12} /> Notes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-600 italic">{asset.notes}</dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base leading-6 font-semibold text-gray-900 font-heading">Assignment Ledger</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Historical trail of all past holders.</p>
            </div>

            <div className="p-6">
              <div className="flow-root">
                {asset.assignmentHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No assignment history recorded.</p>
                ) : (
                  <ul role="list" className="-mb-8">
                    {asset.assignmentHistory.map((event: any, eventIdx: number) => {
                      const dateStr = new Date(event.assignedDate).toLocaleDateString();
                      let actionText = `Assigned to ${event.employeeName}`;
                      if (event.returnedDate) {
                        actionText = `Held by ${event.employeeName} until ${new Date(event.returnedDate).toLocaleDateString()}`;
                      }

                      return (
                        <li key={eventIdx}>
                          <div className="relative pb-8">
                            {eventIdx !== asset.assignmentHistory.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-[var(--color-busia-blue)] flex items-center justify-center ring-8 ring-white">
                                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-800 font-medium">
                                    {actionText}{" "}
                                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1 rounded ml-1">({event.reason})</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Dept: {event.departmentName} | Logged by: {event.loggedBy}
                                  </p>
                                  {event.notes && <p className="text-sm text-gray-600 mt-2 italic">"{event.notes}"</p>}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={dateStr}>{dateStr}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && <EditAssetModal asset={asset} onClose={() => setIsEditOpen(false)} />}
    </div>
  );
}
