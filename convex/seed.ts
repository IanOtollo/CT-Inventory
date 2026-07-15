import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
    const departments = [
      { code: "EDU", name: "Education And Industrial Skills Development", location: "Hq" },
      { code: "HLT", name: "Health And Sanitation", location: "BSA-County Referral" },
      { code: "LND", name: "Lands, Housing & Urban Development", location: "CBD-Victoria Plaza" },
      { code: "PSM", name: "Public Service Management & Governance", location: "Hq & Victoria Plaza" },
      { code: "AGR", name: "Smart Agric, Livestock, Fisheries, Blue Economy", location: "ATC" },
      { code: "ICT", name: "Strategic Partnership, ICT & Digital Economy", location: "Hq & Pramukh" },
      { code: "TRE", name: "The County Treasury & Economic Planning", location: "Hq" },
      { code: "TRD", name: "Trade, Investment, Industrialization, Co-op & SME", location: "Behind County Assembly" },
      { code: "TRP", name: "Transport, Roads & Public Works", location: "Public Works" },
      { code: "WTR", name: "Water, Irrigation, Environment, Natural Resources, Climate Change & Energy", location: "CBD Water" },
      { code: "YTH", name: "Youth, Sports, Tourism, Culture, Social Protection, Gender Affairs & Creative Arts", location: "CBD" },
    ];

    for (const dept of departments) {
      const existing = await ctx.db
        .query("departments")
        .withIndex("by_code", (q) => q.eq("code", dept.code))
        .first();
      if (!existing) {
        await ctx.db.insert("departments", dept);
      }
    }

    const categories = [
      "Laptop", "Desktop Computer", "Monitor", "Mouse", "Keyboard", 
      "Printer", "Projector", "UPS", "Router/Switch", "Scanner", "Other"
    ];

    for (const catName of categories) {
      const existing = await ctx.db
        .query("equipmentCategories")
        .filter((q) => q.eq(q.field("name"), catName))
        .first();
      if (!existing) {
        await ctx.db.insert("equipmentCategories", { name: catName });
      }
    }
  },
});
