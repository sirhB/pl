import bcrypt from "bcryptjs";
import { cuid, getDb, nowIso, replaceDb, saveDb } from "./db";
import { emptyDatabase, type Database, type InventoryItem, type MenuItem } from "./types";
import { itemImageBySlug } from "../menu-images";

function upsertBy<T extends { id: string }>(
  list: T[],
  match: (row: T) => boolean,
  create: () => T,
  update: (row: T) => T
) {
  const idx = list.findIndex(match);
  if (idx >= 0) {
    list[idx] = update(list[idx]);
    return list[idx];
  }
  const row = create();
  list.push(row);
  return row;
}

export async function seedDatabase(force = false) {
  const existing = getDb();
  if (!force && existing.menuItems.length > 0 && existing.users.some((u) => u.role === "ADMIN")) {
    console.log("Store already seeded — skipping (pass --force to reset).");
    return;
  }

  const db = emptyDatabase();
  const stamp = nowIso();
  const password = process.env.ADMIN_PASSWORD || "fusion-admin-2024";
  const passwordHash = await bcrypt.hash(password, 10);

  db.users.push({
    id: cuid(),
    email: process.env.ADMIN_EMAIL || "admin@primefusion.com",
    name: process.env.ADMIN_NAME || "Prime Fusion Admin",
    passwordHash,
    role: "ADMIN",
    createdAt: stamp,
    updatedAt: stamp,
  });
  db.users.push({
    id: cuid(),
    email: "kitchen@primefusion.com",
    name: "Kitchen Staff",
    passwordHash: await bcrypt.hash("kitchen-2024", 10),
    role: "STAFF",
    createdAt: stamp,
    updatedAt: stamp,
  });

  db.taxSettings.push({
    id: cuid(),
    name: "Sales Tax",
    rateBps: Math.round(parseFloat(process.env.DEFAULT_TAX_RATE || "7.5") * 100),
    isInclusive: false,
    jurisdiction: "Local",
    createdAt: stamp,
    updatedAt: stamp,
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
    db.appSettings.push({ id: cuid(), key, value });
  }

  function inv(
    name: string,
    qty: number,
    cost: number,
    unit = "PORTION",
    reorder = 15
  ): InventoryItem {
    const item: InventoryItem = {
      id: cuid(),
      name,
      sku: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      unit,
      quantityOnHand: qty,
      reorderLevel: reorder,
      costPerUnitCents: cost,
      isActive: true,
    };
    db.inventoryItems.push(item);
    return item;
  }

  const stock = {
    ricePeas: inv("Rice & Peas", 80, 120),
    coleslaw: inv("Jamaican Coleslaw", 70, 80),
    macCheese: inv("Mac & Cheese", 50, 150),
    plantains: inv("Fried Plantains", 60, 90),
    friedRice: inv("Fried Rice Base", 40, 100),
    rastaPasta: inv("Rasta Pasta Base", 45, 200),
    fries: inv("Fries", 55, 70),
    jerkChicken: inv("Jerk Chicken", 40, 350, "PORTION", 8),
    oxtail: inv("Braised Oxtail", 25, 700, "PORTION", 5),
    pepperSteak: inv("Pepper Steak", 30, 450, "PORTION", 6),
    salmon: inv("Mango Glazed Salmon", 28, 550, "PORTION", 6),
    shrimp: inv("Shrimp", 30, 480, "PORTION", 6),
    jerkPork: inv("Jerk Pork", 30, 400, "PORTION", 6),
    bbqChicken: inv("Barbecue Fried Chicken", 35, 320, "PORTION", 6),
    wings: inv("Chicken Wings", 120, 90, "EACH", 24),
    chickenEmp: inv("Chicken Empanada", 40, 120, "EACH", 10),
    beefEmp: inv("Beef Empanada", 40, 130, "EACH", 10),
    fruitPunch: inv("Fruit Punch", 60, 80, "EACH", 12),
    soup: inv("Soup Base", 20, 200, "PORTION", 5),
    porridge: inv("Porridge Base", 20, 150, "PORTION", 5),
  };
  void stock.fries;
  void stock.wings;
  void stock.chickenEmp;
  void stock.beefEmp;
  void stock.fruitPunch;
  void stock.soup;
  void stock.porridge;
  void stock.shrimp;

  function category(slug: string, name: string, sortOrder: number, description?: string) {
    const row = {
      id: cuid(),
      slug,
      name,
      sortOrder,
      description: description || null,
      isActive: true,
    };
    db.categories.push(row);
    return row;
  }

  function item(
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
      imageUrl?: string | null;
    }
  ): MenuItem {
    const row: MenuItem = {
      id: cuid(),
      categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      priceCents: data.priceCents,
      costCents: data.costCents ?? Math.round(data.priceCents * 0.35),
      imageUrl: data.imageUrl ?? itemImageBySlug[data.slug] ?? null,
      isActive: true,
      isBuildYourOwn: data.isBuildYourOwn ?? false,
      allowsModifiers: true,
      prepMinutes: data.prepMinutes ?? 12,
      sortOrder: data.sortOrder ?? 0,
      tags: JSON.stringify(data.tags ?? []),
    };
    db.menuItems.push(row);
    return row;
  }

  const bowls = category(
    "signature-bowls",
    "Signature Fusion Bowls",
    1,
    "Island proteins, rice, and sides — bold flavor in every bite."
  );
  const byo = category(
    "build-your-bowl",
    "Build Your Fusion Bowl",
    2,
    "One protein for $15 · Two proteins for $25. Jamaican fusion, your way."
  );
  const pasta = category("rasta-pasta", "Rasta Pasta", 3, "Creamy Caribbean pasta, cooked to order.");
  const wingsCat = category(
    "wings",
    "Prime Fusion Wings",
    4,
    "Jerk-seasoned wings. Pick one flavor, or two for half and half."
  );
  const empanadas = category("empanadas", "Empanadas", 5, "Mix and match your favorites.");
  const sides = category("sides", "Sides", 6, "Fresh sides from the truck.");
  const drinks = category("drinks", "Drinks", 7, "Cool down with fruit punch.");
  const extras = category("extras", "More Favorites", 8, "Soup, porridge, and more.");
  const deals = category(
    "deals",
    "Prime Fusion Deals",
    9,
    "Combos made for sharing — or keeping all to yourself."
  );

  const bowlItems = [
    item(bowls.id, {
      name: "Jerk Chicken Fried Rice Bowl",
      slug: "jerk-chicken-fried-rice-bowl",
      description: "Jerk chicken, fried rice, Jamaican coleslaw, plantains.",
      priceCents: 1500,
      costCents: 520,
      sortOrder: 1,
      tags: ["signature", "chicken"],
    }),
    item(bowls.id, {
      name: "Oxtail Bowl",
      slug: "oxtail-bowl",
      description: "Braised oxtail, rice & peas, mac & cheese, Jamaican coleslaw, plantains.",
      priceCents: 2000,
      costCents: 920,
      sortOrder: 2,
      tags: ["signature", "premium"],
      prepMinutes: 15,
    }),
    item(bowls.id, {
      name: "Pepper Steak Bowl",
      slug: "pepper-steak-bowl",
      description: "Pepper steak, rice & peas, Jamaican coleslaw, plantains.",
      priceCents: 1700,
      costCents: 680,
      sortOrder: 3,
      tags: ["signature"],
    }),
    item(bowls.id, {
      name: "Mango Glazed Salmon Bites Bowl",
      slug: "mango-glazed-salmon-bowl",
      description: "Mango-glazed salmon bites, rice & peas, Jamaican coleslaw, plantains.",
      priceCents: 1800,
      costCents: 780,
      sortOrder: 4,
      tags: ["signature", "seafood"],
    }),
    item(bowls.id, {
      name: "Jerk Chicken Bowl",
      slug: "jerk-chicken-bowl",
      description: "Jerk chicken, rice & peas, mac & cheese, Jamaican coleslaw, plantains.",
      priceCents: 1500,
      costCents: 540,
      sortOrder: 5,
      tags: ["signature", "chicken"],
    }),
  ];

  const byoOne = item(byo.id, {
    name: "One Protein Fusion Bowl",
    slug: "fusion-bowl-1-protein",
    description:
      "Choose one protein and your sides. Oxtails, Salmon, Barbecue Fried Chicken, Jerk Pork, or Jerk Chicken.",
    priceCents: 1500,
    costCents: 550,
    isBuildYourOwn: true,
    sortOrder: 1,
    tags: ["build", "custom"],
  });
  const byoTwo = item(byo.id, {
    name: "Two Proteins Fusion Bowl",
    slug: "fusion-bowl-2-protein",
    description: "Choose two proteins and your sides for the full fusion experience.",
    priceCents: 2500,
    costCents: 950,
    isBuildYourOwn: true,
    sortOrder: 2,
    tags: ["build", "custom"],
  });

  const proteinGroup = {
    id: cuid(),
    name: "Proteins",
    minSelect: 1,
    maxSelect: 2,
    isRequired: true,
  };
  db.modifierGroups.push(proteinGroup);
  for (const opt of [
    { name: "Oxtails", inv: stock.oxtail.id, cost: 700 },
    { name: "Salmon", inv: stock.salmon.id, cost: 550 },
    { name: "Barbecue Fried Chicken", inv: stock.bbqChicken.id, cost: 320 },
    { name: "Jerk Pork", inv: stock.jerkPork.id, cost: 400 },
    { name: "Jerk Chicken", inv: stock.jerkChicken.id, cost: 350, isDefault: true },
  ]) {
    db.modifierOptions.push({
      id: cuid(),
      groupId: proteinGroup.id,
      name: opt.name,
      priceDeltaCents: 0,
      costDeltaCents: opt.cost,
      isDefault: Boolean(opt.isDefault),
      isActive: true,
      inventoryItemId: opt.inv,
    });
  }

  const sideGroup = {
    id: cuid(),
    name: "Sides",
    minSelect: 1,
    maxSelect: 3,
    isRequired: true,
  };
  db.modifierGroups.push(sideGroup);
  for (const opt of [
    { name: "Rice & Peas", inv: stock.ricePeas.id, cost: 120, isDefault: true, delta: 0 },
    { name: "Jamaican Coleslaw", inv: stock.coleslaw.id, cost: 80, delta: 0 },
    { name: "Rasta Pasta", inv: stock.rastaPasta.id, cost: 200, delta: 200 },
  ]) {
    db.modifierOptions.push({
      id: cuid(),
      groupId: sideGroup.id,
      name: opt.name,
      priceDeltaCents: opt.delta,
      costDeltaCents: opt.cost,
      isDefault: Boolean(opt.isDefault),
      isActive: true,
      inventoryItemId: opt.inv,
    });
  }

  for (const mi of [byoOne, byoTwo]) {
    db.menuItemModifiers.push(
      { menuItemId: mi.id, groupId: proteinGroup.id },
      { menuItemId: mi.id, groupId: sideGroup.id }
    );
  }

  // Signature bowl customizations (make menu items customizable)
  const bowlExtras = {
    id: cuid(),
    name: "Extras & swaps",
    minSelect: 0,
    maxSelect: 4,
    isRequired: false,
  };
  db.modifierGroups.push(bowlExtras);
  for (const opt of [
    { name: "Add Mac & Cheese", delta: 200, cost: 160 },
    { name: "Swap to Fried Rice", delta: 0, cost: 100 },
    { name: "Extra Plantains", delta: 150, cost: 90 },
    { name: "No Coleslaw", delta: 0, cost: 0 },
    { name: "No Plantains", delta: 0, cost: 0 },
    { name: "Extra Jerk Sauce", delta: 50, cost: 20 },
  ]) {
    db.modifierOptions.push({
      id: cuid(),
      groupId: bowlExtras.id,
      name: opt.name,
      priceDeltaCents: opt.delta,
      costDeltaCents: opt.cost,
      isDefault: false,
      isActive: true,
      inventoryItemId: null,
    });
  }
  for (const b of bowlItems) {
    db.menuItemModifiers.push({ menuItemId: b.id, groupId: bowlExtras.id });
  }

  const heatGroup = {
    id: cuid(),
    name: "Heat level",
    minSelect: 1,
    maxSelect: 1,
    isRequired: true,
  };
  db.modifierGroups.push(heatGroup);
  for (const [name, isDefault] of [
    ["Mild", false],
    ["Regular", true],
    ["Extra Jerk Hot", false],
  ] as const) {
    db.modifierOptions.push({
      id: cuid(),
      groupId: heatGroup.id,
      name,
      priceDeltaCents: name === "Extra Jerk Hot" ? 50 : 0,
      costDeltaCents: 0,
      isDefault,
      isActive: true,
      inventoryItemId: null,
    });
  }

  const pastaItems = [
    item(pasta.id, {
      name: "Jerk Chicken Rasta Pasta",
      slug: "jerk-chicken-rasta-pasta",
      description: "Creamy rasta pasta with jerk chicken — Caribbean comfort.",
      priceCents: 1600,
      costCents: 560,
      sortOrder: 1,
    }),
    item(pasta.id, {
      name: "Shrimp Rasta Pasta",
      slug: "shrimp-rasta-pasta",
      description: "Creamy rasta pasta with shrimp.",
      priceCents: 1800,
      costCents: 700,
      sortOrder: 2,
    }),
    item(pasta.id, {
      name: "Salmon Rasta Pasta",
      slug: "salmon-rasta-pasta",
      description: "Creamy rasta pasta with salmon.",
      priceCents: 1900,
      costCents: 760,
      sortOrder: 3,
    }),
    item(pasta.id, {
      name: "Chicken & Shrimp Rasta Pasta",
      slug: "chicken-shrimp-rasta-pasta",
      description: "Creamy rasta pasta with chicken and shrimp.",
      priceCents: 2000,
      costCents: 820,
      sortOrder: 4,
    }),
  ];
  for (const p of pastaItems) {
    db.menuItemModifiers.push({ menuItemId: p.id, groupId: heatGroup.id });
  }

  const wingFlavor = {
    id: cuid(),
    name: "Wing Flavor",
    minSelect: 1,
    maxSelect: 2,
    isRequired: true,
  };
  db.modifierGroups.push(wingFlavor);
  for (const name of ["Jerk", "Mango Jerk", "Sweet & Spicy Jamaican", "Barbecue Jerk"]) {
    db.modifierOptions.push({
      id: cuid(),
      groupId: wingFlavor.id,
      name,
      priceDeltaCents: 0,
      costDeltaCents: 0,
      isDefault: name === "Jerk",
      isActive: true,
      inventoryItemId: null,
    });
  }

  const wingItems = [
    item(wingsCat.id, {
      name: "Wings (6 pieces)",
      slug: "wings-6",
      description:
        "Six pieces. Pick one flavor for all, or pick two flavors for half and half (three pieces each).",
      priceCents: 1200,
      costCents: 480,
      sortOrder: 1,
    }),
    item(wingsCat.id, {
      name: "Wings (10 pieces)",
      slug: "wings-10",
      description:
        "Ten pieces. Pick one flavor for all, or pick two flavors for half and half (five pieces each).",
      priceCents: 1800,
      costCents: 780,
      sortOrder: 2,
    }),
    item(wingsCat.id, {
      name: "Wings (20 pieces)",
      slug: "wings-20",
      description:
        "Twenty pieces. Pick one flavor for all, or pick two flavors for half and half (ten pieces each).",
      priceCents: 3400,
      costCents: 1500,
      sortOrder: 3,
    }),
    item(wingsCat.id, {
      name: "Wing Combo",
      slug: "wing-combo",
      description:
        "Six wings, fries, Jamaican coleslaw, and Fruit Punch. Choose one or two wing flavors (half and half).",
      priceCents: 1800,
      costCents: 720,
      sortOrder: 4,
      tags: ["combo"],
    }),
  ];
  for (const w of wingItems) {
    db.menuItemModifiers.push({ menuItemId: w.id, groupId: wingFlavor.id });
  }

  const empFlavor = {
    id: cuid(),
    name: "Empanada mix",
    minSelect: 1,
    maxSelect: 2,
    isRequired: true,
  };
  db.modifierGroups.push(empFlavor);
  for (const name of ["Chicken", "Beef", "Half and Half"]) {
    db.modifierOptions.push({
      id: cuid(),
      groupId: empFlavor.id,
      name,
      priceDeltaCents: 0,
      costDeltaCents: 0,
      isDefault: name === "Chicken",
      isActive: true,
      inventoryItemId: null,
    });
  }

  const chickenEmpItem = item(empanadas.id, {
    name: "Chicken Empanada",
    slug: "chicken-empanada",
    priceCents: 400,
    costCents: 140,
    sortOrder: 1,
  });
  const beefEmpItem = item(empanadas.id, {
    name: "Beef Empanada",
    slug: "beef-empanada",
    priceCents: 400,
    costCents: 150,
    sortOrder: 2,
  });
  const empBundles = [
    item(empanadas.id, {
      name: "Empanada Bundle — 2 for $7",
      slug: "empanada-bundle-2",
      description: "Mix and match any two empanadas.",
      priceCents: 700,
      costCents: 280,
      sortOrder: 3,
      tags: ["bundle"],
    }),
    item(empanadas.id, {
      name: "Empanada Bundle — 3 for $10",
      slug: "empanada-bundle-3",
      description: "Mix and match any three empanadas.",
      priceCents: 1000,
      costCents: 420,
      sortOrder: 4,
      tags: ["bundle"],
    }),
    item(empanadas.id, {
      name: "Empanada Bundle — 6 for $18",
      slug: "empanada-bundle-6",
      description: "Mix and match any six empanadas.",
      priceCents: 1800,
      costCents: 780,
      sortOrder: 5,
      tags: ["bundle"],
    }),
  ];
  for (const b of empBundles) {
    db.menuItemModifiers.push({ menuItemId: b.id, groupId: empFlavor.id });
  }
  void chickenEmpItem;
  void beefEmpItem;

  item(sides.id, {
    name: "Rice & Peas",
    slug: "side-rice-peas",
    priceCents: 500,
    costCents: 120,
    sortOrder: 1,
  });
  item(sides.id, {
    name: "Jamaican Coleslaw",
    slug: "side-coleslaw",
    priceCents: 400,
    costCents: 80,
    sortOrder: 2,
  });
  item(sides.id, {
    name: "Rasta Pasta (side)",
    slug: "side-rasta-pasta",
    priceCents: 700,
    costCents: 220,
    sortOrder: 3,
  });
  item(sides.id, {
    name: "Mac & Cheese",
    slug: "side-mac-cheese",
    priceCents: 600,
    costCents: 160,
    sortOrder: 4,
  });
  item(sides.id, {
    name: "Fried Plantains",
    slug: "side-plantains",
    priceCents: 400,
    costCents: 90,
    sortOrder: 5,
  });

  item(drinks.id, {
    name: "Prime Fusion Fruit Punch",
    slug: "fruit-punch",
    description: "Jamaican-style tropical fruit punch.",
    priceCents: 500,
    costCents: 90,
    sortOrder: 1,
  });

  item(extras.id, {
    name: "Soup Bowl",
    slug: "soup-bowl",
    priceCents: 1000,
    costCents: 280,
    sortOrder: 1,
  });
  item(extras.id, {
    name: "Porridge Bowl",
    slug: "porridge-bowl",
    priceCents: 800,
    costCents: 200,
    sortOrder: 2,
  });
  item(extras.id, {
    name: "Jerk Chicken Fry Rice",
    slug: "jerk-chicken-fry-rice",
    priceCents: 1200,
    costCents: 420,
    sortOrder: 3,
  });

  const signatureBowlNames = bowlItems.map((b) => b.name);
  const premiumBowlNames = bowlItems
    .filter(
      (b) =>
        b.slug === "oxtail-bowl" ||
        b.slug === "pepper-steak-bowl" ||
        b.slug === "mango-glazed-salmon-bowl"
    )
    .map((b) => b.name);

  function makePickGroup(
    name: string,
    options: string[],
    opts?: { required?: boolean; defaultName?: string }
  ) {
    const group = {
      id: cuid(),
      name,
      minSelect: opts?.required === false ? 0 : 1,
      maxSelect: 1,
      isRequired: opts?.required !== false,
    };
    db.modifierGroups.push(group);
    for (const optName of options) {
      db.modifierOptions.push({
        id: cuid(),
        groupId: group.id,
        name: optName,
        priceDeltaCents: 0,
        costDeltaCents: 0,
        isDefault: optName === (opts?.defaultName || options[0]),
        isActive: true,
        inventoryItemId: null,
      });
    }
    return group;
  }

  const dealTwoBowls = item(deals.id, {
    name: "Two Bowls Deal",
    slug: "deal-2-bowls",
    description:
      "Any two signature bowls for $25. Choose each bowl — same extras as ordering them alone.",
    priceCents: 2500,
    costCents: 1100,
    sortOrder: 1,
    tags: ["deal"],
  });
  const dealPremium = item(deals.id, {
    name: "Two Premium Bowls",
    slug: "deal-2-premium-bowls",
    description:
      "Pepper Steak, Mango Glazed Salmon, or Oxtail — pick two for $30. Customize each bowl.",
    priceCents: 3000,
    costCents: 1500,
    sortOrder: 2,
    tags: ["deal"],
  });
  const dealBowlCombo = item(deals.id, {
    name: "Bowl Combo",
    slug: "deal-bowl-combo",
    description: "One signature bowl, one empanada, and fruit punch. Customize every item.",
    priceCents: 2000,
    costCents: 800,
    sortOrder: 3,
    tags: ["deal"],
  });
  const dealFullFusion = item(deals.id, {
    name: "Full Fusion Combo",
    slug: "deal-full-fusion",
    description:
      "Two signature bowls, two empanadas, and two fruit punches. Customize every item in the combo.",
    priceCents: 3500,
    costCents: 1500,
    sortOrder: 4,
    tags: ["deal"],
  });

  const dealBowl1 = makePickGroup("Bowl one", signatureBowlNames, {
    defaultName: signatureBowlNames[0],
  });
  const dealBowl2 = makePickGroup("Bowl two", signatureBowlNames, {
    defaultName: signatureBowlNames[4] || signatureBowlNames[0],
  });
  const premiumBowl1 = makePickGroup("Bowl one", premiumBowlNames);
  const premiumBowl2 = makePickGroup("Bowl two", premiumBowlNames, {
    defaultName: premiumBowlNames[1] || premiumBowlNames[0],
  });
  const comboBowl = makePickGroup("Choose your bowl", signatureBowlNames);
  const comboEmpanada = makePickGroup("Choose your empanada", [
    "Chicken Empanada",
    "Beef Empanada",
  ]);
  const fullBowl1 = makePickGroup("Bowl one", signatureBowlNames);
  const fullBowl2 = makePickGroup("Bowl two", signatureBowlNames, {
    defaultName: signatureBowlNames[1] || signatureBowlNames[0],
  });
  const fullEmp1 = makePickGroup("Empanada one", ["Chicken Empanada", "Beef Empanada"]);
  const fullEmp2 = makePickGroup("Empanada two", ["Chicken Empanada", "Beef Empanada"], {
    defaultName: "Beef Empanada",
  });

  db.menuItemModifiers.push(
    { menuItemId: dealTwoBowls.id, groupId: dealBowl1.id },
    { menuItemId: dealTwoBowls.id, groupId: dealBowl2.id },
    { menuItemId: dealTwoBowls.id, groupId: bowlExtras.id },
    { menuItemId: dealPremium.id, groupId: premiumBowl1.id },
    { menuItemId: dealPremium.id, groupId: premiumBowl2.id },
    { menuItemId: dealPremium.id, groupId: bowlExtras.id },
    { menuItemId: dealBowlCombo.id, groupId: comboBowl.id },
    { menuItemId: dealBowlCombo.id, groupId: comboEmpanada.id },
    { menuItemId: dealBowlCombo.id, groupId: bowlExtras.id },
    { menuItemId: dealFullFusion.id, groupId: fullBowl1.id },
    { menuItemId: dealFullFusion.id, groupId: fullBowl2.id },
    { menuItemId: dealFullFusion.id, groupId: fullEmp1.id },
    { menuItemId: dealFullFusion.id, groupId: fullEmp2.id },
    { menuItemId: dealFullFusion.id, groupId: bowlExtras.id }
  );

  const deal = {
    id: cuid(),
    name: "Two Bowls for $25",
    slug: "two-bowls-25",
    description: "Choose any two signature bowls.",
    priceCents: 2500,
    isActive: true,
    rulesJson: JSON.stringify({
      type: "pick_n",
      count: 2,
      categorySlugs: ["signature-bowls"],
    }),
  };
  db.deals.push(deal);
  for (const b of bowlItems) {
    db.dealOptions.push({ id: cuid(), dealId: deal.id, menuItemId: b.id, slotLabel: null });
  }

  const recipes: Array<{ itemId: string; components: Array<{ invId: string; qty: number }> }> = [
    {
      itemId: bowlItems[0].id,
      components: [
        { invId: stock.jerkChicken.id, qty: 1 },
        { invId: stock.friedRice.id, qty: 1 },
        { invId: stock.coleslaw.id, qty: 1 },
        { invId: stock.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[1].id,
      components: [
        { invId: stock.oxtail.id, qty: 1 },
        { invId: stock.ricePeas.id, qty: 1 },
        { invId: stock.macCheese.id, qty: 1 },
        { invId: stock.coleslaw.id, qty: 1 },
        { invId: stock.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[2].id,
      components: [
        { invId: stock.pepperSteak.id, qty: 1 },
        { invId: stock.ricePeas.id, qty: 1 },
        { invId: stock.coleslaw.id, qty: 1 },
        { invId: stock.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[3].id,
      components: [
        { invId: stock.salmon.id, qty: 1 },
        { invId: stock.ricePeas.id, qty: 1 },
        { invId: stock.coleslaw.id, qty: 1 },
        { invId: stock.plantains.id, qty: 1 },
      ],
    },
    {
      itemId: bowlItems[4].id,
      components: [
        { invId: stock.jerkChicken.id, qty: 1 },
        { invId: stock.ricePeas.id, qty: 1 },
        { invId: stock.macCheese.id, qty: 1 },
        { invId: stock.coleslaw.id, qty: 1 },
        { invId: stock.plantains.id, qty: 1 },
      ],
    },
  ];
  for (const r of recipes) {
    for (const c of r.components) {
      db.recipeComponents.push({
        id: cuid(),
        menuItemId: r.itemId,
        inventoryItemId: c.invId,
        quantityUsed: c.qty,
      });
    }
  }

  for (const s of [
    { code: "truck-window", label: "Truck Window", orderType: "TOGO" as const },
    { code: "picnic-a", label: "Picnic Table A Pickup", orderType: "TOGO" as const },
    { code: "picnic-b", label: "Picnic Table B Pickup", orderType: "TOGO" as const },
    { code: "catering-prep", label: "Catering Pickup", orderType: "TOGO" as const },
  ]) {
    db.qrStations.push({
      id: cuid(),
      code: s.code,
      label: s.label,
      orderType: s.orderType,
      isActive: true,
      createdAt: stamp,
    });
  }

  const customerId = cuid();
  db.users.push({
    id: customerId,
    phone: "+15555550100",
    name: "Demo Guest",
    role: "CUSTOMER",
    createdAt: stamp,
    updatedAt: stamp,
  });
  db.rewardAccounts.push({
    id: cuid(),
    userId: customerId,
    phone: "+15555550100",
    points: 120,
    lifetimePts: 320,
    createdAt: stamp,
    updatedAt: stamp,
  });

  replaceDb(db);
  console.log("Seeded Prime Fusion JSON store (no Prisma).");
  console.log(`Admin: ${process.env.ADMIN_EMAIL || "admin@primefusion.com"} / ${password}`);
  console.log("Kitchen: kitchen@primefusion.com / kitchen-2024");
}

let seedPromise: Promise<void> | null = null;

/** Ensure seed exists when the app boots in API routes. */
export async function ensureSeeded() {
  const db = getDb();
  if (db.menuItems.length > 0 && db.users.some((u) => u.role === "ADMIN")) {
    return;
  }
  if (!seedPromise) {
    seedPromise = seedDatabase(true)
      .catch((err) => {
        console.error("[seed] failed", err);
        throw err;
      })
      .finally(() => {
        seedPromise = null;
      });
  }
  await seedPromise;
}

// silence unused helper in case tree-shaken tooling complains in some builds
void upsertBy;
void (null as unknown as Database);
