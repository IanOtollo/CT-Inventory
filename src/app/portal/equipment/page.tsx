export default function PortalEquipmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">Department Assets</h1>
        <a href="/portal/equipment/new" className="px-4 py-2 bg-[var(--color-busia-blue)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-900 transition-colors">
          + Add New
        </a>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">Department equipment list placeholder.</p>
      </div>
    </div>
  );
}
