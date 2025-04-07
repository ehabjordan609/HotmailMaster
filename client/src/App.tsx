import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CreateAccount from "@/pages/CreateAccount";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { ROUTES } from "./lib/constants";

function Router() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  return (
    <Layout selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId}>
      <Switch>
        <Route 
          path={ROUTES.DASHBOARD} 
          component={() => <Dashboard selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />} 
        />
        <Route path={ROUTES.CREATE_ACCOUNT} component={CreateAccount} />
        <Route path={ROUTES.SETTINGS} component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
