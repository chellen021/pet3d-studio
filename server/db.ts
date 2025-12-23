import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  petImages, InsertPetImage, PetImage,
  models3d, InsertModel3d, Model3d,
  printSizes, PrintSize,
  orders, InsertOrder, Order,
  payments, InsertPayment, Payment,
  systemConfig, SystemConfig
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Queries ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Pet Image Queries ============
export async function createPetImage(data: InsertPetImage): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(petImages).values(data);
  return result[0].insertId;
}

export async function getPetImagesByUserId(userId: number): Promise<PetImage[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(petImages).where(eq(petImages.userId, userId)).orderBy(desc(petImages.createdAt));
}

export async function getPetImageById(id: number): Promise<PetImage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(petImages).where(eq(petImages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deletePetImage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(petImages).where(eq(petImages.id, id));
}

// ============ 3D Model Queries ============
export async function createModel3d(data: InsertModel3d): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(models3d).values(data);
  return result[0].insertId;
}

export async function getModel3dsByUserId(userId: number): Promise<Model3d[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(models3d).where(eq(models3d.userId, userId)).orderBy(desc(models3d.createdAt));
}

export async function getModel3dById(id: number): Promise<Model3d | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(models3d).where(eq(models3d.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getModel3dByJobId(jobId: string): Promise<Model3d | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(models3d).where(eq(models3d.jobId, jobId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateModel3d(id: number, data: Partial<InsertModel3d>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(models3d).set(data).where(eq(models3d.id, id));
}

export async function deleteModel3d(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(models3d).where(eq(models3d.id, id));
}

// ============ Print Size Queries ============
export async function getAllPrintSizes(): Promise<PrintSize[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(printSizes).where(eq(printSizes.isActive, true)).orderBy(printSizes.sortOrder);
}

export async function getPrintSizeById(id: number): Promise<PrintSize | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(printSizes).where(eq(printSizes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function initPrintSizes(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(printSizes).limit(1);
  if (existing.length > 0) return;

  const defaultSizes = [
    { name: "Mini", description: "Perfect for desk decoration", dimensions: "5cm x 5cm x 5cm", priceUsd: "99.00", sortOrder: 1 },
    { name: "Small", description: "Great gift size", dimensions: "8cm x 8cm x 8cm", priceUsd: "199.00", sortOrder: 2 },
    { name: "Medium", description: "Ideal for display", dimensions: "12cm x 12cm x 12cm", priceUsd: "349.00", sortOrder: 3 },
    { name: "Large", description: "Statement piece", dimensions: "18cm x 18cm x 18cm", priceUsd: "549.00", sortOrder: 4 },
    { name: "XL", description: "Premium showcase", dimensions: "25cm x 25cm x 25cm", priceUsd: "749.00", sortOrder: 5 },
    { name: "XXL", description: "Ultimate collector edition", dimensions: "35cm x 35cm x 35cm", priceUsd: "999.00", sortOrder: 6 },
  ];

  for (const size of defaultSizes) {
    await db.insert(printSizes).values(size);
  }
}

// ============ Order Queries ============
export async function createOrder(data: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}

export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrder(id: number, data: Partial<InsertOrder>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

// ============ Payment Queries ============
export async function createPayment(data: InsertPayment): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

export async function getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentByPaypalOrderId(paypalOrderId: string): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.paypalOrderId, paypalOrderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePayment(id: number, data: Partial<InsertPayment>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(payments).set(data).where(eq(payments.id, id));
}

// ============ System Config Queries ============
export async function getSystemConfig(key: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return result.length > 0 ? result[0].value : undefined;
}

export async function setSystemConfig(key: string, value: string, description?: string, isEncrypted = false): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemConfig).values({ key, value, description, isEncrypted })
    .onDuplicateKeyUpdate({ set: { value, description, isEncrypted } });
}

export async function initSystemConfig(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // API keys are now loaded from environment variables
  // Set these in your deployment platform (Render, Vercel, etc.)
  const configs = [
    { key: "HUNYUAN_SECRET_ID", value: process.env.HUNYUAN_SECRET_ID || "", description: "腾讯云混元3D API SecretId", isEncrypted: true },
    { key: "HUNYUAN_SECRET_KEY", value: process.env.HUNYUAN_SECRET_KEY || "", description: "腾讯云混元3D API SecretKey", isEncrypted: true },
    { key: "PAYPAL_CLIENT_ID", value: process.env.PAYPAL_CLIENT_ID || "", description: "PayPal生产环境Client ID", isEncrypted: true },
    { key: "PAYPAL_CLIENT_SECRET", value: process.env.PAYPAL_CLIENT_SECRET || "", description: "PayPal生产环境Client Secret", isEncrypted: true },
    { key: "PAYPAL_MODE", value: process.env.PAYPAL_MODE || "production", description: "PayPal环境模式", isEncrypted: false },
  ];

  for (const config of configs) {
    if (!config.value) continue; // Skip if env var not set
    const existing = await db.select().from(systemConfig).where(eq(systemConfig.key, config.key)).limit(1);
    if (existing.length === 0) {
      await db.insert(systemConfig).values(config);
    }
  }
}
