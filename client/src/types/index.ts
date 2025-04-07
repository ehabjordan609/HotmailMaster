import { Account, Email, Settings } from "@shared/schema";

export type AccountStatus = "active" | "warning" | "needs-action";

export type TabType = "dashboard" | "create" | "settings";

export interface SelectedAccountContext {
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

// Add any additional type definitions here
