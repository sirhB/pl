export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type OrderType = "DINE_IN" | "TOGO";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "RECEIVED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type User = {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  passwordHash?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  costCents: number;
  imageUrl?: string | null;
  isActive: boolean;
  isBuildYourOwn: boolean;
  allowsModifiers: boolean;
  prepMinutes: number;
  sortOrder: number;
  tags: string;
};

export type ModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
};

export type ModifierOption = {
  id: string;
  groupId: string;
  name: string;
  priceDeltaCents: number;
  costDeltaCents: number;
  isDefault: boolean;
  isActive: boolean;
  inventoryItemId?: string | null;
};

export type MenuItemModifier = {
  menuItemId: string;
  groupId: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku?: string | null;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  costPerUnitCents: number;
  isActive: boolean;
};

export type RecipeComponent = {
  id: string;
  menuItemId: string;
  inventoryItemId: string;
  quantityUsed: number;
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  delta: number;
  reason: string;
  orderId?: string | null;
  createdAt: string;
};

export type Deal = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  isActive: boolean;
  rulesJson: string;
};

export type DealOption = {
  id: string;
  dealId: string;
  menuItemId: string;
  slotLabel?: string | null;
};

export type QrStation = {
  id: string;
  code: string;
  label: string;
  orderType: OrderType;
  isActive: boolean;
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  orderType: OrderType;
  status: OrderStatus;
  qrStationId?: string | null;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  tipCents: number;
  totalCents: number;
  taxRateBps: number;
  rewardPointsEarned: number;
  rewardPointsRedeemed: number;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  notes?: string | null;
  estimatedReadyAt?: string | null;
  paidAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  costCents: number;
  modifiersJson: string;
  notes?: string | null;
};

export type OrderEvent = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
};

export type TaxSetting = {
  id: string;
  name: string;
  rateBps: number;
  isInclusive: boolean;
  jurisdiction?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RewardAccount = {
  id: string;
  userId: string;
  phone: string;
  points: number;
  lifetimePts: number;
  createdAt: string;
  updatedAt: string;
};

export type RewardTransaction = {
  id: string;
  accountId: string;
  points: number;
  reason: string;
  orderId?: string | null;
  createdAt: string;
};

export type SmsLog = {
  id: string;
  toPhone: string;
  body: string;
  status: string;
  providerId?: string | null;
  orderId?: string | null;
  userId?: string | null;
  createdAt: string;
};

export type AppSetting = {
  id: string;
  key: string;
  value: string;
};

export type Database = {
  users: User[];
  categories: Category[];
  menuItems: MenuItem[];
  modifierGroups: ModifierGroup[];
  modifierOptions: ModifierOption[];
  menuItemModifiers: MenuItemModifier[];
  inventoryItems: InventoryItem[];
  recipeComponents: RecipeComponent[];
  inventoryMovements: InventoryMovement[];
  deals: Deal[];
  dealOptions: DealOption[];
  qrStations: QrStation[];
  orders: Order[];
  orderItems: OrderItem[];
  orderEvents: OrderEvent[];
  taxSettings: TaxSetting[];
  rewardAccounts: RewardAccount[];
  rewardTransactions: RewardTransaction[];
  smsLogs: SmsLog[];
  appSettings: AppSetting[];
};

export function emptyDatabase(): Database {
  return {
    users: [],
    categories: [],
    menuItems: [],
    modifierGroups: [],
    modifierOptions: [],
    menuItemModifiers: [],
    inventoryItems: [],
    recipeComponents: [],
    inventoryMovements: [],
    deals: [],
    dealOptions: [],
    qrStations: [],
    orders: [],
    orderItems: [],
    orderEvents: [],
    taxSettings: [],
    rewardAccounts: [],
    rewardTransactions: [],
    smsLogs: [],
    appSettings: [],
  };
}
