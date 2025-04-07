import { 
  users, accounts, emails, settings,
  type User, type InsertUser,
  type Account, type InsertAccount, 
  type Email, type InsertEmail,
  type Settings, type UpdateSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account methods
  getAllAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByEmail(email: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, data: Partial<Account>): Promise<Account>;
  deleteAccount(id: number): Promise<void>;
  
  // Email methods
  getEmailsByAccountId(accountId: number): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, data: Partial<Email>): Promise<Email>;
  
  // Settings methods
  getSettings(): Promise<Settings>;
  updateSettings(data: Partial<UpdateSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private emails: Map<number, Email>;
  private settings: Settings;
  private userId: number;
  private accountId: number;
  private emailId: number;

  constructor() {
    // Initialize storage
    this.users = new Map();
    this.accounts = new Map();
    this.emails = new Map();
    this.userId = 1;
    this.accountId = 1;
    this.emailId = 1;
    
    // Default settings
    this.settings = {
      id: 1,
      maintenanceFrequency: "every-3-days",
      emailCheckFrequency: "every-hour",
      notifyLogin: true,
      notifyEmails: true,
      notifyWarnings: true
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Account methods
  async getAllAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async getAccountByEmail(email: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.email === email,
    );
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.accountId++;
    
    // Explicit creation of account with default values
    const account: Account = {
      id,
      label: insertAccount.label,
      email: insertAccount.email,
      password: insertAccount.password,
      status: "active",
      lastChecked: null,
      unreadCount: 0,
      autoMaintain: true,
      createdAt: new Date()
    };
    
    this.accounts.set(id, account);
    return account;
  }
  
  async updateAccount(id: number, data: Partial<Account>): Promise<Account> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`Account with ID ${id} not found`);
    }
    
    const updatedAccount = { ...account, ...data };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteAccount(id: number): Promise<void> {
    this.accounts.delete(id);
    
    // Also delete associated emails
    const accountEmails = Array.from(this.emails.values())
      .filter(email => email.accountId === id);
      
    for (const email of accountEmails) {
      this.emails.delete(email.id);
    }
  }
  
  // Email methods
  async getEmailsByAccountId(accountId: number): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.accountId === accountId)
      .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime()); // Sort newest first
  }
  
  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }
  
  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = this.emailId++;
    
    // Explicit creation of email with default values
    const email: Email = {
      id,
      accountId: insertEmail.accountId,
      sender: insertEmail.sender,
      subject: insertEmail.subject,
      content: insertEmail.content,
      preview: insertEmail.preview,
      isRead: false,
      receivedAt: new Date()
    };
    
    this.emails.set(id, email);
    return email;
  }
  
  async updateEmail(id: number, data: Partial<Email>): Promise<Email> {
    const email = this.emails.get(id);
    if (!email) {
      throw new Error(`Email with ID ${id} not found`);
    }
    
    const updatedEmail = { ...email, ...data };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.settings;
  }
  
  async updateSettings(data: Partial<UpdateSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Account methods
  async getAllAccounts(): Promise<Account[]> {
    const accountList = await db.select().from(accounts);
    return accountList.map(account => ({
      ...account,
      status: account.status as "active" | "warning" | "needs-action",
      lastChecked: account.lastChecked ? new Date(account.lastChecked) : null,
      unreadCount: account.unreadCount || 0,
      autoMaintain: account.autoMaintain === null ? true : account.autoMaintain,
      createdAt: new Date(account.createdAt!)
    }));
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    if (!account) return undefined;
    
    return {
      ...account,
      status: account.status as "active" | "warning" | "needs-action",
      lastChecked: account.lastChecked ? new Date(account.lastChecked) : null,
      unreadCount: account.unreadCount || 0,
      autoMaintain: account.autoMaintain === null ? true : account.autoMaintain,
      createdAt: new Date(account.createdAt!)
    };
  }
  
  async getAccountByEmail(email: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.email, email));
    if (!account) return undefined;
    
    return {
      ...account,
      status: account.status as "active" | "warning" | "needs-action",
      lastChecked: account.lastChecked ? new Date(account.lastChecked) : null,
      unreadCount: account.unreadCount || 0,
      autoMaintain: account.autoMaintain === null ? true : account.autoMaintain,
      createdAt: new Date(account.createdAt!)
    };
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values({
        ...insertAccount,
        status: "active",
        unreadCount: 0,
        autoMaintain: true
      })
      .returning();
      
    return {
      ...account,
      status: account.status as "active" | "warning" | "needs-action",
      lastChecked: account.lastChecked ? new Date(account.lastChecked) : null,
      unreadCount: account.unreadCount || 0,
      autoMaintain: account.autoMaintain === null ? true : account.autoMaintain,
      createdAt: new Date(account.createdAt!)
    };
  }
  
  async updateAccount(id: number, data: Partial<Account>): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, id))
      .returning();
      
    if (!account) {
      throw new Error(`Account with ID ${id} not found`);
    }
    
    return {
      ...account,
      status: account.status as "active" | "warning" | "needs-action",
      lastChecked: account.lastChecked ? new Date(account.lastChecked) : null,
      unreadCount: account.unreadCount || 0,
      autoMaintain: account.autoMaintain === null ? true : account.autoMaintain,
      createdAt: new Date(account.createdAt!)
    };
  }
  
  async deleteAccount(id: number): Promise<void> {
    // Emails will be automatically deleted due to foreign key constraint with cascade delete
    await db.delete(accounts).where(eq(accounts.id, id));
  }
  
  // Email methods
  async getEmailsByAccountId(accountId: number): Promise<Email[]> {
    const emailList = await db
      .select()
      .from(emails)
      .where(eq(emails.accountId, accountId))
      .orderBy(desc(emails.receivedAt)); // Sort newest first
      
    return emailList.map(email => ({
      ...email,
      isRead: email.isRead === null ? false : email.isRead,
      receivedAt: new Date(email.receivedAt!)
    }));
  }
  
  async getEmail(id: number): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    if (!email) return undefined;
    
    return {
      ...email,
      isRead: email.isRead === null ? false : email.isRead,
      receivedAt: new Date(email.receivedAt!)
    };
  }
  
  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values({
        ...insertEmail,
        isRead: false
      })
      .returning();
      
    return {
      ...email,
      isRead: email.isRead === null ? false : email.isRead,
      receivedAt: new Date(email.receivedAt!)
    };
  }
  
  async updateEmail(id: number, data: Partial<Email>): Promise<Email> {
    const [email] = await db
      .update(emails)
      .set(data)
      .where(eq(emails.id, id))
      .returning();
      
    if (!email) {
      throw new Error(`Email with ID ${id} not found`);
    }
    
    return {
      ...email,
      isRead: email.isRead === null ? false : email.isRead,
      receivedAt: new Date(email.receivedAt!)
    };
  }
  
  // Settings methods
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings);
    
    // Create default settings if none exist
    if (!setting) {
      const [newSetting] = await db
        .insert(settings)
        .values({
          maintenanceFrequency: "every-3-days",
          emailCheckFrequency: "every-hour",
          notifyLogin: true,
          notifyEmails: true,
          notifyWarnings: true
        })
        .returning();
        
      return newSetting;
    }
    
    return setting;
  }
  
  async updateSettings(data: Partial<UpdateSettings>): Promise<Settings> {
    const [currentSettings] = await db.select().from(settings);
    
    // If settings don't exist, create them
    if (!currentSettings) {
      return this.getSettings();
    }
    
    // Update existing settings
    const [updated] = await db
      .update(settings)
      .set(data)
      .where(eq(settings.id, currentSettings.id))
      .returning();
      
    return updated;
  }
}

// Use the database implementation
export const storage = new DatabaseStorage();
