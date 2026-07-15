import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getHistory = query({
  args: { assetTag: v.string() },
  handler: async (ctx, args) => {
    const asset = await ctx.db
      .query("equipment")
      .withIndex("by_assetTag", (q) => q.eq("assetTag", args.assetTag))
      .first();

    if (!asset) return [];

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_equipment", (q) => q.eq("equipmentId", asset._id))
      .collect();

    // Sort descending by assignedDate
    assignments.sort((a, b) => b.assignedDate - a.assignedDate);

    // Resolve employee names
    return Promise.all(
      assignments.map(async (a) => {
        const employee = await ctx.db.get(a.employeeId);
        return {
          id: a._id,
          date: new Date(a.assignedDate).toLocaleDateString(),
          action: a.reason,
          assignedTo: employee ? employee.fullName : "Unknown",
          returnedDate: a.returnedDate,
        };
      })
    );
  },
});
