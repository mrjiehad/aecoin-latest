var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cartItems: () => cartItems,
  coupons: () => coupons,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCouponSchema: () => insertCouponSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPackageSchema: () => insertPackageSchema,
  insertPendingPaymentSchema: () => insertPendingPaymentSchema,
  insertPlayerRankingSchema: () => insertPlayerRankingSchema,
  insertRedemptionCodeSchema: () => insertRedemptionCodeSchema,
  insertUserSchema: () => insertUserSchema,
  orderItems: () => orderItems,
  orders: () => orders,
  packages: () => packages,
  pendingPayments: () => pendingPayments,
  playerRankings: () => playerRankings,
  redemptionCodes: () => redemptionCodes,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: varchar("discord_id").unique(),
  // nullable for admin users
  email: text("email").notNull(),
  username: text("username").notNull().unique(),
  // unique for admin login
  avatar: text("avatar"),
  passwordHash: text("password_hash"),
  // for admin users only
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  // Original price before discount
  aecoinAmount: integer("aecoin_amount").notNull(),
  // Amount of AECOIN
  codesPerPackage: integer("codes_per_package").notNull().default(1),
  // How many codes to generate
  featured: boolean("featured").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true
});
var cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  packageId: varchar("package_id").notNull().references(() => packages.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true
});
var pendingPayments = pgTable("pending_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  // toyyibpay, billplz
  externalId: text("external_id").notNull().unique(),
  // paymentIntentId or billCode
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MYR"),
  status: text("status").notNull().default("created"),
  // created, processing, succeeded, failed, cancelled, expired
  cartSnapshot: text("cart_snapshot").notNull(),
  // JSON string of cart items
  couponCode: text("coupon_code"),
  metadata: text("metadata"),
  // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertPendingPaymentSchema = createInsertSchema(pendingPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // pending, paid, fulfilled, failed, cancelled
  paymentMethod: text("payment_method").notNull(),
  // toyyibpay, billplz
  paymentId: text("payment_id").unique(),
  // External payment ID from ToyyibPay/Billplz - must be unique for idempotency
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true
});
var orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  packageId: varchar("package_id").notNull().references(() => packages.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull()
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});
var redemptionCodes = pgTable("redemption_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  // The actual redemption code
  packageId: varchar("package_id").notNull().references(() => packages.id),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  aecoinAmount: integer("aecoin_amount").notNull(),
  // AECOIN value for this code
  status: text("status").notNull().default("active"),
  // active, redeemed, expired
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at")
  // Optional expiry
});
var insertRedemptionCodeSchema = createInsertSchema(redemptionCodes).omit({
  id: true,
  createdAt: true
});
var coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }).default("0"),
  maxUses: integer("max_uses"),
  // null = unlimited
  currentUses: integer("current_uses").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  currentUses: true,
  createdAt: true
});
var playerRankings = pgTable("player_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  playerName: text("player_name").notNull(),
  // In-game name
  stars: integer("stars").notNull().default(0),
  // Achievement/score system
  rank: integer("rank").notNull(),
  // Position in leaderboard
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertPlayerRankingSchema = createInsertSchema(playerRankings).omit({
  id: true,
  updatedAt: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
var WebSocketWithoutSSLVerification = class extends ws {
  constructor(address, protocols) {
    super(address, protocols, {
      rejectUnauthorized: false
    });
  }
};
neonConfig.webSocketConstructor = WebSocketWithoutSSLVerification;
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 1e4
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, sql as sql2, asc } from "drizzle-orm";
var DbStorage = class {
  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByDiscordId(discordId) {
    const result = await db.select().from(users).where(eq(users.discordId, discordId)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async createUser(user) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  async createAdminUser(username, email, passwordHash) {
    const result = await db.insert(users).values({
      username,
      email,
      passwordHash,
      isAdmin: true,
      discordId: null,
      avatar: null
    }).returning();
    return result[0];
  }
  // Package operations
  async getAllPackages() {
    return await db.select().from(packages).orderBy(asc(packages.price));
  }
  async getPackage(id) {
    const result = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
    return result[0];
  }
  async createPackage(pkg) {
    const result = await db.insert(packages).values(pkg).returning();
    return result[0];
  }
  async updatePackage(id, pkg) {
    const result = await db.update(packages).set(pkg).where(eq(packages.id, id)).returning();
    return result[0];
  }
  async deletePackage(id) {
    const result = await db.delete(packages).where(eq(packages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Cart operations
  async getCartItems(userId) {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }
  async addToCart(item) {
    const existing = await db.select().from(cartItems).where(and(
      eq(cartItems.userId, item.userId),
      eq(cartItems.packageId, item.packageId)
    )).limit(1);
    if (existing[0]) {
      const updated = await db.update(cartItems).set({ quantity: existing[0].quantity + item.quantity }).where(eq(cartItems.id, existing[0].id)).returning();
      return updated[0];
    } else {
      const result = await db.insert(cartItems).values(item).returning();
      return result[0];
    }
  }
  async updateCartItemQuantity(id, quantity) {
    const result = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return result[0];
  }
  async removeFromCart(id) {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async clearCart(userId) {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Order operations
  async getOrder(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }
  async getOrderByPaymentId(paymentId) {
    const result = await db.select().from(orders).where(eq(orders.paymentId, paymentId)).limit(1);
    return result[0];
  }
  async getUserOrders(userId) {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(sql2`${orders.createdAt} DESC`);
  }
  async getAllOrders() {
    return await db.select().from(orders).orderBy(sql2`${orders.createdAt} DESC`);
  }
  async createOrder(order) {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }
  async updateOrderStatus(id, status, paymentId) {
    const updateData = { status };
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    if (status === "fulfilled" || status === "completed") {
      updateData.completedAt = /* @__PURE__ */ new Date();
    }
    const result = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return result[0];
  }
  // Order items operations
  async createOrderItem(orderItem) {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }
  async getOrderItems(orderId) {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  // Redemption code operations
  async createRedemptionCode(code) {
    const result = await db.insert(redemptionCodes).values(code).returning();
    return result[0];
  }
  async getOrderRedemptionCodes(orderId) {
    return await db.select().from(redemptionCodes).where(eq(redemptionCodes.orderId, orderId));
  }
  async redeemCode(code) {
    const result = await db.update(redemptionCodes).set({ status: "redeemed", redeemedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(redemptionCodes.code, code),
      eq(redemptionCodes.status, "active")
    )).returning();
    return result[0];
  }
  // Coupon operations
  async getCoupon(code) {
    const result = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
    return result[0];
  }
  async getAllCoupons() {
    return await db.select().from(coupons).orderBy(sql2`${coupons.createdAt} DESC`);
  }
  async createCoupon(coupon) {
    const result = await db.insert(coupons).values(coupon).returning();
    return result[0];
  }
  async updateCoupon(id, coupon) {
    const result = await db.update(coupons).set(coupon).where(eq(coupons.id, id)).returning();
    return result[0];
  }
  async deleteCoupon(id) {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async incrementCouponUse(id) {
    const result = await db.update(coupons).set({ currentUses: sql2`${coupons.currentUses} + 1` }).where(eq(coupons.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Pending payment operations
  async createPendingPayment(payment) {
    const result = await db.insert(pendingPayments).values(payment).returning();
    return result[0];
  }
  async getPendingPaymentByExternalId(externalId) {
    const result = await db.select().from(pendingPayments).where(eq(pendingPayments.externalId, externalId)).limit(1);
    return result[0];
  }
  async updatePendingPaymentStatus(externalId, status) {
    const result = await db.update(pendingPayments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pendingPayments.externalId, externalId)).returning();
    return result[0];
  }
  // Player rankings operations
  async getAllPlayerRankings() {
    return await db.select().from(playerRankings).orderBy(sql2`${playerRankings.rank} ASC`);
  }
  async getPlayerRanking(userId) {
    const result = await db.select().from(playerRankings).where(eq(playerRankings.userId, userId)).limit(1);
    return result[0];
  }
  async createOrUpdatePlayerRanking(ranking) {
    const existing = await this.getPlayerRanking(ranking.userId);
    if (existing) {
      const result = await db.update(playerRankings).set({ ...ranking, updatedAt: /* @__PURE__ */ new Date() }).where(eq(playerRankings.userId, ranking.userId)).returning();
      return result[0];
    } else {
      const result = await db.insert(playerRankings).values(ranking).returning();
      return result[0];
    }
  }
  async getTopPlayers(limit = 100) {
    return await db.select().from(playerRankings).orderBy(sql2`${playerRankings.rank} ASC`).limit(limit);
  }
};
var storage = new DbStorage();

// server/routes.ts
import { eq as eq2 } from "drizzle-orm";

// server/discord.ts
var DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
var DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
var getRedirectUri = () => {
  if (process.env.DISCORD_REDIRECT_URI) {
    return process.env.DISCORD_REDIRECT_URI;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/discord/callback`;
  }
  return "http://localhost:5000/api/auth/discord/callback";
};
var DISCORD_REDIRECT_URI = getRedirectUri();
function getDiscordAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email",
    state
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}
async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: DISCORD_REDIRECT_URI
  });
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }
  return await response.json();
}
async function getDiscordUserInfo(accessToken) {
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Discord user info");
  }
  const user = await response.json();
  return {
    discordId: user.id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
    email: user.email
  };
}

// server/email.ts
import { Resend } from "resend";
var connectionSettings;
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}
async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}
async function sendOrderConfirmationEmail(toEmail, orderId, orderTotal, redemptionCodes2) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const codesHtml = redemptionCodes2.map(({ code, packageName }) => `
      <div style="background-color: #1a2942; border: 2px solid #FFD700; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px;">${packageName}</p>
        <code style="color: #FFD700; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${code}</code>
      </div>
    `).join("");
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - AECOIN Store</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0f1e;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a2942 0%, #0d1d35 100%); border: 3px solid #FFD700; border-radius: 24px; padding: 40px; text-align: center;">
              <h1 style="color: #FFD700; font-size: 48px; margin: 0 0 16px 0; font-family: 'Bebas Neue', sans-serif; letter-spacing: 3px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);">
                AECOIN STORE
              </h1>
              <div style="width: 60px; height: 4px; background-color: #FFD700; margin: 0 auto 32px auto;"></div>
              
              <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 24px 0;">
                Order Confirmed!
              </h2>
              
              <div style="background-color: #0a0f1e; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px;">Order ID</p>
                <p style="color: #ffffff; margin: 0 0 16px 0; font-size: 16px;">#${orderId.slice(0, 8)}</p>
                
                <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px;">Total Paid</p>
                <p style="color: #FFD700; margin: 0; font-size: 32px; font-weight: bold;">RM${orderTotal}</p>
              </div>
              
              <h3 style="color: #FFD700; font-size: 24px; margin: 0 0 20px 0;">
                Your Redemption Codes
              </h3>
              
              <p style="color: #9ca3af; margin: 0 0 24px 0; font-size: 14px;">
                Use these codes in GTA 5 to redeem your AECOIN
              </p>
              
              ${codesHtml}
              
              <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255, 215, 0, 0.2);">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">
                  Thank you for your purchase! If you have any questions, please contact our support team.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  This is an automated email. Please do not reply to this message.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Order Confirmation #${orderId.slice(0, 8)} - AECOIN Store`,
      html
    });
    if (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
    console.log("Order confirmation email sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
}

// server/fivem-db.ts
import mysql from "mysql2/promise";
var pool2 = null;
function createPool() {
  if (!process.env.FIVEM_DB_HOST) {
    throw new Error("FiveM database credentials not configured");
  }
  return mysql.createPool({
    host: process.env.FIVEM_DB_HOST,
    user: process.env.FIVEM_DB_USER,
    password: process.env.FIVEM_DB_PASSWORD,
    database: process.env.FIVEM_DB_NAME,
    port: parseInt(process.env.FIVEM_DB_PORT || "3306"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}
function getPool() {
  if (!pool2) {
    pool2 = createPool();
  }
  return pool2;
}
async function insertRedemptionCodeToFiveM(code, creditValue) {
  try {
    const connection = getPool();
    const table = process.env.FIVEM_DB_TABLE || "ak4y_donatesystem_codes";
    const codeColumn = process.env.FIVEM_DB_COLUMN_CODE || "code";
    const creditColumn = process.env.FIVEM_DB_COLUMN_CREDITSVALUE || "credit";
    const query = `INSERT INTO ${table} (${codeColumn}, ${creditColumn}) VALUES (?, ?)`;
    await connection.execute(query, [code, creditValue]);
    console.log(`\u2713 Inserted code ${code} with ${creditValue} credits into FiveM database`);
    return true;
  } catch (error) {
    console.error("Failed to insert code into FiveM database:", error);
    throw error;
  }
}

// server/toyyibpay.ts
var TOYYIBPAY_BASE_URL = "https://toyyibpay.com";
var categoryCode = null;
async function ensureCategoryExists() {
  if (categoryCode) {
    return categoryCode;
  }
  if (!process.env.TOYYIBPAY_SECRET_KEY) {
    throw new Error("TOYYIBPAY_SECRET_KEY not configured");
  }
  try {
    const response = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/createCategory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        catname: "AECOIN Store",
        catdescription: "GTA Online virtual currency packages",
        userSecretKey: process.env.TOYYIBPAY_SECRET_KEY
      })
    });
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse ToyyibPay response:", responseText);
      throw new Error(`ToyyibPay API error: ${responseText}`);
    }
    const catCode = Array.isArray(data) ? data[0]?.CategoryCode : data?.CategoryCode;
    if (!catCode) {
      console.error("Invalid category response:", data);
      throw new Error(`Failed to create ToyyibPay category: ${responseText}`);
    }
    categoryCode = catCode;
    console.log("\u2713 ToyyibPay category created:", categoryCode);
    return categoryCode;
  } catch (error) {
    console.error("ToyyibPay category creation error:", error);
    throw error;
  }
}
async function createBill(params) {
  if (!process.env.TOYYIBPAY_SECRET_KEY) {
    throw new Error("TOYYIBPAY_SECRET_KEY not configured");
  }
  const catCode = await ensureCategoryExists();
  try {
    const response = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/createBill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
        categoryCode: catCode,
        billName: params.billName,
        billDescription: params.billDescription,
        billPriceSetting: "1",
        billPayorInfo: "1",
        billAmount: String(Math.round(params.billAmount * 100)),
        billReturnUrl: params.billReturnUrl,
        billCallbackUrl: params.billCallbackUrl,
        billExternalReferenceNo: params.billExternalReferenceNo,
        billTo: params.billTo,
        billEmail: params.billEmail,
        billPhone: params.billPhone || "0000000000",
        billPaymentChannel: "2",
        billChargeToCustomer: "1"
      })
    });
    const data = await response.json();
    if (!data || !data[0]?.BillCode) {
      throw new Error("Failed to create ToyyibPay bill");
    }
    const billCode = data[0].BillCode;
    console.log("\u2713 ToyyibPay bill created:", billCode);
    return billCode;
  } catch (error) {
    console.error("ToyyibPay bill creation error:", error);
    throw error;
  }
}
function getPaymentUrl(billCode) {
  return `${TOYYIBPAY_BASE_URL}/${billCode}`;
}
async function getBillTransactions(billCode) {
  try {
    const response = await fetch(`${TOYYIBPAY_BASE_URL}/index.php/api/getBillTransactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        billCode,
        billpaymentStatus: "1"
      })
    });
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("ToyyibPay transaction check error:", error);
    return [];
  }
}

// server/billplz.ts
import crypto from "crypto";
var BILLPLZ_BASE_URL = "https://www.billplz.com/api";
var collectionId = null;
async function ensureCollectionExists() {
  if (collectionId) {
    return collectionId;
  }
  if (!process.env.BILLPLZ_SECRET_KEY) {
    throw new Error("BILLPLZ_SECRET_KEY not configured");
  }
  try {
    const response = await fetch(`${BILLPLZ_BASE_URL}/v3/collections`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.BILLPLZ_SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "AECOIN Store",
        description: "GTA Online virtual currency packages"
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Billplz collection creation failed:", errorText);
      throw new Error(`Failed to create Billplz collection: ${errorText}`);
    }
    const data = await response.json();
    if (!data.id) {
      console.error("Invalid collection response:", data);
      throw new Error("Failed to create Billplz collection: No ID returned");
    }
    collectionId = data.id;
    console.log("\u2713 Billplz collection created:", collectionId);
    return collectionId;
  } catch (error) {
    console.error("Billplz collection creation error:", error);
    throw error;
  }
}
async function createBill2(params) {
  if (!process.env.BILLPLZ_SECRET_KEY) {
    throw new Error("BILLPLZ_SECRET_KEY not configured");
  }
  const collId = await ensureCollectionExists();
  try {
    const amountInCents = Math.round(params.amount * 100);
    const billData = {
      collection_id: collId,
      description: params.description,
      email: params.email,
      name: params.name,
      amount: amountInCents,
      callback_url: params.callbackUrl,
      redirect_url: params.redirectUrl
    };
    if (params.mobile) {
      billData.mobile = params.mobile;
    }
    if (params.reference1Label && params.reference1) {
      billData.reference_1_label = params.reference1Label;
      billData.reference_1 = params.reference1;
    }
    const response = await fetch(`${BILLPLZ_BASE_URL}/v3/bills`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.BILLPLZ_SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(billData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Billplz bill creation failed:", errorText);
      throw new Error(`Failed to create Billplz bill: ${errorText}`);
    }
    const data = await response.json();
    if (!data.id || !data.url) {
      console.error("Invalid bill response:", data);
      throw new Error("Failed to create Billplz bill: Invalid response");
    }
    console.log("\u2713 Billplz bill created:", data.id);
    return data;
  } catch (error) {
    console.error("Billplz bill creation error:", error);
    throw error;
  }
}
async function getBill(billId) {
  if (!process.env.BILLPLZ_SECRET_KEY) {
    throw new Error("BILLPLZ_SECRET_KEY not configured");
  }
  try {
    const response = await fetch(`${BILLPLZ_BASE_URL}/v3/bills/${billId}`, {
      method: "GET",
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.BILLPLZ_SECRET_KEY + ":").toString("base64")
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Billplz get bill failed:", errorText);
      throw new Error(`Failed to get Billplz bill: ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Billplz get bill error:", error);
    throw error;
  }
}
async function verifyBillPayment(billId) {
  try {
    const bill = await getBill(billId);
    return bill.paid === true && bill.state === "paid";
  } catch (error) {
    console.error("Billplz payment verification error:", error);
    return false;
  }
}
function verifyBillplzSignature(payload, signature) {
  if (!process.env.BILLPLZ_SIGNATURE_KEY) {
    console.warn("BILLPLZ_SIGNATURE_KEY not configured - skipping signature verification (DEVELOPMENT ONLY)");
    return true;
  }
  try {
    const expectedSignature = crypto.createHmac("sha256", process.env.BILLPLZ_SIGNATURE_KEY).update(payload).digest("hex");
    return expectedSignature === signature;
  } catch (error) {
    console.error("Billplz signature verification error:", error);
    return false;
  }
}

// server/types.ts
import "express-session";

// server/routes.ts
import crypto2 from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}
async function registerRoutes(app2) {
  app2.post("/api/seed-admin", async (req, res) => {
    try {
      const { username, email, password, setupToken } = req.body;
      const existingAdmins = await db.select().from(users).where(eq2(users.isAdmin, true));
      if (existingAdmins.length > 0) {
        return res.status(403).json({ message: "Admin already exists. Cannot create another via seed." });
      }
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const admin = await storage.createAdminUser(username, email, passwordHash);
      res.json({
        message: "Admin user created successfully",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          isAdmin: admin.isAdmin
        }
      });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Failed to create admin user", error: error.message });
    }
  });
  app2.get("/api/auth/discord", (req, res) => {
    const state = crypto2.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error during OAuth initiation:", err);
        return res.status(500).send("Authentication failed");
      }
      const authUrl = getDiscordAuthUrl(state);
      res.redirect(authUrl);
    });
  });
  app2.get("/api/auth/discord/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!state || state !== req.session.oauthState) {
      return res.status(403).send("Invalid state parameter");
    }
    delete req.session.oauthState;
    if (!code || typeof code !== "string") {
      return res.status(400).send("No code provided");
    }
    try {
      const tokenData = await exchangeCodeForToken(code);
      const discordUser = await getDiscordUserInfo(tokenData.access_token);
      let user = await storage.getUserByDiscordId(discordUser.discordId);
      if (!user) {
        user = await storage.createUser({
          discordId: discordUser.discordId,
          username: discordUser.username,
          email: discordUser.email || "",
          avatar: discordUser.avatar
        });
      }
      const oldSession = req.session;
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).send("Authentication failed");
        }
        req.session.userId = user.id;
        req.session.save((err2) => {
          if (err2) {
            console.error("Session save error:", err2);
            return res.status(500).send("Authentication failed");
          }
          res.redirect("/");
        });
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).send("Authentication failed");
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  });
  const adminLoginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user || !user.isAdmin || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        req.session.userId = user.id;
        req.session.loginMethod = "admin";
        res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar
          }
        });
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/packages", async (_req, res) => {
    const packages2 = await storage.getAllPackages();
    res.json(packages2);
  });
  app2.get("/api/packages/:id", async (req, res) => {
    const pkg = await storage.getPackage(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(pkg);
  });
  app2.get("/api/rankings", async (_req, res) => {
    const rankings = await storage.getAllPlayerRankings();
    res.json(rankings);
  });
  app2.get("/api/rankings/top/:limit?", async (req, res) => {
    const limit = parseInt(req.params.limit || "100");
    const rankings = await storage.getTopPlayers(limit);
    res.json(rankings);
  });
  app2.get("/api/cart", requireAuth, async (req, res) => {
    const items = await storage.getCartItems(req.session.userId);
    const itemsWithPackages = await Promise.all(
      items.map(async (item) => {
        const pkg = await storage.getPackage(item.packageId);
        return {
          ...item,
          package: pkg
        };
      })
    );
    res.json(itemsWithPackages);
  });
  app2.post("/api/cart", requireAuth, async (req, res) => {
    const { packageId, quantity } = req.body;
    const item = await storage.addToCart({
      userId: req.session.userId,
      packageId,
      quantity: quantity || 1
    });
    res.json(item);
  });
  app2.patch("/api/cart/:id", requireAuth, async (req, res) => {
    const { quantity } = req.body;
    const item = await storage.updateCartItemQuantity(req.params.id, quantity);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json(item);
  });
  app2.delete("/api/cart/:id", requireAuth, async (req, res) => {
    const success = await storage.removeFromCart(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed from cart" });
  });
  app2.delete("/api/cart", requireAuth, async (req, res) => {
    await storage.clearCart(req.session.userId);
    res.json({ message: "Cart cleared" });
  });
  app2.get("/api/orders", requireAuth, async (req, res) => {
    const orders2 = await storage.getUserOrders(req.session.userId);
    res.json(orders2);
  });
  app2.get("/api/orders/:id", requireAuth, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order || order.userId !== req.session.userId) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  });
  app2.get("/api/orders/:id/codes", requireAuth, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order || order.userId !== req.session.userId) {
      return res.status(404).json({ message: "Order not found" });
    }
    const codes = await storage.getOrderRedemptionCodes(req.params.id);
    res.json(codes);
  });
  app2.get("/api/coupons/:code", async (req, res) => {
    const coupon = await storage.getCoupon(req.params.code.toUpperCase());
    const subtotal = req.query.subtotal ? parseFloat(req.query.subtotal) : 0;
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is no longer active" });
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < /* @__PURE__ */ new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
    if (coupon.minPurchase && parseFloat(coupon.minPurchase) > subtotal) {
      return res.status(400).json({
        message: `Minimum purchase of RM${coupon.minPurchase} required`
      });
    }
    res.json(coupon);
  });
  function generateRedemptionCode(aecoinAmount) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const segments = 3;
    const segmentLength = 4;
    const code = [`AE${aecoinAmount}`];
    for (let i = 0; i < segments; i++) {
      let segment = "";
      for (let j = 0; j < segmentLength; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code.push(segment);
    }
    return code.join("-");
  }
  app2.post("/api/create-toyyibpay-bill", requireAuth, async (req, res) => {
    try {
      const { couponCode, billingInfo } = req.body;
      const userId = req.session.userId;
      if (!billingInfo || !billingInfo.fullName || !billingInfo.fullName.trim()) {
        return res.status(400).json({ message: "Full name is required" });
      }
      if (!billingInfo.email || !billingInfo.email.trim()) {
        return res.status(400).json({ message: "Email is required" });
      }
      const cartItems2 = await storage.getCartItems(userId);
      if (cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      let subtotal = 0;
      for (const item of cartItems2) {
        const pkg = await storage.getPackage(item.packageId);
        if (pkg) {
          subtotal += parseFloat(pkg.price) * item.quantity;
        }
      }
      let discount = 0;
      let validatedCoupon = null;
      if (couponCode) {
        const coupon = await storage.getCoupon(couponCode.toUpperCase());
        if (coupon && coupon.isActive) {
          const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < /* @__PURE__ */ new Date();
          const isOverUsed = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
          const belowMinPurchase = coupon.minPurchase && parseFloat(coupon.minPurchase) > subtotal;
          if (!isExpired && !isOverUsed && !belowMinPurchase) {
            validatedCoupon = coupon;
            if (coupon.discountType === "percentage") {
              discount = subtotal * parseFloat(coupon.discountValue) / 100;
            } else {
              discount = parseFloat(coupon.discountValue);
            }
          }
        }
      }
      const total = Math.max(0, subtotal - discount);
      if (total <= 0) {
        return res.status(400).json({ message: "Invalid order total" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const host = req.headers.host || "localhost:5000";
      const baseUrl = `${protocol}://${host}`;
      const externalReferenceNo = crypto2.randomUUID();
      const billCode = await createBill({
        billName: `AECOIN Order #${externalReferenceNo.substring(0, 8)}`,
        billDescription: `AECOIN Package Purchase`,
        billAmount: total,
        billTo: billingInfo.fullName.trim(),
        billEmail: billingInfo.email.trim(),
        billPhone: billingInfo.phoneNumber && billingInfo.phoneNumber.trim() ? billingInfo.phoneNumber.trim() : "0000000000",
        billExternalReferenceNo: externalReferenceNo,
        billReturnUrl: `${baseUrl}/api/toyyibpay/return`,
        billCallbackUrl: `${baseUrl}/api/toyyibpay/callback`
      });
      const cartSnapshot = await Promise.all(
        cartItems2.map(async (item) => {
          const pkg = await storage.getPackage(item.packageId);
          return {
            packageId: item.packageId,
            packageName: pkg?.name || "",
            quantity: item.quantity,
            price: pkg?.price || "0",
            aecoinAmount: pkg?.aecoinAmount || 0
          };
        })
      );
      await storage.createPendingPayment({
        userId,
        provider: "toyyibpay",
        externalId: billCode,
        amount: total.toFixed(2),
        currency: "MYR",
        status: "created",
        cartSnapshot: JSON.stringify(cartSnapshot),
        couponCode: validatedCoupon?.code || null,
        metadata: JSON.stringify({
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          externalReferenceNo
        })
      });
      const paymentUrl = getPaymentUrl(billCode);
      res.json({
        billCode,
        paymentUrl,
        amount: total,
        metadata: {
          couponCode: validatedCoupon?.code || "",
          subtotal: Math.round(subtotal),
          discount: Math.round(discount),
          total: Math.round(total)
        }
      });
    } catch (error) {
      console.error("ToyyibPay bill creation error:", error);
      res.status(500).json({
        message: "Error creating ToyyibPay bill: " + error.message
      });
    }
  });
  app2.get("/api/toyyibpay/callback", async (req, res) => {
    try {
      const { status_id, billcode } = req.query;
      console.log("ToyyibPay callback received:", { status_id, billcode });
      if (!billcode) {
        return res.status(200).send("OK");
      }
      const existingOrder = await storage.getOrderByPaymentId(billcode);
      if (existingOrder) {
        console.log(`Order already exists for ToyyibPay bill ${billcode}`);
        return res.status(200).send("OK");
      }
      if (status_id === "1") {
        const transactions = await getBillTransactions(billcode);
        if (transactions && transactions.length > 0 && transactions[0].billpaymentStatus === "1") {
          console.log("\u2713 ToyyibPay payment verified:", billcode);
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("ToyyibPay callback error:", error);
      res.status(200).send("OK");
    }
  });
  app2.get("/api/toyyibpay/return", async (req, res) => {
    try {
      const { status_id, billcode } = req.query;
      console.log("ToyyibPay return:", { status_id, billcode });
      if (!billcode || status_id !== "1") {
        return res.redirect(`/payment/failed?reason=invalid_status`);
      }
      const existingOrder = await storage.getOrderByPaymentId(billcode);
      if (existingOrder) {
        console.log(`Order already fulfilled for ToyyibPay bill ${billcode}`);
        return res.redirect(`/orders?payment=success&provider=toyyibpay`);
      }
      const pendingPayment = await storage.getPendingPaymentByExternalId(billcode);
      if (!pendingPayment) {
        console.error(`No pending payment found for ToyyibPay bill ${billcode}`);
        return res.redirect(`/payment/failed?reason=pending_not_found`);
      }
      const transactions = await getBillTransactions(billcode);
      if (!transactions || transactions.length === 0 || transactions[0].billpaymentStatus !== "1") {
        console.error(`ToyyibPay transaction verification failed for ${billcode}`);
        await storage.updatePendingPaymentStatus(billcode, "failed");
        return res.redirect(`/payment/failed?reason=verification_failed`);
      }
      const transaction = transactions[0];
      const paidAmountMYR = parseFloat(transaction.billpaymentAmount) / 100;
      const expectedAmountMYR = parseFloat(pendingPayment.amount);
      if (Math.abs(paidAmountMYR - expectedAmountMYR) > 0.01) {
        console.error(`ToyyibPay amount mismatch: paid RM${paidAmountMYR}, expected RM${expectedAmountMYR}`);
        await storage.updatePendingPaymentStatus(billcode, "failed");
        return res.redirect(`/payment/failed?reason=amount_mismatch`);
      }
      const cartSnapshot = JSON.parse(pendingPayment.cartSnapshot);
      const metadata = pendingPayment.metadata ? JSON.parse(pendingPayment.metadata) : {};
      const order = await storage.createOrder({
        userId: pendingPayment.userId,
        totalAmount: metadata.subtotal || pendingPayment.amount,
        discountAmount: metadata.discount || "0",
        finalAmount: pendingPayment.amount,
        status: "paid",
        paymentMethod: "toyyibpay",
        paymentId: billcode,
        couponCode: pendingPayment.couponCode
      });
      for (const item of cartSnapshot) {
        await storage.createOrderItem({
          orderId: order.id,
          packageId: item.packageId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        });
        for (let i = 0; i < item.quantity; i++) {
          const code = generateRedemptionCode(item.aecoinAmount);
          await storage.createRedemptionCode({
            code,
            packageId: item.packageId,
            orderId: order.id,
            aecoinAmount: item.aecoinAmount,
            status: "active"
          });
          try {
            await insertRedemptionCodeToFiveM(code, item.aecoinAmount);
          } catch (fivemError) {
            console.error(`Failed to insert code ${code} into FiveM:`, fivemError);
          }
        }
      }
      await storage.updateOrderStatus(order.id, "fulfilled");
      if (pendingPayment.couponCode) {
        const coupon = await storage.getCoupon(pendingPayment.couponCode);
        if (coupon) {
          await storage.incrementCouponUse(coupon.id);
        }
      }
      await storage.clearCart(pendingPayment.userId);
      await storage.updatePendingPaymentStatus(billcode, "succeeded");
      try {
        const user = await storage.getUser(pendingPayment.userId);
        if (user?.email) {
          const redemptionCodes2 = await storage.getOrderRedemptionCodes(order.id);
          const codesWithPackageNames = redemptionCodes2.map((code, idx) => ({
            code: code.code,
            packageName: cartSnapshot[idx]?.packageName || "AECOIN Package"
          }));
          await sendOrderConfirmationEmail(
            user.email,
            order.id,
            order.finalAmount,
            codesWithPackageNames
          );
        }
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }
      console.log(`\u2713 Order ${order.id} fulfilled via ToyyibPay`);
      res.redirect(`/orders?payment=success&provider=toyyibpay`);
    } catch (error) {
      console.error("ToyyibPay return error:", error);
      res.redirect(`/payment/failed?reason=server_error`);
    }
  });
  app2.post("/api/create-billplz-bill", requireAuth, async (req, res) => {
    try {
      const { couponCode, billingInfo } = req.body;
      const userId = req.session.userId;
      console.log("Billplz bill creation - billing info received:", billingInfo);
      if (!billingInfo || !billingInfo.fullName || !billingInfo.fullName.trim()) {
        return res.status(400).json({ message: "Full name is required" });
      }
      if (!billingInfo.email || !billingInfo.email.trim()) {
        return res.status(400).json({ message: "Email is required" });
      }
      const cartItems2 = await storage.getCartItems(userId);
      if (cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      let subtotal = 0;
      for (const item of cartItems2) {
        const pkg = await storage.getPackage(item.packageId);
        if (pkg) {
          subtotal += parseFloat(pkg.price) * item.quantity;
        }
      }
      let discount = 0;
      let validatedCoupon = null;
      if (couponCode) {
        const coupon = await storage.getCoupon(couponCode.toUpperCase());
        if (coupon && coupon.isActive) {
          const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < /* @__PURE__ */ new Date();
          const isOverUsed = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
          const belowMinPurchase = coupon.minPurchase && parseFloat(coupon.minPurchase) > subtotal;
          if (!isExpired && !isOverUsed && !belowMinPurchase) {
            validatedCoupon = coupon;
            if (coupon.discountType === "percentage") {
              discount = subtotal * parseFloat(coupon.discountValue) / 100;
            } else {
              discount = parseFloat(coupon.discountValue);
            }
          }
        }
      }
      const total = Math.max(0, subtotal - discount);
      if (total <= 0) {
        return res.status(400).json({ message: "Invalid order total" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const host = req.headers.host || "localhost:5000";
      const baseUrl = `${protocol}://${host}`;
      const externalReferenceNo = crypto2.randomUUID();
      const billResponse = await createBill2({
        description: `AECOIN Order #${externalReferenceNo.substring(0, 8)}`,
        amount: total,
        name: billingInfo.fullName.trim(),
        email: billingInfo.email.trim(),
        mobile: billingInfo.phoneNumber && billingInfo.phoneNumber.trim() ? billingInfo.phoneNumber.trim() : void 0,
        callbackUrl: `${baseUrl}/api/billplz/callback`,
        redirectUrl: `${baseUrl}/api/billplz/return`,
        reference1Label: "Order ID",
        reference1: externalReferenceNo
      });
      const cartSnapshot = await Promise.all(
        cartItems2.map(async (item) => {
          const pkg = await storage.getPackage(item.packageId);
          return {
            packageId: item.packageId,
            packageName: pkg?.name || "",
            quantity: item.quantity,
            price: pkg?.price || "0",
            aecoinAmount: pkg?.aecoinAmount || 0
          };
        })
      );
      await storage.createPendingPayment({
        userId,
        provider: "billplz",
        externalId: billResponse.id,
        amount: total.toFixed(2),
        currency: "MYR",
        status: "created",
        cartSnapshot: JSON.stringify(cartSnapshot),
        couponCode: validatedCoupon?.code || null,
        metadata: JSON.stringify({
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          externalReferenceNo
        })
      });
      res.json({
        billId: billResponse.id,
        paymentUrl: billResponse.url,
        amount: total,
        metadata: {
          couponCode: validatedCoupon?.code || "",
          subtotal: Math.round(subtotal),
          discount: Math.round(discount),
          total: Math.round(total)
        }
      });
    } catch (error) {
      console.error("Billplz bill creation error:", error);
      res.status(500).json({
        message: "Error creating Billplz bill: " + error.message
      });
    }
  });
  app2.post("/api/billplz/callback", async (req, res) => {
    try {
      const rawBody = typeof req.body === "string" ? req.body : "";
      const signature = req.headers["x-signature"];
      const isValidSignature = verifyBillplzSignature(rawBody, signature || "");
      if (!isValidSignature) {
        console.error("Invalid Billplz callback signature - possible fraud attempt");
        return res.status(200).send("OK");
      }
      const params = new URLSearchParams(rawBody);
      const id = params.get("id");
      const paid = params.get("paid");
      console.log("Billplz callback received:", { id, paid, hasSignature: !!signature });
      if (!id) {
        return res.status(200).send("OK");
      }
      const existingOrder = await storage.getOrderByPaymentId(id);
      if (existingOrder) {
        console.log(`Order already exists for Billplz bill ${id}`);
        return res.status(200).send("OK");
      }
      const pendingPayment = await storage.getPendingPaymentByExternalId(id);
      if (!pendingPayment) {
        console.error(`No pending payment found for Billplz bill ${id}`);
        return res.status(200).send("OK");
      }
      if (paid === "true" || paid === "1") {
        const billStatus = await verifyBillPayment(id);
        if (billStatus) {
          console.log("\u2713 Billplz payment verified:", id);
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Billplz callback error:", error);
      res.status(200).send("OK");
    }
  });
  app2.get("/api/billplz/return", async (req, res) => {
    try {
      const { billplz } = req.query;
      console.log("Billplz return:", { billplz });
      if (!billplz) {
        return res.redirect(`/payment/failed?reason=invalid_request`);
      }
      let billData;
      try {
        billData = typeof billplz === "string" ? JSON.parse(billplz) : billplz;
      } catch (parseError) {
        console.error("Failed to parse Billplz data:", parseError);
        return res.redirect(`/payment/failed?reason=invalid_data`);
      }
      const billId = billData.id;
      if (!billId || billData.paid !== true) {
        return res.redirect(`/payment/failed?reason=payment_not_completed`);
      }
      const existingOrder = await storage.getOrderByPaymentId(billId);
      if (existingOrder) {
        console.log(`Order already fulfilled for Billplz bill ${billId}`);
        return res.redirect(`/orders?payment=success&provider=billplz`);
      }
      const pendingPayment = await storage.getPendingPaymentByExternalId(billId);
      if (!pendingPayment) {
        console.error(`No pending payment found for Billplz bill ${billId}`);
        return res.redirect(`/payment/failed?reason=pending_not_found`);
      }
      const bill = await getBill(billId);
      if (!bill.paid || bill.state !== "paid") {
        console.error(`Billplz transaction verification failed for ${billId}`);
        await storage.updatePendingPaymentStatus(billId, "failed");
        return res.redirect(`/payment/failed?reason=verification_failed`);
      }
      const paidAmountMYR = bill.amount / 100;
      const expectedAmountMYR = parseFloat(pendingPayment.amount);
      if (Math.abs(paidAmountMYR - expectedAmountMYR) > 0.01) {
        console.error(`Billplz amount mismatch: paid RM${paidAmountMYR}, expected RM${expectedAmountMYR}`);
        await storage.updatePendingPaymentStatus(billId, "failed");
        return res.redirect(`/payment/failed?reason=amount_mismatch`);
      }
      const cartSnapshot = JSON.parse(pendingPayment.cartSnapshot);
      const metadata = pendingPayment.metadata ? JSON.parse(pendingPayment.metadata) : {};
      const order = await storage.createOrder({
        userId: pendingPayment.userId,
        totalAmount: metadata.subtotal || pendingPayment.amount,
        discountAmount: metadata.discount || "0",
        finalAmount: pendingPayment.amount,
        status: "paid",
        paymentMethod: "billplz",
        paymentId: billId,
        couponCode: pendingPayment.couponCode
      });
      for (const item of cartSnapshot) {
        await storage.createOrderItem({
          orderId: order.id,
          packageId: item.packageId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        });
        for (let i = 0; i < item.quantity; i++) {
          const code = generateRedemptionCode(item.aecoinAmount);
          await storage.createRedemptionCode({
            code,
            packageId: item.packageId,
            orderId: order.id,
            aecoinAmount: item.aecoinAmount,
            status: "active"
          });
          try {
            await insertRedemptionCodeToFiveM(code, item.aecoinAmount);
          } catch (fivemError) {
            console.error(`Failed to insert code ${code} into FiveM:`, fivemError);
          }
        }
      }
      await storage.updateOrderStatus(order.id, "fulfilled");
      if (pendingPayment.couponCode) {
        const coupon = await storage.getCoupon(pendingPayment.couponCode);
        if (coupon) {
          await storage.incrementCouponUse(coupon.id);
        }
      }
      await storage.clearCart(pendingPayment.userId);
      await storage.updatePendingPaymentStatus(billId, "succeeded");
      try {
        const user = await storage.getUser(pendingPayment.userId);
        if (user?.email) {
          const redemptionCodes2 = await storage.getOrderRedemptionCodes(order.id);
          const codesWithPackageNames = redemptionCodes2.map((code, idx) => ({
            code: code.code,
            packageName: cartSnapshot[idx]?.packageName || "AECOIN Package"
          }));
          await sendOrderConfirmationEmail(
            user.email,
            order.id,
            order.finalAmount,
            codesWithPackageNames
          );
        }
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }
      console.log(`\u2713 Order ${order.id} fulfilled via Billplz`);
      res.redirect(`/orders?payment=success&provider=billplz`);
    } catch (error) {
      console.error("Billplz return error:", error);
      res.redirect(`/payment/failed?reason=server_error`);
    }
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      const enrichedOrders = await Promise.all(
        orders2.map(async (order) => {
          const user = await storage.getUser(order.userId);
          const orderItems2 = await storage.getOrderItems(order.id);
          const redemptionCodes2 = await storage.getOrderRedemptionCodes(order.id);
          const enrichedOrderItems = await Promise.all(
            orderItems2.map(async (item) => {
              const pkg = await storage.getPackage(item.packageId);
              return {
                packageName: pkg?.name || "Unknown Package",
                quantity: item.quantity,
                price: item.priceAtPurchase
              };
            })
          );
          return {
            ...order,
            userName: user?.username || "Unknown User",
            userEmail: user?.email || "no-email@example.com",
            orderItems: enrichedOrderItems,
            redemptionCodes: redemptionCodes2.map((code) => ({
              code: code.code
            }))
          };
        })
      );
      res.json(enrichedOrders);
    } catch (error) {
      console.error("Admin orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Admin order update error:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  app2.post("/api/admin/packages", requireAdmin, async (req, res) => {
    try {
      const pkg = await storage.createPackage(req.body);
      res.json(pkg);
    } catch (error) {
      console.error("Admin package creation error:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });
  app2.patch("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    try {
      const pkg = await storage.updatePackage(req.params.id, req.body);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Admin package update error:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });
  app2.delete("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deletePackage(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Admin package deletion error:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });
  app2.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons2 = await storage.getAllCoupons();
      res.json(coupons2);
    } catch (error) {
      console.error("Admin coupons fetch error:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });
  app2.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupon = await storage.createCoupon(req.body);
      res.json(coupon);
    } catch (error) {
      console.error("Admin coupon creation error:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });
  app2.patch("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Admin coupon update error:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });
  app2.delete("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCoupon(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Admin coupon deletion error:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import fs from "fs";
import path from "path";
var app = express();
app.set("trust proxy", 1);
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
app.use("/api/billplz/callback", express.text({ type: "application/x-www-form-urlencoded" }));
app.use((req, res, next) => {
  if (req.path === "/api/billplz/callback") {
    return next();
  }
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.path === "/api/billplz/callback") {
    return next();
  }
  express.urlencoded({ extended: false })(req, res, next);
});
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1e3 * 60 * 60 * 24 * 7
    // 7 days
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use("/attached_assets", express.static("attached_assets"));
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
