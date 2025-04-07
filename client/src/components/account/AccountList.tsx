import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AccountCard from "./AccountCard";
import { API_ROUTES } from "@/lib/constants";
import { Account } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountListProps {
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

const AccountList = ({ selectedAccountId, setSelectedAccountId }: AccountListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: [API_ROUTES.ACCOUNTS],
  });

  // Filter accounts based on search query
  const filteredAccounts = accounts?.filter(account => 
    account.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 bg-white border-r border-[#d2d0ce] overflow-y-auto h-full">
      <div className="p-4 border-b border-[#d2d0ce]">
        <h2 className="text-lg font-semibold text-[#201f1e]">Your Accounts</h2>
        <p className="text-sm text-[#605e5c] mt-1">Manage your Hotmail accounts</p>
      </div>
      
      <div className="p-4 border-b border-[#d2d0ce]">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search accounts..." 
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[#d2d0ce] focus:border-[#0078d4] focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-2.5 text-[#605e5c]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* Account list */}
      <div id="accounts-container" className="divide-y divide-[#d2d0ce]">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-3" />
                  <Skeleton className="h-3 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))
        ) : filteredAccounts && filteredAccounts.length > 0 ? (
          filteredAccounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={selectedAccountId === account.id}
              onClick={() => setSelectedAccountId(account.id)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#605e5c]">No accounts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountList;
