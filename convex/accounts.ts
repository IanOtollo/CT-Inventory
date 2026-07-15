import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("departmentAccounts").collect();
    
    return Promise.all(
      accounts.map(async (acc) => {
        const dept = await ctx.db.get(acc.departmentId);
        return {
          id: acc._id,
          email: acc.email,
          departmentName: dept?.name || "Unknown",
          departmentCode: dept?.code || "Unknown",
          active: true, // Mocking active status since it's not in schema
          lastLogin: acc.lastLogin ? new Date(acc.lastLogin).toLocaleDateString() : null,
        };
      })
    );
  },
});

export const getAccountDetails = query({
  args: { accountId: v.id("departmentAccounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) return null;
    const department = await ctx.db.get(account.departmentId);
    return {
      email: account.email,
      departmentName: department?.name || "Unknown",
      departmentCode: department?.code || "Unknown",
    };
  }
});

export const create = mutation({
  args: {
    departmentId: v.id("departments"),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real production system we'd hash the password here
    return await ctx.db.insert("departmentAccounts", {
      departmentId: args.departmentId,
      email: args.email,
      passwordHash: bcrypt.hashSync(args.password, 10), // NOT SECURE - just for prototype parity
      mustChangePassword: true,
    });
  },
});

export const toggleStatus = mutation({
  args: { accountId: v.id("departmentAccounts") },
  handler: async (ctx, args) => {
    // Since status isn't in schema, this is a no-op for now
    // In real app, we'd add an active:boolean to the schema and toggle it
    return args.accountId;
  },
});
