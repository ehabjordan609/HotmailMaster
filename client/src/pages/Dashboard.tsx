import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AccountList from "@/components/account/AccountList";
import EmailPanel from "@/components/email/EmailPanel";
import EmptyState from "@/components/email/EmptyState";
import { API_ROUTES } from "@/lib/constants";
import { Account } from "@shared/schema";

interface DashboardProps {
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

const Dashboard = ({ selectedAccountId, setSelectedAccountId }: DashboardProps) => {
  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: [API_ROUTES.ACCOUNTS],
  });

  // Find the selected account from the accounts list
  const selectedAccount = accounts?.find(account => account.id === selectedAccountId);

  // Reset selected account if it no longer exists in the list
  useEffect(() => {
    if (!isLoading && accounts && selectedAccountId && !accounts.some(a => a.id === selectedAccountId)) {
      setSelectedAccountId(null);
    }
  }, [accounts, selectedAccountId, setSelectedAccountId, isLoading]);

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <AccountList
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
      />
      
      {selectedAccount ? (
        <EmailPanel 
          account={selectedAccount} 
          onClose={() => setSelectedAccountId(null)} 
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default Dashboard;
