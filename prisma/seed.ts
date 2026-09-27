import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertCategory(
  slug: string,
  name: string,
  sortOrder: number,
  description?: string
) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, sortOrder, description, isActive: true },
    create: { slug, name, sortOrder, description },
  });
}

async function createItem(
  categoryId: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    priceCents: number;
    costCents?: number;
    sortOrder?: number;
    tags?: string[];
    isBuildYourOwn?: boolean;
    prepMinutes?: number;
  }
) {
  return prisma.menuItem.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      costCents: data.costCents ?? Math.round(data.priceCents * 0.35),
      sortOrder: data.sortOrder ?? 0,
      tags: JSON.stringify(data.tags ?? []),
      isBuildYourOwn: data.isBuildYourOwn ?? false,
      prepMinutes: data.prepMinutes ?? 12,
      isActive: true,
      categoryId,
    },
    create: {
      categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      priceCents: data.priceCents,
      costCents: data.costCents ?? Math.round(data.priceCents * 0.35),
      sortOrder: data.sortOrder ?? 0,
      tags: JSON.stringify(data.tags ?? []),
      isBuildYourOwn: data.isBuildYourOwn ?? false,
      prepMinutes: data.prepMinutes ?? 12,
    },
  });
}

async function upsertInventory(
  name: string,
  qty: number,
  cost: number,
  unit: string = "PORTION",
  reorder = 15
) {
  const sku = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return prisma.inventoryItem.upsert({
    where: { sku },
    update: {
      name,
      quantityOnHand: qty,
      costPerUnitCents: cost,
      unit,
      reorderLevel: reorder,
      isActive: true,
    },
    create: {
      name,
      sku,
      quantityOnHand: qty,
      costPerUnitCents: cost,
      unit,
      reorderLevel: reorder,
    },
  });
}

