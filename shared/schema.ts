import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").notNull().default("active"),
  lastChecked: timestamp("last_checked"),
  unreadCount: integer("unread_count").default(0),
  autoMaintain: boolean("auto_maintain").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  sender: text("sender").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  preview: text("preview").notNull(),
  isRead: boolean("is_read").default(false),
  receivedAt: timestamp("received_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  maintenanceFrequency: text("maintenance_frequency").notNull().default("every-3-days"),
  emailCheckFrequency: text("email_check_frequency").notNull().default("every-hour"),
  notifyLogin: boolean("notify_login").default(true),
  notifyEmails: boolean("notify_emails").default(true),
  notifyWarnings: boolean("notify_warnings").default(true),
});

// Define relations
export const accountsRelations = relations(accounts, ({ many }) => ({
  emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  account: one(accounts, {
    fields: [emails.accountId],
    references: [accounts.id],
  }),
}));

// Account schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  lastChecked: true,
  unreadCount: true,
  createdAt: true
});

export const accountSchema = z.object({
  id: z.number(),
  label: z.string(),
  email: z.string().email(),
  password: z.string(),
  status: z.enum(["active", "warning", "needs-action"]),
  lastChecked: z.date().nullable(),
  unreadCount: z.number().default(0),
  autoMaintain: z.boolean().default(true),
  createdAt: z.date()
});

// Email schemas
export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true, 
  receivedAt: true
});

export const emailSchema = z.object({
  id: z.number(),
  accountId: z.number(),
  sender: z.string(),
  subject: z.string(),
  content: z.string(),
  preview: z.string(),
  isRead: z.boolean().default(false),
  receivedAt: z.date()
});

// Settings schema
export const updateSettingsSchema = createInsertSchema(settings).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = z.infer<typeof accountSchema>;

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = z.infer<typeof emailSchema>;

export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
