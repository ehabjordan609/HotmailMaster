import { Request, Response } from "express";
import { storage } from "../storage";
import { hotmailService } from "../services/hotmail";

export const emailController = {
  // Get all emails for an account
  getEmails: async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      const emails = await storage.getEmailsByAccountId(accountId);
      
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve emails" });
    }
  },

  // Fetch new emails for an account
  fetchEmails: async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Fetch emails from Hotmail
      try {
        const newEmails = await hotmailService.fetchEmails(account.email, account.password);
        
        // Save new emails
        for (const email of newEmails) {
          await storage.createEmail({
            accountId,
            sender: email.sender,
            subject: email.subject,
            content: email.content,
            preview: email.preview,
            isRead: false
          });
        }
        
        // Update account's last checked time and unread count
        await storage.updateAccount(accountId, {
          lastChecked: new Date(),
          unreadCount: (account.unreadCount || 0) + newEmails.length
        });
        
        // Get updated list of all emails
        const emails = await storage.getEmailsByAccountId(accountId);
        
        res.json({
          message: `${newEmails.length} new emails fetched`,
          emails
        });
      } catch (error: any) {
        // Update account status if fetching fails
        await storage.updateAccount(accountId, {
          status: "warning"
        });
        
        res.status(400).json({ message: error.message || "Failed to fetch emails" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  },

  // Get a single email by ID
  getEmail: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      
      const email = await storage.getEmail(id);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve email" });
    }
  },

  // Mark an email as read
  markAsRead: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      
      const email = await storage.getEmail(id);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Update email read status
      const updatedEmail = await storage.updateEmail(id, { isRead: true });
      
      // Update account unread count
      const account = await storage.getAccount(email.accountId);
      if (account && account.unreadCount > 0 && !email.isRead) {
        await storage.updateAccount(email.accountId, {
          unreadCount: account.unreadCount - 1
        });
      }
      
      res.json(updatedEmail);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark email as read" });
    }
  }
};
