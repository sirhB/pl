import { prisma } from "./db";

export async function getFullMenu() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          modifiers: {
            include: {
              group: {
                include: {
                  options: {
                    where: { isActive: true },
                    orderBy: { name: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      priceCents: item.priceCents,
      isBuildYourOwn: item.isBuildYourOwn,
      prepMinutes: item.prepMinutes,
      tags: JSON.parse(item.tags || "[]") as string[],
      modifierGroups: item.modifiers.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        minSelect: m.group.minSelect,
        maxSelect: item.slug.includes("1-protein")
          ? Math.min(1, m.group.maxSelect)
          : item.slug.includes("2-protein") && m.group.name === "Proteins"
            ? 2
            : m.group.maxSelect,
        isRequired: m.group.isRequired,
        options: m.group.options.map((o) => ({
          id: o.id,
          name: o.name,
          priceDeltaCents: o.priceDeltaCents,
          isDefault: o.isDefault,
        })),
      })),
    })),
  }));
}

export type MenuCategory = Awaited<ReturnType<typeof getFullMenu>>[number];
export type MenuItemDTO = MenuCategory["items"][number];
