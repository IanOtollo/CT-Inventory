"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Folder, FolderOpen, Archive, Filter, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const UNASSIGNED_LABEL = "Shared / Unassigned";
const STORAGE_LABEL = "In Storage";

const STATUS_OPTIONS = ["active", "in_repair", "in_storage", "retired", "lost", "disposed"];
const CONDITION_OPTIONS = [
  "good",
  "fair",
  "poor",
  "working",
  "faulty",
  "faulty_repairable",
  "faulty_unrepairable",
  "in_store",
  "missing",
];

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Collapses name variants that refer to the same person (e.g. "Mr. Omwami" / "Mr Omwami" / "Mrs LIllian")
// caused by duplicate/inconsistent employee records, so they group into one folder.
function canonicalizeName(name: string) {
  return name
    .replace(/\./g, "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]);
  return letters.join("").toUpperCase();
}

function matchesSearch(item: any, term: string) {
  if (!term) return true;
  const haystack = [item.tag, item.serial, item.brand, item.category, item.holder, item.department]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

export default function EquipmentPage() {
  const router = useRouter();

  const equipmentData = useQuery(api.equipment.listAll);
  const isLoading = equipmentData === undefined;
  const equipment = equipmentData || [];

  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [expandedHolders, setExpandedHolders] = useState<Set<string>>(new Set());

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [conditionFilters, setConditionFilters] = useState<Set<string>>(new Set());
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of equipment) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [equipment]);

  const toggleFilterPanel = () => {
    if (isFilterOpen) {
      setIsFilterOpen(false);
      return;
    }
    const rect = filterButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = 288; // w-72
      setPanelPos({
        top: rect.bottom + window.scrollY + 8,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - panelWidth - 16),
      });
    }
    setIsFilterOpen(true);
  };

  useEffect(() => {
    if (!isFilterOpen) return;

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const clickedButton = filterButtonRef.current?.contains(target);
      const clickedPanel = filterPanelRef.current?.contains(target);
      if (!clickedButton && !clickedPanel) setIsFilterOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isFilterOpen]);

  const toggleSetValue = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const activeFilterCount = statusFilters.size + conditionFilters.size + categoryFilters.size;

  const clearFilters = () => {
    setStatusFilters(new Set());
    setConditionFilters(new Set());
    setCategoryFilters(new Set());
  };

  const filtered = useMemo(
    () =>
      equipment.filter(
        (item: any) =>
          matchesSearch(item, search) &&
          (statusFilters.size === 0 || statusFilters.has(item.status)) &&
          (conditionFilters.size === 0 || conditionFilters.has(item.condition)) &&
          (categoryFilters.size === 0 || categoryFilters.has(item.category))
      ),
    [equipment, search, statusFilters, conditionFilters, categoryFilters]
  );

  const departments = useMemo(() => {
    const deptMap = new Map<string, { id: string; name: string; holders: Map<string, { label: string; items: any[] }> }>();

    for (const item of filtered) {
      const deptId = String(item.departmentId ?? item.department ?? "unknown");
      const deptName = item.department || "Unassigned Department";
      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, { id: deptId, name: deptName, holders: new Map() });
      }
      const dept = deptMap.get(deptId)!;

      const holderLabel = item.holder ? canonicalizeName(item.holder) : null;
      const holderKey = holderLabel
        ? holderLabel.toLowerCase()
        : item.status === "in_storage"
        ? STORAGE_LABEL
        : UNASSIGNED_LABEL;

      if (!dept.holders.has(holderKey)) dept.holders.set(holderKey, { label: holderLabel || holderKey, items: [] });
      dept.holders.get(holderKey)!.items.push(item);
    }

    return Array.from(deptMap.values())
      .map((dept) => {
        const holders = Array.from(dept.holders.entries())
          .map(([key, val]) => ({ key, ...val }))
          .sort((a, b) => {
            const rank = (l: string) => (l === UNASSIGNED_LABEL || l === STORAGE_LABEL ? 1 : 0);
            if (rank(a.label) !== rank(b.label)) return rank(a.label) - rank(b.label);
            return a.label.localeCompare(b.label);
          });
        return {
          id: dept.id,
          name: dept.name,
          holders,
          assetCount: holders.reduce((sum, h) => sum + h.items.length, 0),
          holderCount: holders.filter((h) => h.label !== UNASSIGNED_LABEL && h.label !== STORAGE_LABEL).length,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered]);

  // Keep the left-pane selection valid: pick the first department once loaded,
  // and re-pick if the current selection drops out (e.g. filtered/searched away).
  useEffect(() => {
    if (departments.length === 0) {
      if (selectedDeptId !== null) setSelectedDeptId(null);
      return;
    }
    if (!selectedDeptId || !departments.some((d) => d.id === selectedDeptId)) {
      setSelectedDeptId(departments[0].id);
    }
  }, [departments, selectedDeptId]);

  const selectedDept = departments.find((d) => d.id === selectedDeptId) || null;
  const isSearching = search.trim().length > 0;

  const toggleHolder = (key: string) => {
    setExpandedHolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--color-busia-black)]">County Equipment</h1>
          <p className="text-sm text-gray-500 mt-1">Global registry of all assets across all departments.</p>
        </div>
        <Link
          href="/admin/equipment/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-busia-blue)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-900 transition-colors"
        >
          <Plus size={16} className="mr-2" /> Register Equipment
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Asset Tag, Serial, Brand, or Holder..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
            />
          </div>

          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={toggleFilterPanel}
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
                activeFilterCount > 0
                  ? "border-[var(--color-busia-blue)] bg-blue-50 text-[var(--color-busia-blue)]"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Filter size={16} className="mr-2" /> Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-busia-blue)] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterOpen &&
              panelPos &&
              createPortal(
                <div
                  ref={filterPanelRef}
                  style={{ position: "absolute", top: panelPos.top, left: panelPos.left }}
                  className="w-72 max-h-[80vh] flex flex-col bg-white border border-gray-200 rounded-lg shadow-xl z-50 folder-pop"
                >
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
                    <h4 className="text-sm font-semibold text-gray-900">Filter Equipment</h4>
                    <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="px-4 pb-2 overflow-y-auto">
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => {
                          const active = statusFilters.has(status);
                          return (
                            <button
                              key={status}
                              onClick={() => toggleSetValue(setStatusFilters, status)}
                              className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                                active
                                  ? "bg-[var(--color-busia-blue)] text-white border-[var(--color-busia-blue)]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {formatLabel(status)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Condition</p>
                      <div className="flex flex-wrap gap-2">
                        {CONDITION_OPTIONS.map((condition) => {
                          const active = conditionFilters.has(condition);
                          return (
                            <button
                              key={condition}
                              onClick={() => toggleSetValue(setConditionFilters, condition)}
                              className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                                active
                                  ? "bg-[var(--color-busia-green)] text-white border-[var(--color-busia-green)]"
                                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {formatLabel(condition)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {categoryOptions.length > 0 && (
                      <div className="mb-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Item Type</p>
                        <div className="flex flex-wrap gap-2">
                          {categoryOptions.map((category) => {
                            const active = categoryFilters.has(category);
                            return (
                              <button
                                key={category}
                                onClick={() => toggleSetValue(setCategoryFilters, category)}
                                className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${
                                  active
                                    ? "bg-gray-800 text-white border-gray-800"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {category}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 border-t border-gray-100 p-3">
                    <button
                      onClick={clearFilters}
                      disabled={activeFilterCount === 0}
                      className={`w-full text-center px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                        activeFilterCount > 0
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-gray-50 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </div>

          <p className="text-xs text-gray-500 whitespace-nowrap sm:ml-auto">
            {isLoading ? "Loading…" : `${filtered.length} asset${filtered.length === 1 ? "" : "s"} across ${departments.length} department${departments.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Master-detail: departments on the left (1/4), holders on the right (3/4) */}
        <div className="flex flex-col md:flex-row">
          {/* Left: department folders */}
          <aside className="w-full md:w-1/4 md:border-r border-b md:border-b-0 border-gray-200 bg-gray-50/40">
            <div className="p-3 space-y-1.5 md:max-h-[65vh] md:overflow-y-auto">
              {isLoading &&
                [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 h-14" />
                ))}

              {!isLoading &&
                departments.map((dept) => {
                  const isSelected = dept.id === selectedDeptId;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.id)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-[var(--color-busia-blue)] bg-blue-50 shadow-sm"
                          : "border-transparent bg-white hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-md shrink-0 ${
                          isSelected ? "bg-[var(--color-busia-blue)] text-white" : "bg-blue-50 text-[var(--color-busia-blue)]"
                        }`}
                      >
                        {isSelected ? <FolderOpen size={14} /> : <Folder size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isSelected ? "font-semibold text-[var(--color-busia-blue)]" : "font-medium text-gray-900"
                          }`}
                        >
                          {dept.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {dept.holderCount} holder{dept.holderCount === 1 ? "" : "s"} · {dept.assetCount} asset
                          {dept.assetCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </button>
                  );
                })}

              {!isLoading && departments.length === 0 && (
                <p className="text-sm text-gray-500 italic p-3">No departments found.</p>
              )}
            </div>
          </aside>

          {/* Right: holder folders for the selected department */}
          <main className="flex-1 p-4 space-y-2 md:max-h-[65vh] md:overflow-y-auto">
            {isLoading &&
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 h-14" />
              ))}

            {!isLoading && !selectedDept && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500 italic">No equipment found matching criteria.</p>
              </div>
            )}

            {!isLoading && selectedDept && (
              <div key={selectedDept.id} className="folder-pop space-y-2">
                {selectedDept.holders.map((holder) => {
                  const holderKey = `${selectedDept.id}::${holder.key}`;
                  const isOpen = isSearching || expandedHolders.has(holderKey);
                  const isSpecial = holder.label === UNASSIGNED_LABEL || holder.label === STORAGE_LABEL;
                  return (
                    <div
                      key={holderKey}
                      className={`rounded-lg border transition-colors ${
                        isOpen ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <button
                        onClick={() => toggleHolder(holderKey)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isSpecial ? (
                            <div className="p-1.5 rounded-md bg-yellow-50 text-yellow-600">
                              <Archive size={14} />
                            </div>
                          ) : isOpen ? (
                            <div className="w-7 h-7 rounded-full bg-[var(--color-busia-green)] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                              {getInitials(holder.label)}
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-md bg-green-50 text-[var(--color-busia-green)]">
                              <Folder size={14} />
                            </div>
                          )}
                          <span className={`text-sm ${isSpecial ? "italic text-gray-500" : "font-medium text-gray-900"}`}>
                            {holder.label}
                          </span>
                          {isOpen && !isSpecial && <FolderOpen size={14} className="text-[var(--color-busia-green)]" />}
                        </div>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white text-gray-600 border border-gray-200">
                          {holder.items.length} item{holder.items.length === 1 ? "" : "s"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="overflow-x-auto mx-3 mb-3 rounded-md border border-gray-100 folder-pop">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Asset Tag</th>
                                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Item Type</th>
                                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Brand / Model</th>
                                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Serial Number</th>
                                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Condition</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {holder.items.map((item: any) => (
                                <tr
                                  key={item._id}
                                  onClick={() => router.push(`/admin/equipment/${item._id}`)}
                                  className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                                >
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 mono-text">
                                    {item.tag}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.brand}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 font-mono uppercase">
                                    {item.serial?.toUpperCase()}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : item.status === "in_repair"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {item.status.replace("_", " ").toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">
                                    {item.condition}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .folder-pop {
          animation: folderPop 0.15s ease-out;
        }
        @keyframes folderPop {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
