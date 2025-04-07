import { Request, Response } from "express";
import { insertAccountSchema } from "@shared/schema";
import { z } from "zod";
import { storage } from "../storage";
import { hotmailService } from "../services/hotmail";

// Batch accounts schema
const batchAccountSchema = z.object({
  quantity: z.number().min(1).max(50),
  prefix: z.string().min(3).max(15)
});

export const accountController = {
  // Get all accounts
  getAccounts: async (_req: Request, res: Response) => {
    try {
      const accounts = await storage.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve accounts" });
    }
  },

  // Get a single account by ID
  getAccount: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve account" });
    }
  },

  // Create a new account
  createAccount: async (req: Request, res: Response) => {
    try {
      // Validate input
      const validationResult = insertAccountSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid account data", 
          errors: validationResult.error.errors 
        });
      }
      
      // Check if email already exists
      const existingAccount = await storage.getAccountByEmail(validationResult.data.email);
      
      if (existingAccount) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      // Create account in Hotmail
      try {
        await hotmailService.createAccount(
          validationResult.data.email,
          validationResult.data.password
        );
      } catch (error: any) {
        return res.status(400).json({ message: error.message || "Failed to create Hotmail account" });
      }
      
      // Store account in our system
      const newAccount = await storage.createAccount(validationResult.data);
      
      res.status(201).json(newAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to create account" });
    }
  },

  // Create multiple accounts in batch
  createBatchAccounts: async (req: Request, res: Response) => {
    try {
      // Validate input
      const validationResult = batchAccountSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid batch data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { quantity, prefix } = validationResult.data;
      
      // Create accounts
      const results = await hotmailService.createBatchAccounts(quantity, prefix);
      
      // Save the accounts to database
      const savedAccounts = [];
      for (const account of results.accounts) {
        try {
          const savedAccount = await storage.createAccount({
            label: account.label,
            email: account.email,
            password: account.password,
            autoMaintain: account.autoMaintain
          });
          savedAccounts.push(savedAccount);
        } catch (error) {
          console.error(`Failed to save account ${account.email} to database:`, error);
        }
      }
      
      res.status(201).json({
        message: "Batch account creation completed",
        total: quantity,
        created: results.successCount,
        failed: results.failedCount,
        accounts: savedAccounts.length > 0 ? savedAccounts : results.accounts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create batch accounts" });
    }
  },

  // Delete an account
  deleteAccount: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      await storage.deleteAccount(id);
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  },

  // Maintain an account to keep it active
  maintainAccount: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Perform maintenance activities to keep account active
      try {
        await hotmailService.maintainAccount(account.email, account.password);
        
        // Update last checked time and status
        await storage.updateAccount(id, {
          lastChecked: new Date(),
          status: "active"
        });
        
        res.json({ message: "Account maintenance completed successfully" });
      } catch (error: any) {
        // Update status to warn about maintenance failure
        await storage.updateAccount(id, {
          status: "warning"
        });
        
        res.status(400).json({ message: error.message || "Account maintenance failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to maintain account" });
    }
  }
};
