import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Sort by name alphabetically in memory (fast enough for 11 departments)
    const departments = await ctx.db.query("departments").collect();
    return departments.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    location: v.string(),
    headOfDepartment: v.optional(v.string()),
    procurementOfficer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("departments", {
      name: args.name,
      code: args.code,
      location: args.location,
      headOfDepartment: args.headOfDepartment,
      procurementOfficer: args.procurementOfficer,
    });
  }
});

export const getDepartmentDashboardData = query({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.id);
    if (!department) throw new Error("Department not found");

    // Fetch all employees in this department
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_department", (q) => q.eq("departmentId", args.id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Fetch all equipment in this department
    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_department", (q) => q.eq("departmentId", args.id))
      .collect();

    // Fetch all categories for quick lookup
    const categories = await ctx.db.query("equipmentCategories").collect();
    const categoryMap = new Map(categories.map((c) => [c._id, c.name]));

    // Enhance equipment with category names
    const enhancedEquipment = equipment.map((eq) => ({
      ...eq,
      categoryName: categoryMap.get(eq.categoryId) || "Unknown",
    }));

    // Grouping
    const sharedAssets = enhancedEquipment.filter((eq) => !eq.currentEmployeeId && eq.status === "active");
    const storageAssets = enhancedEquipment.filter((eq) => !eq.currentEmployeeId && eq.status === "in_storage");

    // Map equipment to employees
    const employeesWithAssets = employees.map((emp) => {
      const assignedAssets = enhancedEquipment.filter((eq) => eq.currentEmployeeId === emp._id);
      return {
        ...emp,
        assets: assignedAssets,
      };
    });

    // Sort employees alphabetically
    employeesWithAssets.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return {
      department,
      employees: employeesWithAssets,
      sharedAssets,
      storageAssets,
    };
  }
});
