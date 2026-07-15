import { notFound } from "next/navigation";

// Next.js 15 route parameters signature
export default async function EquipmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const assetId = params.id;

  if (!assetId) notFound();

  // Mock data for UI demonstration
  const asset = {
    assetTag: "CT-ICT-0001",
    serialNumber: "SN123456789",
    category: "Laptop",
    brandModel: "Dell Latitude 5420",
    status: "active",
    condition: "good",
    department: "Strategic Partnership, ICT & Digital Economy",
    currentHolder: "John Doe (ICT-001)"
  };

  const assignmentHistory = [
    { date: "2026-07-10", action: "Assigned to John Doe", reason: "new_assignment", loggedBy: "ICT" },
    { date: "2026-06-01", action: "Returned by Jane Smith", reason: "employee_exit", loggedBy: "ICT" },
    { date: "2025-11-15", action: "Assigned to Jane Smith", reason: "new_assignment", loggedBy: "ICT" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Asset Details</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed history and current status</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-[var(--color-busia-green)]">
          {asset.status.toUpperCase()}
        </span>
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
                <dd className="mt-1 text-sm text-gray-900 mono-text">{asset.serialNumber}</dd>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500">Brand / Model</dt>
                <dd className="mt-1 text-sm text-gray-900">{asset.brandModel}</dd>
              </div>
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
                <dd className="mt-1 text-sm text-gray-900 font-medium">{asset.currentHolder}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Condition</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{asset.condition}</dd>
              </div>
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
                <ul role="list" className="-mb-8">
                  {assignmentHistory.map((event, eventIdx) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== assignmentHistory.length - 1 ? (
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
                              <p className="text-sm text-gray-500">
                                {event.action} <span className="text-xs font-mono bg-gray-100 px-1 rounded">({event.reason})</span>
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Logged by: {event.loggedBy}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={event.date}>{event.date}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
