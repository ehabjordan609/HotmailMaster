export const FREQUENCIES = {
  MAINTENANCE: [
    { label: "Every 3 days", value: "every-3-days" },
    { label: "Weekly", value: "weekly" },
    { label: "Every 2 weeks", value: "every-2-weeks" },
    { label: "Monthly", value: "monthly" }
  ],
  EMAIL_CHECK: [
    { label: "Every hour", value: "every-hour" },
    { label: "Every 6 hours", value: "every-6-hours" },
    { label: "Every 12 hours", value: "every-12-hours" },
    { label: "Daily", value: "daily" }
  ]
};

export const STATUS_COLORS = {
  active: "bg-[#107c10]",
  warning: "bg-[#ffb900]",
  "needs-action": "bg-[#d13438]"
};

export const STATUS_LABELS = {
  active: "Active",
  warning: "Warning",
  "needs-action": "Needs Action"
};

export const ROUTES = {
  DASHBOARD: "/",
  CREATE_ACCOUNT: "/create",
  SETTINGS: "/settings"
};

export const API_ROUTES = {
  ACCOUNTS: "/api/accounts",
  EMAILS: "/api/emails",
  SETTINGS: "/api/settings",
  ACCOUNT_MAINTENANCE: "/api/accounts/:id/maintain",
  ACCOUNT_EMAILS: "/api/accounts/:id/emails",
};
