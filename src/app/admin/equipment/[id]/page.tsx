"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  if (!assetId) notFound();

  const assetData = useQuery(api.equipment.getById, { id: assetId as any });

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
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Asset Details</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed history and current status</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-[var(--color-busia-green)]">
            {asset.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Asset Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-[var(--color-busia-blue)]">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 font-heading">Identity</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Asset Tag</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 mono-text bg-gray-100 px-2 py-1 rounded border border-gray-300 inline-block">{asset.assetTag}</dd>
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-[var(--color-busia-green)]">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 font-heading">Current State</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Owning Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Holder</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">{asset.holder || "Shared / Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Condition</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{asset.condition.replace("_", " ")}</dd>
              </div>
              {asset.locationRoom && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location / Room</dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.locationRoom}</dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900 font-heading">Assignment Ledger</h3>
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
                                    {actionText} <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1 rounded ml-1">({event.reason})</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">Dept: {event.departmentName} | Logged by: {event.loggedBy}</p>
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
    </div>
  );
}
