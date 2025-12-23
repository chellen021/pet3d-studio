import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pet images uploaded by users
 */
export const petImages = mysqlTable("pet_images", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalUrl: text("originalUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 50 }),
  width: int("width"),
  height: int("height"),
  s3Key: varchar("s3Key", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PetImage = typeof petImages.$inferSelect;
export type InsertPetImage = typeof petImages.$inferInsert;

/**
 * 3D models generated from pet images
 */
export const models3d = mysqlTable("models_3d", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  petImageId: int("petImageId").notNull(),
  jobId: varchar("jobId", { length: 100 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  glbUrl: text("glbUrl"),
  previewUrl: text("previewUrl"),
  s3Key: varchar("s3Key", { length: 500 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Model3d = typeof models3d.$inferSelect;
export type InsertModel3d = typeof models3d.$inferInsert;

/**
 * Print sizes and pricing
 */
export const printSizes = mysqlTable("print_sizes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  dimensions: varchar("dimensions", { length: 50 }).notNull(),
  priceUsd: decimal("priceUsd", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PrintSize = typeof printSizes.$inferSelect;
export type InsertPrintSize = typeof printSizes.$inferInsert;

/**
 * Orders for 3D printing
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId").notNull(),
  model3dId: int("model3dId").notNull(),
  printSizeId: int("printSizeId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPriceUsd: decimal("unitPriceUsd", { precision: 10, scale: 2 }).notNull(),
  totalPriceUsd: decimal("totalPriceUsd", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  shippingName: varchar("shippingName", { length: 100 }),
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 100 }),
  shippingState: varchar("shippingState", { length: 100 }),
  shippingCountry: varchar("shippingCountry", { length: 100 }),
  shippingPostalCode: varchar("shippingPostalCode", { length: 20 }),
  shippingPhone: varchar("shippingPhone", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Payment records
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  paypalOrderId: varchar("paypalOrderId", { length: 100 }),
  paypalCaptureId: varchar("paypalCaptureId", { length: 100 }),
  amountUsd: decimal("amountUsd", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  payerEmail: varchar("payerEmail", { length: 255 }),
  payerId: varchar("payerId", { length: 100 }),
  rawResponse: json("rawResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * System configuration (API keys, settings)
 */
export const systemConfig = mysqlTable("system_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isEncrypted: boolean("isEncrypted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;
