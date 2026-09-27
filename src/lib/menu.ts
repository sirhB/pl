import { getDb } from "./db";

function safeTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getFullMenu() {
  const db = getDb();
  const categories = [...db.categories]
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return categories.map((cat) => {
    const items = db.menuItems
      .filter((i) => i.categoryId === cat.id && i.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => {
        const groupIds = db.menuItemModifiers
          .filter((m) => m.menuItemId === item.id)
          .map((m) => m.groupId);
        const modifierGroups = groupIds
          .map((gid) => db.modifierGroups.find((g) => g.id === gid))
          .filter(Boolean)
          .map((g) => {
            const maxSelect =
              item.slug.includes("1-protein") && g!.name === "Proteins"
                ? 1
                : item.slug.includes("2-protein") && g!.name === "Proteins"
                  ? 2
                  : g!.maxSelect;
            return {
              id: g!.id,
              name: g!.name,
              minSelect: g!.minSelect,
              maxSelect,
              isRequired: g!.isRequired,
              options: db.modifierOptions
                .filter((o) => o.groupId === g!.id && o.isActive)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((o) => ({
                  id: o.id,
                  name: o.name,
                  priceDeltaCents: o.priceDeltaCents,
                  isDefault: o.isDefault,
                })),
            };
          });

        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl || null,
          isBuildYourOwn: item.isBuildYourOwn,
          prepMinutes: item.prepMinutes,
          tags: safeTags(item.tags),
          modifierGroups,
        };
      });

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      items,
    };
  });
}

export type MenuCategory = Awaited<ReturnType<typeof getFullMenu>>[number];
export type MenuItemDTO = MenuCategory["items"][number];
