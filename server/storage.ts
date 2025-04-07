import { 
  users, type User, type InsertUser,
  type Account, type InsertAccount, 
  type Email, type InsertEmail,
  type Settings, type UpdateSettings
} from "@shared/schema";

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

export const storage = new MemStorage();
