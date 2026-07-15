import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import bcrypt from "bcryptjs";

// Note: In a real production system, consider using a more robust auth provider or 
// secure session cookies. For this implementation, we are following the specified 
// requirement of custom passcode/credential auth via Convex.

export const loginAdmin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const inputEmail = args.email.toLowerCase();
    
    // Check if any admin account exists at all
    const allAdmins = await ctx.db.query("adminAccounts").collect();
    
    // Auto-initialize default admin if table is empty
    if (allAdmins.length === 0) {
      const defaultHash = bcrypt.hashSync("123456", 10);
      await ctx.db.insert("adminAccounts", {
        email: "admin@busia.go.ke",
        passwordHash: defaultHash,
      });
    }

    const adminAccount = await ctx.db
      .query("adminAccounts")
      .withIndex("by_email", (q) => q.eq("email", inputEmail))
      .first();

    if (!adminAccount) {
      return { success: false, error: "Invalid admin credentials" };
    }

    const isValid = bcrypt.compareSync(args.password, adminAccount.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid admin credentials" };
    }

    // Update last login
    await ctx.db.patch(adminAccount._id, { lastLogin: Date.now() });

    // Return session token and ID
    return {
      success: true,
      token: `admin-session-${adminAccount._id}`, 
      role: "admin",
      accountId: adminAccount._id
    };
  },
});

export const loginDepartment = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const departmentAccount = await ctx.db
      .query("departmentAccounts")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!departmentAccount) {
      return { success: false, error: "Invalid department credentials" };
    }

    const isValid = bcrypt.compareSync(args.password, departmentAccount.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid department credentials" };
    }

    // Update last login
    await ctx.db.patch(departmentAccount._id, { lastLogin: Date.now() });

    return {
      success: true,
      token: `dept-session-${departmentAccount._id}`,
      role: "department",
      departmentId: departmentAccount.departmentId,
      accountId: departmentAccount._id,
      mustChangePassword: departmentAccount.mustChangePassword
    };
  },
});

export const updateCredentials = mutation({
  args: {
    accountId: v.id("departmentAccounts"),
    currentPassword: v.string(),
    newEmail: v.optional(v.string()),
    newPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new ConvexError("Account not found");

    const isValid = bcrypt.compareSync(args.currentPassword, account.passwordHash);
    if (!isValid) {
      throw new ConvexError("Incorrect current password");
    }

    const updates: any = { mustChangePassword: false };
    
    if (args.newEmail) {
      // Check if email is taken by another account
      const existing = await ctx.db
        .query("departmentAccounts")
        .withIndex("by_email", (q) => q.eq("email", args.newEmail!.toLowerCase()))
        .first();
      if (existing && existing._id !== args.accountId) {
        throw new ConvexError("Email is already in use by another account");
      }
      updates.email = args.newEmail.toLowerCase();
    }

    if (args.newPassword) {
      updates.passwordHash = bcrypt.hashSync(args.newPassword, 10);
    }

    await ctx.db.patch(args.accountId, updates);
    return true;
  }
});

export const updateAdminCredentials = mutation({
  args: {
    accountId: v.id("adminAccounts"),
    currentPassword: v.string(),
    newEmail: v.optional(v.string()),
    newPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new ConvexError("Account not found");

    const isValid = bcrypt.compareSync(args.currentPassword, account.passwordHash);
    if (!isValid) {
      throw new ConvexError("Incorrect current password");
    }

    const updates: any = {};
    
    if (args.newEmail) {
      // Check if email is taken by another account
      const existing = await ctx.db
        .query("adminAccounts")
        .withIndex("by_email", (q) => q.eq("email", args.newEmail!.toLowerCase()))
        .first();
      if (existing && existing._id !== args.accountId) {
        throw new ConvexError("Email is already in use by another account");
      }
      updates.email = args.newEmail.toLowerCase();
    }

    if (args.newPassword) {
      updates.passwordHash = bcrypt.hashSync(args.newPassword, 10);
    }

    await ctx.db.patch(args.accountId, updates);
    return true;
  }
});
