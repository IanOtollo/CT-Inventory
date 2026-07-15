import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDepartment = query({
  args: { departmentId: v.optional(v.id("departments")) },
  handler: async (ctx, args) => {
    if (!args.departmentId) return [];
    
    return await ctx.db
      .query("employees")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId!))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const create = mutation({
  args: {
    departmentId: v.id("departments"),
    name: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("employees", {
      departmentId: args.departmentId,
      fullName: args.name,
      designation: args.title,
      status: "active",
    });
  },
});
