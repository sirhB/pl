/** Local menu photography paths under /public/images/menu */

export const menuImages = {
  hero: "/images/menu/hero-truck-spread.png",
  fusionBowl: "/images/menu/fusion-bowl-hero.png",
  jerkChicken: "/images/menu/protein-jerk-chicken.png",
  barbecueChicken: "/images/menu/protein-barbecue-chicken.png",
  jerkPork: "/images/menu/protein-jerk-pork.png",
  oxtails: "/images/menu/protein-oxtails.png",
  salmon: "/images/menu/protein-salmon.png",
  rastaPasta: "/images/menu/dish-rasta-pasta.png",
  wings: "/images/menu/dish-wings.png",
  empanadas: "/images/menu/dish-empanadas.png",
  plantains: "/images/menu/side-plantains.png",
  ricePeas: "/images/menu/side-rice-peas.png",
  fruitPunch: "/images/menu/drink-fruit-punch.png",
} as const;

/** Protein option name → image path for the bowl builder. */
export const proteinImages: Record<string, string> = {
  "Jerk Chicken": menuImages.jerkChicken,
  "Barbecue Fried Chicken": menuImages.barbecueChicken,
  "BBQ Fried Chicken": menuImages.barbecueChicken,
  "Jerk Pork": menuImages.jerkPork,
  Oxtails: menuImages.oxtails,
  Salmon: menuImages.salmon,
};

/** Base / side / addon name → image for visual upsells. */
export const optionImages: Record<string, string> = {
  "Rice & Peas": menuImages.ricePeas,
  "Jerk Chicken Fried Rice": menuImages.jerkChicken,
  "Rasta Pasta": menuImages.rastaPasta,
  "Mac & Cheese": menuImages.rastaPasta, // warm creamy dish stand-in
  Plantains: menuImages.plantains,
  "Jamaican Coleslaw": menuImages.plantains,
};

/** Menu item slug → hero image. */
export const itemImageBySlug: Record<string, string> = {
  "jerk-chicken-fried-rice-bowl": menuImages.jerkChicken,
  "oxtail-bowl": menuImages.oxtails,
  "pepper-steak-bowl": menuImages.fusionBowl,
  "mango-glazed-salmon-bowl": menuImages.salmon,
  "jerk-chicken-bowl": menuImages.jerkChicken,
  "fusion-bowl-1-protein": menuImages.fusionBowl,
  "fusion-bowl-2-protein": menuImages.fusionBowl,
  "jerk-chicken-rasta-pasta": menuImages.rastaPasta,
  "shrimp-rasta-pasta": menuImages.rastaPasta,
  "salmon-rasta-pasta": menuImages.salmon,
  "chicken-shrimp-rasta-pasta": menuImages.rastaPasta,
  "wings-6": menuImages.wings,
  "wings-10": menuImages.wings,
  "wings-20": menuImages.wings,
  "wing-combo": menuImages.wings,
  "chicken-empanada": menuImages.empanadas,
  "beef-empanada": menuImages.empanadas,
  "empanada-bundle-2": menuImages.empanadas,
  "empanada-bundle-3": menuImages.empanadas,
  "empanada-bundle-6": menuImages.empanadas,
  "side-rice-peas": menuImages.ricePeas,
  "side-coleslaw": menuImages.plantains,
  "side-rasta-pasta": menuImages.rastaPasta,
  "side-mac-cheese": menuImages.rastaPasta,
  "side-plantains": menuImages.plantains,
  "fruit-punch": menuImages.fruitPunch,
  "soup-bowl": menuImages.fusionBowl,
  "porridge-bowl": menuImages.fusionBowl,
  "jerk-chicken-fry-rice": menuImages.jerkChicken,
  "deal-2-bowls": menuImages.fusionBowl,
  "deal-2-premium-bowls": menuImages.oxtails,
  "deal-bowl-combo": menuImages.fusionBowl,
  "deal-full-fusion": menuImages.hero,
};
