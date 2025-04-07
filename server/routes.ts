import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { accountController } from "./controllers/account";
import { emailController } from "./controllers/email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router with prefix /api
  const apiRouter = express.Router();
  
  // Account routes
  apiRouter.get("/accounts", accountController.getAccounts);
  apiRouter.post("/accounts", accountController.createAccount);
  apiRouter.post("/accounts/batch", accountController.createBatchAccounts);
  apiRouter.get("/accounts/:id", accountController.getAccount);
  apiRouter.delete("/accounts/:id", accountController.deleteAccount);
  apiRouter.post("/accounts/:id/maintain", accountController.maintainAccount);
  
  // Email routes
  apiRouter.get("/accounts/:id/emails", emailController.getEmails);
  apiRouter.post("/accounts/:id/emails", emailController.fetchEmails);
  apiRouter.get("/emails/:id", emailController.getEmail);
  apiRouter.patch("/emails/:id/read", emailController.markAsRead);
  
  // Settings routes
  apiRouter.get("/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve settings" });
    }
  });
  
  apiRouter.patch("/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
