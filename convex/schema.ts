import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  departments: defineTable({
    name: v.string(),
    code: v.string(),        // short code, e.g. "ICT", "HLT"
    location: v.string(),
    headOfDepartment: v.optional(v.string()),
    procurementOfficer: v.optional(v.string()),
  }).index("by_code", ["code"]),

  adminAccounts: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    lastLogin: v.optional(v.number()),
  }).index("by_email", ["email"]),

  departmentAccounts: defineTable({
    departmentId: v.id("departments"),
    email: v.string(),           
    passwordHash: v.string(),
    mustChangePassword: v.boolean(),
    lastLogin: v.optional(v.number()),
    role: v.optional(v.union(v.literal("hod"), v.literal("procurement"))),
  }).index("by_email", ["email"])
    .index("by_department", ["departmentId"]),

  employees: defineTable({
    fullName: v.string(),
    designation: v.string(),
    departmentId: v.id("departments"),
    employeeNumber: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")), 
  }).index("by_department", ["departmentId"]),

  equipmentCategories: defineTable({
    name: v.string(),        
  }),

  equipment: defineTable({
    assetTag: v.string(),           
    serialNumber: v.string(),       
    categoryId: v.id("equipmentCategories"),
    brandModel: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),      
    currentEmployeeId: v.optional(v.id("employees")), 
    status: v.union(
      v.literal("active"),
      v.literal("in_repair"),
      v.literal("in_storage"),
      v.literal("retired"),
      v.literal("lost"),
      v.literal("disposed")
    ),
    condition: v.union(v.literal("good"), v.literal("fair"), v.literal("poor"), v.literal("faulty")),
    locationRoom: v.optional(v.string()),
    notes: v.optional(v.string()),
    dateRegistered: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_department", ["departmentId"])
    .index("by_serial", ["serialNumber"])
    .index("by_assetTag", ["assetTag"])
    .index("by_employee", ["currentEmployeeId"]),

  assignments: defineTable({
    equipmentId: v.id("equipment"),
    employeeId: v.id("employees"),
    departmentId: v.id("departments"),
    assignedDate: v.number(),
    returnedDate: v.optional(v.number()),   
    reason: v.union(
      v.literal("new_assignment"),
      v.literal("transfer"),
      v.literal("employee_exit"),
      v.literal("repair_return"),
      v.literal("reassignment")
    ),
    loggedBy: v.string(),   
    notes: v.optional(v.string()),
  })
    .index("by_equipment", ["equipmentId"])
    .index("by_employee", ["employeeId"])
    .index("by_department", ["departmentId"]),

  auditLog: defineTable({
    action: v.string(),          
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.string(),     
    departmentId: v.optional(v.id("departments")),
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
