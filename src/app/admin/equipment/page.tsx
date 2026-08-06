"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, ChevronDown, ChevronRight, Building2, User, Archive, Filter, X } from "lucide-react";
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

  const equipment = useQuery(api.equipment.listAll) || [];
  const [search, setSearch] = useState("");
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());
  const [expandedHolders, setExpandedHolders] = useState<Set<string>>(new Set());

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [conditionFilters, setConditionFilters] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleSetValue = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const activeFilterCount = statusFilters.size + conditionFilters.size;

  const clearFilters = () => {
    setStatusFilters(new Set());
    setConditionFilters(new Set());
  };

  const filtered = useMemo(
    () =>
      equipment.filter(
        (item: any) =>
          matchesSearch(item, search) &&
          (statusFilters.size === 0 || statusFilters.has(item.status)) &&
          (conditionFilters.size === 0 || conditionFilters.has(item.condition))
      ),
    [equipment, search, statusFilters, conditionFilters]
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

      const holderKey = item.currentEmployeeId
        ? String(item.currentEmployeeId)
        : item.status === "in_storage"
        ? STORAGE_LABEL
        : UNASSIGNED_LABEL;
      const holderLabel = item.holder || holderKey;

      if (!dept.holders.has(holderKey)) dept.holders.set(holderKey, { label: holderLabel, items: [] });
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

  const isSearching = search.trim().length > 0;

  const toggleDept = (id: string) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen((v) => !v)}
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

            {isFilterOpen && (
              <div className="absolute right-0 sm:left-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Filter Equipment</h4>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>

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

                <div>
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

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 w-full text-center text-xs font-medium text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 whitespace-nowrap sm:ml-auto">
            {filtered.length} asset{filtered.length === 1 ? "" : "s"} across {departments.length} department{departments.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {departments.map((dept) => {
            const isCollapsed = !isSearching && collapsedDepts.has(dept.id);
            return (
              <div key={dept.id}>
                <button
                  onClick={() => toggleDept(dept.id)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/60 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                    <Building2 size={16} className="text-[var(--color-busia-blue)]" />
                    <span className="text-sm font-semibold text-gray-900">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {dept.holderCount} holder{dept.holderCount === 1 ? "" : "s"}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                      {dept.assetCount} asset{dept.assetCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="pl-8 pr-2 pb-2">
                    {dept.holders.map((holder) => {
                      const holderKey = `${dept.id}::${holder.key}`;
                      const isOpen = isSearching || expandedHolders.has(holderKey);
                      const isSpecial = holder.label === UNASSIGNED_LABEL || holder.label === STORAGE_LABEL;
                      return (
                        <div key={holderKey} className="border-l border-gray-200 ml-2">
                          <button
                            onClick={() => toggleHolder(holderKey)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              {isOpen ? (
                                <ChevronDown size={14} className="text-gray-400" />
                              ) : (
                                <ChevronRight size={14} className="text-gray-400" />
                              )}
                              {isSpecial ? (
                                <Archive size={14} className="text-yellow-600" />
                              ) : (
                                <User size={14} className="text-[var(--color-busia-green)]" />
                              )}
                              <span className={`text-sm ${isSpecial ? "italic text-gray-500" : "font-medium text-gray-900"}`}>
                                {holder.label}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              {holder.items.length} item{holder.items.length === 1 ? "" : "s"}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="overflow-x-auto mb-2">
                              <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Asset Tag</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Item Type</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Brand / Model</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Serial Number</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Condition</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
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
              </div>
            );
          })}

          {departments.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500 italic">No equipment found matching criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
