import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    searchTerm: v.optional(v.string()),
    actionFilter: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    userFilter: v.optional(v.string()),
    departmentFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sort = args.sortOrder === "asc" ? "asc" : "desc";
    let logs = await ctx.db
      .query("auditLog")
      .withIndex("by_timestamp")
      .order(sort)
      .take(500);
      
    // Fetch departments for mapping
    const deps = await ctx.db.query("departments").collect();
    const deptMap = new Map(deps.map(d => [d._id, d.code]));

    let results = logs.map(log => ({
      id: log._id,
      timestamp: new Date(log.timestamp).toLocaleString(),
      action: log.action,
      entityId: log.entityId,
      performedBy: log.performedBy,
      department: log.departmentId ? (deptMap.get(log.departmentId) || "Unknown") : "System",
      details: log.details || "",
    }));

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      results = results.filter(log => 
        log.entityId.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.performedBy.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term)
      );
    }

    if (args.actionFilter && args.actionFilter !== "All") {
      results = results.filter(log => log.action === args.actionFilter);
    }

    if (args.userFilter && args.userFilter.trim() !== "") {
      const u = args.userFilter.toLowerCase();
      results = results.filter(log => log.performedBy.toLowerCase().includes(u));
    }

    if (args.departmentFilter && args.departmentFilter !== "All") {
      results = results.filter(log => log.department === args.departmentFilter);
    }

    return results;
  },
});

export const logAction = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.string(),
    departmentId: v.optional(v.id("departments")),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLog", {
      ...args,
      timestamp: Date.now(),
    });
  }
});
