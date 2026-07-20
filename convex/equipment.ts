import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to resolve foreign keys for an asset
async function resolveAssetRelations(ctx: any, asset: any) {
  const department = await ctx.db.get(asset.departmentId);
  const category = await ctx.db.get(asset.categoryId);
  let employee = null;
  if (asset.currentEmployeeId) {
    employee = await ctx.db.get(asset.currentEmployeeId);
  }

  return {
    ...asset,
    id: asset.assetTag, // Use tag as the primary UI identifier
    tag: asset.assetTag,
    serial: asset.serialNumber,
    department: department?.name || "Unknown",
    category: category?.name || "Unknown",
    brand: asset.brandModel,
    holder: employee ? employee.fullName : null,
  };
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const assets = await ctx.db.query("equipment").collect();
    return Promise.all(assets.map(a => resolveAssetRelations(ctx, a)));
  },
});

export const getByTag = query({
  args: { assetTag: v.string() },
  handler: async (ctx, args) => {
    const asset = await ctx.db
      .query("equipment")
      .withIndex("by_assetTag", (q) => q.eq("assetTag", args.assetTag))
      .first();

    if (!asset) return null;
    return await resolveAssetRelations(ctx, asset);
  },
});

export const registerAsset = mutation({
  args: {
    assetTag: v.string(),
    serialNumber: v.string(),
    categoryId: v.id("equipmentCategories"),
    brandModel: v.string(),
    departmentId: v.id("departments"),
    condition: v.union(v.literal("good"), v.literal("fair"), v.literal("poor"), v.literal("faulty")),
    employeeId: v.optional(v.union(v.id("employees"), v.literal("unassigned"), v.literal("shared"))),
    locationRoom: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const isAssignedToEmployee = args.employeeId && args.employeeId !== "unassigned" && args.employeeId !== "shared";
    const isShared = args.employeeId === "shared";
    const status = (isAssignedToEmployee || isShared) ? "active" : "in_storage";

    const equipmentId = await ctx.db.insert("equipment", {
      assetTag: args.assetTag,
      serialNumber: args.serialNumber,
      categoryId: args.categoryId,
      brandModel: args.brandModel,
      departmentId: args.departmentId,
      currentEmployeeId: isAssignedToEmployee ? (args.employeeId as any) : undefined,
      status: status,
      condition: args.condition,
      locationRoom: args.locationRoom,
      notes: args.notes,
      dateRegistered: now,
      lastUpdated: now,
    });

    if (isAssignedToEmployee) {
      await ctx.db.insert("assignments", {
        equipmentId,
        employeeId: args.employeeId as any,
        departmentId: args.departmentId,
        assignedDate: now,
        reason: "new_assignment",
        loggedBy: "system", // Will be replaced by actual user ID later
      });
    }

    await ctx.db.insert("auditLog", {
      action: "equipment_registered",
      entityType: "equipment",
      entityId: equipmentId,
      performedBy: "system",
      departmentId: args.departmentId,
      details: `Registered ${args.assetTag} (${isAssignedToEmployee ? "Assigned" : isShared ? "Shared" : "Unassigned"})`,
      timestamp: now,
    });

    return equipmentId;
  },
});

export const reassignAsset = mutation({
  args: {
    assetTag: v.string(),
    newEmployeeId: v.id("employees"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const asset = await ctx.db
      .query("equipment")
      .withIndex("by_assetTag", (q) => q.eq("assetTag", args.assetTag))
      .first();

    if (!asset) throw new Error("Asset not found");

    // Close previous assignment if it exists
    if (asset.currentEmployeeId) {
      const activeAssignment = await ctx.db
        .query("assignments")
        .withIndex("by_equipment", (q) => q.eq("equipmentId", asset._id))
        .filter((q) => q.eq(q.field("returnedDate"), undefined))
        .first();

      if (activeAssignment) {
        await ctx.db.patch(activeAssignment._id, { returnedDate: now });
      }
    }

    // Create new assignment
    await ctx.db.insert("assignments", {
      equipmentId: asset._id,
      employeeId: args.newEmployeeId,
      departmentId: asset.departmentId,
      assignedDate: now,
      reason: "reassignment",
      loggedBy: "system",
      notes: args.notes,
    });

    // Update equipment
    await ctx.db.patch(asset._id, {
      currentEmployeeId: args.newEmployeeId,
      status: "active",
      lastUpdated: now,
    });

    return asset._id;
  },
});

export const returnToStore = mutation({
  args: {
    assetTag: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const asset = await ctx.db
      .query("equipment")
      .withIndex("by_assetTag", (q) => q.eq("assetTag", args.assetTag))
      .first();

    if (!asset) throw new Error("Asset not found");

    // Close previous assignment
    if (asset.currentEmployeeId) {
      const activeAssignment = await ctx.db
        .query("assignments")
        .withIndex("by_equipment", (q) => q.eq("equipmentId", asset._id))
        .filter((q) => q.eq(q.field("returnedDate"), undefined))
        .first();

      if (activeAssignment) {
        await ctx.db.patch(activeAssignment._id, { returnedDate: now });
      }
    }

    // Update equipment
    await ctx.db.patch(asset._id, {
      currentEmployeeId: undefined,
      status: "in_storage",
      lastUpdated: now,
    });

    return asset._id;
  },
});
