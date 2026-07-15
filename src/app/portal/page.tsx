import Link from "next/link";

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Department Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your department's inventory</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/portal/equipment" className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-busia-blue)] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Assets</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </Link>
        <Link href="/portal/equipment" className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-busia-green)] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Assigned</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </Link>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-status-info)]">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">In Storage</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-[var(--color-status-warning)]">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">In Repair</h3>
          <p className="text-2xl sm:text-3xl font-medium text-gray-300 mt-1 sm:mt-2 mono-text">0</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center italic mt-2">No assets recorded yet. System is ready and waiting.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Recent Assignments</h3>
          <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">No recent assignment history.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/portal/scan" className="block w-full text-center py-2 px-4 border border-[var(--color-busia-blue)] text-[var(--color-busia-blue)] rounded-md hover:bg-blue-50 transition-colors">
              Scan Asset Tag
            </a>
            <a href="/portal/equipment/new" className="block w-full text-center py-2 px-4 bg-[var(--color-busia-green)] text-white rounded-md hover:bg-green-800 transition-colors">
              Register New Equipment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