async function main() {
  // Clean relational seed targets that lack stable unique keys
  await prisma.menuItemModifier.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.dealOption.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.recipeComponent.deleteMany();

  const password = process.env.ADMIN_PASSWORD || "fusion-admin-2024";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@primefusion.com" },
    update: { passwordHash, role: "ADMIN", name: process.env.ADMIN_NAME || "Admin" },
    create: {
      email: process.env.ADMIN_EMAIL || "admin@primefusion.com",
      name: process.env.ADMIN_NAME || "Prime Fusion Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "kitchen@primefusion.com" },
    update: {},
    create: {
      email: "kitchen@primefusion.com",
      name: "Kitchen Staff",
      passwordHash: await bcrypt.hash("kitchen-2024", 10),
      role: "STAFF",
    },
  });

  await prisma.taxSetting.deleteMany();
  await prisma.taxSetting.create({
    data: {
      name: "Sales Tax",
      rateBps: Math.round(parseFloat(process.env.DEFAULT_TAX_RATE || "7.5") * 100),
      jurisdiction: "Local",
    },
  });

  const settings: Record<string, string> = {
    business_name: "Prime Fusion",
    tagline: "Jamaican Fusion, Your Way.",
    reward_points_per_dollar: process.env.REWARD_POINTS_PER_DOLLAR || "1",
    reward_redeem_points: process.env.REWARD_REDEEM_POINTS || "100",
    reward_redeem_dollars: process.env.REWARD_REDEEM_DOLLARS || "5",
    sms_enabled: "true",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Inventory staples shared across bowls
  const inv = {
    ricePeas: await upsertInventory("Rice & Peas", 80, 120),
    coleslaw: await upsertInventory("Jamaican Coleslaw", 70, 80),
    macCheese: await upsertInventory("Mac & Cheese", 50, 150),
    plantains: await upsertInventory("Fried Plantains", 60, 90),
    friedRice: await upsertInventory("Fried Rice Base", 40, 100),
    rastaPasta: await upsertInventory("Rasta Pasta Base", 45, 200),
    fries: await upsertInventory("Fries", 55, 70),
    jerkChicken: await upsertInventory("Jerk Chicken", 40, 350, "PORTION", 8),
    oxtail: await upsertInventory("Braised Oxtail", 25, 700, "PORTION", 5),
    pepperSteak: await upsertInventory("Pepper Steak", 30, 450, "PORTION", 6),
    salmon: await upsertInventory("Mango Glazed Salmon", 28, 550, "PORTION", 6),
    shrimp: await upsertInventory("Shrimp", 30, 480, "PORTION", 6),
    jerkPork: await upsertInventory("Jerk Pork", 30, 400, "PORTION", 6),
    bbqChicken: await upsertInventory("BBQ Fried Chicken", 35, 320, "PORTION", 6),
    wings: await upsertInventory("Chicken Wings", 120, 90, "EACH", 24),
    chickenEmp: await upsertInventory("Chicken Empanada", 40, 120, "EACH", 10),
    beefEmp: await upsertInventory("Beef Empanada", 40, 130, "EACH", 10),
    fruitPunch: await upsertInventory("Fruit Punch", 60, 80, "EACH", 12),
    soup: await upsertInventory("Soup Base", 20, 200, "PORTION", 5),
    porridge: await upsertInventory("Porridge Base", 20, 150, "PORTION", 5),
  };

  const bowls = await upsertCategory(
    "signature-bowls",
    "Signature Fusion Bowls",
    1,
    "Protein + base + sides. Big flavor every bite."
  );
  const byo = await upsertCategory(
    "build-your-bowl",
    "Build Your Fusion Bowl",
    2,
    "1 protein $15 · 2 proteins $25. Jamaican fusion, your way."
  );
  const pasta = await upsertCategory("rasta-pasta", "Rasta Pasta", 3, "Creamy Caribbean pasta.");
  const wings = await upsertCategory("wings", "Prime Fusion Wings", 4, "Jerk-forward wing flavors.");
  const empanadas = await upsertCategory("empanadas", "Empanadas", 5, "Mix & match bundles.");
  const sides = await upsertCategory("sides", "Sides", 6);
  const drinks = await upsertCategory("drinks", "Drinks", 7);
  const extras = await upsertCategory("extras", "More Favorites", 8);
  const deals = await upsertCategory("deals", "Prime Fusion Deals", 9, "Combos that hit different.");

  const bowlItems = [
    await createItem(bowls.id, {
      name: "Jerk Chicken Fried Rice Bowl",
      slug: "jerk-chicken-fried-rice-bowl",
      description: "Jerk chicken, fried rice, Jamaican coleslaw, plantains.",
      priceCents: 1500,
      costCents: 520,
      sortOrder: 1,
      tags: ["signature", "chicken"],
    }),
    await createItem(bowls.id, {
      name: "Oxtail Bowl",
      slug: "oxtail-bowl",
      description: "Braised oxtail, rice & peas, mac & cheese, Jamaican coleslaw, plantains.",
      priceCents: 2000,
      costCents: 920,
      sortOrder: 2,
      tags: ["signature", "premium"],
      prepMinutes: 15,
    }),
    await createItem(bowls.id, {
      name: "Pepper Steak Bowl",
      slug: "pepper-steak-bowl",
      description: "Pepper steak, rice & peas, Jamaican coleslaw, plantains.",
      priceCents: 1700,
      costCents: 680,
      sortOrder: 3,
      tags: ["signature"],
    }),
    await createItem(bowls.id, {
      name: "Mango Glazed Salmon Bites Bowl",
      slug: "mango-glazed-salmon-bowl",
      description: "Mango-glazed salmon bites, rice & peas, Jamaican coleslaw, plantains.",
      priceCents: 1800,
      costCents: 780,
      sortOrder: 4,
      tags: ["signature", "seafood"],
    }),
    await createItem(bowls.id, {
      name: "Jerk Chicken Bowl",
      slug: "jerk-chicken-bowl",
      description: "Jerk chicken, rice & peas, mac & cheese, Jamaican coleslaw, plantains.",
      priceCents: 1500,
      costCents: 540,
      sortOrder: 5,
      tags: ["signature", "chicken"],
    }),
  ];

  const byoOne = await createItem(byo.id, {
    name: "1 Protein Fusion Bowl",
    slug: "fusion-bowl-1-protein",
    description: "Pick one protein + sides. Oxtails, Salmon, BBQ Fried Chicken, Jerk Pork, or Jerk Chicken.",
    priceCents: 1500,
    costCents: 550,
    isBuildYourOwn: true,
    sortOrder: 1,
    tags: ["build", "custom"],
  });
  const byoTwo = await createItem(byo.id, {
    name: "2 Protein Fusion Bowl",
    slug: "fusion-bowl-2-protein",
    description: "Pick two proteins + sides for the full fusion experience.",
    priceCents: 2500,
    costCents: 950,
    isBuildYourOwn: true,
    sortOrder: 2,
    tags: ["build", "custom"],
  });

  // Modifier groups for BYO
  const proteinGroup = await prisma.modifierGroup.create({
    data: {
      name: "Proteins",
      minSelect: 1,
      maxSelect: 2,
      isRequired: true,
      options: {
        create: [
          { name: "Oxtails", priceDeltaCents: 0, costDeltaCents: 700, inventoryItemId: inv.oxtail.id },
          { name: "Salmon", priceDeltaCents: 0, costDeltaCents: 550, inventoryItemId: inv.salmon.id },
          { name: "BBQ Fried Chicken", priceDeltaCents: 0, costDeltaCents: 320, inventoryItemId: inv.bbqChicken.id },
          { name: "Jerk Pork", priceDeltaCents: 0, costDeltaCents: 400, inventoryItemId: inv.jerkPork.id },
          { name: "Jerk Chicken", priceDeltaCents: 0, costDeltaCents: 350, inventoryItemId: inv.jerkChicken.id, isDefault: true },
        ],
      },
    },
  });
  const sideGroup = await prisma.modifierGroup.create({
    data: {
      name: "Sides",
      minSelect: 1,
      maxSelect: 3,
      isRequired: true,
      options: {
        create: [
          { name: "Rice & Peas", priceDeltaCents: 0, costDeltaCents: 120, inventoryItemId: inv.ricePeas.id, isDefault: true },
          { name: "Jamaican Coleslaw", priceDeltaCents: 0, costDeltaCents: 80, inventoryItemId: inv.coleslaw.id },
          { name: "Rasta Pasta", priceDeltaCents: 200, costDeltaCents: 200, inventoryItemId: inv.rastaPasta.id },
        ],
      },
    },
  });

  for (const item of [byoOne, byoTwo]) {
    for (const groupId of [proteinGroup.id, sideGroup.id]) {
      await prisma.menuItemModifier.create({
        data: { menuItemId: item.id, groupId },
      });
    }
  }

  // Fix maxSelect for 1 vs 2 protein
  await prisma.modifierGroup.update({
    where: { id: proteinGroup.id },
    data: { maxSelect: 2 },
  });

  const pastaItems = [
    await createItem(pasta.id, {
      name: "Jerk Chicken Rasta Pasta",
      slug: "jerk-chicken-rasta-pasta",
      priceCents: 1600,
      costCents: 560,
      sortOrder: 1,
    }),
    await createItem(pasta.id, {
      name: "Shrimp Rasta Pasta",
      slug: "shrimp-rasta-pasta",
      priceCents: 1800,
      costCents: 700,
      sortOrder: 2,
    }),
    await createItem(pasta.id, {
      name: "Salmon Rasta Pasta",
      slug: "salmon-rasta-pasta",
      priceCents: 1900,
      costCents: 760,
      sortOrder: 3,
    }),
    await createItem(pasta.id, {
      name: "Chicken & Shrimp Rasta Pasta",
      slug: "chicken-shrimp-rasta-pasta",
      priceCents: 2000,
      costCents: 820,
      sortOrder: 4,
    }),
  ];

  const wingFlavorGroup = await prisma.modifierGroup.create({
    data: {
      name: "Wing Flavor",
      minSelect: 1,
      maxSelect: 1,
      isRequired: true,
      options: {
        create: [
          { name: "Jerk", isDefault: true },
          { name: "Mango Jerk" },
          { name: "Sweet & Spicy Jamaican" },
          { name: "BBQ Jerk" },
        ],
      },
    },
  });

  const wingSizes = [
    await createItem(wings.id, {
      name: "Wings (6 pc)",
      slug: "wings-6",
      description: "Starting at $12. Choose your flavor.",
      priceCents: 1200,
      costCents: 480,
      sortOrder: 1,
    }),
    await createItem(wings.id, {
      name: "Wings (10 pc)",
      slug: "wings-10",
      priceCents: 1800,
      costCents: 780,
      sortOrder: 2,
    }),
    await createItem(wings.id, {
      name: "Wings (20 pc)",
      slug: "wings-20",
      priceCents: 3400,
      costCents: 1500,
      sortOrder: 3,
    }),
    await createItem(wings.id, {
      name: "Wing Combo",
      slug: "wing-combo",
      description: "6 wings + fries + Jamaican coleslaw + Fruit Punch.",
      priceCents: 1800,
      costCents: 720,
      sortOrder: 4,
      tags: ["combo"],
    }),
  ];
  for (const w of wingSizes) {
    await prisma.menuItemModifier.create({
      data: { menuItemId: w.id, groupId: wingFlavorGroup.id },
    });
  }

  await createItem(empanadas.id, {
    name: "Chicken Empanada",
    slug: "chicken-empanada",
    priceCents: 400,
    costCents: 140,
    sortOrder: 1,
  });
  await createItem(empanadas.id, {
    name: "Beef Empanada",
    slug: "beef-empanada",
    priceCents: 400,
    costCents: 150,
    sortOrder: 2,
  });
  await createItem(empanadas.id, {
    name: "Empanada Bundle — 2 for $7",
    slug: "empanada-bundle-2",
    description: "Mix & match any 2 empanadas.",
    priceCents: 700,
    costCents: 280,
    sortOrder: 3,
    tags: ["bundle"],
  });
  await createItem(empanadas.id, {
    name: "Empanada Bundle — 3 for $10",
    slug: "empanada-bundle-3",
    priceCents: 1000,
    costCents: 420,
    sortOrder: 4,
    tags: ["bundle"],
  });
  await createItem(empanadas.id, {
    name: "Empanada Bundle — 6 for $18",
    slug: "empanada-bundle-6",
    priceCents: 1800,
    costCents: 780,
    sortOrder: 5,
    tags: ["bundle"],
  });

  await createItem(sides.id, { name: "Rice & Peas", slug: "side-rice-peas", priceCents: 500, costCents: 120, sortOrder: 1 });
  await createItem(sides.id, { name: "Jamaican Coleslaw", slug: "side-coleslaw", priceCents: 400, costCents: 80, sortOrder: 2 });
  await createItem(sides.id, { name: "Rasta Pasta (side)", slug: "side-rasta-pasta", priceCents: 700, costCents: 220, sortOrder: 3 });
  await createItem(sides.id, { name: "Mac & Cheese", slug: "side-mac-cheese", priceCents: 600, costCents: 160, sortOrder: 4 });
  await createItem(sides.id, { name: "Fried Plantains", slug: "side-plantains", priceCents: 400, costCents: 90, sortOrder: 5 });

  await createItem(drinks.id, {
    name: "Prime Fusion Fruit Punch",
    slug: "fruit-punch",
    description: "Jamaican-style tropical fruit punch.",
    priceCents: 500,
    costCents: 90,
    sortOrder: 1,
  });

  await createItem(extras.id, { name: "Soup Bowl", slug: "soup-bowl", priceCents: 1000, costCents: 280, sortOrder: 1 });
  await createItem(extras.id, { name: "Porridge Bowl", slug: "porridge-bowl", priceCents: 800, costCents: 200, sortOrder: 2 });
  await createItem(extras.id, {
    name: "Jerk Chicken Fry Rice",
    slug: "jerk-chicken-fry-rice",
    priceCents: 1200,
    costCents: 420,
    sortOrder: 3,
  });

  // Deals as menu items for simple ordering + Deal records for admin
  const deal2Bowls = await createItem(deals.id, {
    name: "2 Bowls Deal",
    slug: "deal-2-bowls",
    description: "Any 2 bowls from the signature list for $25.",
    priceCents: 2500,
    costCents: 1100,
    sortOrder: 1,
    tags: ["deal"],
  });
  await createItem(deals.id, {
    name: "2 Premium Bowls",
    slug: "deal-2-premium-bowls",
    description: "Pepper Steak, Mango Glazed Salmon, or Oxtail — pick 2 for $30.",
    priceCents: 3000,
    costCents: 1500,
    sortOrder: 2,
    tags: ["deal"],
  });
  await createItem(deals.id, {
    name: "Bowl Combo",
    slug: "deal-bowl-combo",
    description: "1 bowl + 1 empanada + fruit punch.",
    priceCents: 2000,
    costCents: 800,
    sortOrder: 3,
    tags: ["deal"],
  });
  await createItem(deals.id, {
    name: "Full Fusion Combo",
    slug: "deal-full-fusion",
    description: "2 bowls + 2 empanadas + 2 fruit punches.",
    priceCents: 3500,
    costCents: 1500,
    sortOrder: 4,
    tags: ["deal"],
  });

  await prisma.deal.upsert({
    where: { slug: "two-bowls-25" },
    update: { priceCents: 2500, isActive: true },
    create: {
      name: "2 Bowls for $25",
      slug: "two-bowls-25",
      description: "Choose any 2 signature bowls.",
      priceCents: 2500,
      rulesJson: JSON.stringify({ type: "pick_n", count: 2, categorySlugs: ["signature-bowls"] }),
      options: {
        create: bowlItems.map((b) => ({ menuItemId: b.id })),
      },
    },
  });

  // Recipes for signature bowls (inventory deduction)
  const recipes: Array<{ itemId: string; components: Array<{ invId: string; qty: number }> }> = [
    {
      itemId: bowlItems[0].id,
      components: [
        { invId: inv.jerkChicken.id, qty: 1 },
        { invId: inv.friedRice.id, qty: 1 },
        { invId: inv.coleslaw.id, qty: 1 },
        { invId: inv.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[1].id,
      components: [
        { invId: inv.oxtail.id, qty: 1 },
        { invId: inv.ricePeas.id, qty: 1 },
        { invId: inv.macCheese.id, qty: 1 },
        { invId: inv.coleslaw.id, qty: 1 },
        { invId: inv.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[2].id,
      components: [
        { invId: inv.pepperSteak.id, qty: 1 },
        { invId: inv.ricePeas.id, qty: 1 },
        { invId: inv.coleslaw.id, qty: 1 },
        { invId: inv.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[3].id,
      components: [
        { invId: inv.salmon.id, qty: 1 },
        { invId: inv.ricePeas.id, qty: 1 },
        { invId: inv.coleslaw.id, qty: 1 },
        { invId: inv.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[4].id,
      components: [
        { invId: inv.jerkChicken.id, qty: 1 },
        { invId: inv.ricePeas.id, qty: 1 },
        { invId: inv.macCheese.id, qty: 1 },
        { invId: inv.coleslaw.id, qty: 1 },
        { invId: inv.plantains.id, qty: 1 },
      ],
    },
  ];

  for (const r of recipes) {
    for (const c of r.components) {
      await prisma.recipeComponent.upsert({
        where: {
          menuItemId_inventoryItemId: {
            menuItemId: r.itemId,
            inventoryItemId: c.invId,
          },
        },
        update: { quantityUsed: c.qty },
        create: {
          menuItemId: r.itemId,
          inventoryItemId: c.invId,
          quantityUsed: c.qty,
        },
      });
    }
  }

  // QR stations
  const stations = [
    { code: "truck-window", label: "Truck Window — To-Go", orderType: "TOGO" },
    { code: "picnic-a", label: "Picnic Table A — Dine In", orderType: "DINE_IN" },
    { code: "picnic-b", label: "Picnic Table B — Dine In", orderType: "DINE_IN" },
    { code: "catering-prep", label: "Catering Pickup", orderType: "TOGO" },
  ];
  for (const s of stations) {
    await prisma.qrStation.upsert({
      where: { code: s.code },
      update: { label: s.label, orderType: s.orderType, isActive: true },
      create: s,
    });
  }

  // Sample loyalty customer
  const customer = await prisma.user.upsert({
    where: { phone: "+15555550100" },
    update: {},
    create: {
      phone: "+15555550100",
      name: "Demo Guest",
      role: "CUSTOMER",
    },
  });
  await prisma.rewardAccount.upsert({
    where: { phone: "+15555550100" },
    update: { points: 120, lifetimePts: 320 },
    create: {
      userId: customer.id,
      phone: "+15555550100",
      points: 120,
      lifetimePts: 320,
    },
  });

  console.log("Seeded Prime Fusion menu, inventory, QR stations, and admin users.");
  console.log(`Admin: ${process.env.ADMIN_EMAIL || "admin@primefusion.com"} / ${password}`);
  console.log("Kitchen: kitchen@primefusion.com / kitchen-2024");
  void pastaItems;
  void deal2Bowls;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
