import { Account } from "@shared/schema";
import { formatDistanceToNow } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

interface AccountCardProps {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
}

const AccountCard = ({ account, isSelected, onClick }: AccountCardProps) => {
  const { id, label, email, status, lastChecked, unreadCount } = account;
  
  return (
    <div 
      className={`account-card p-4 hover:bg-[#f3f2f1] cursor-pointer border-l-4 ${
        isSelected ? 'border-[#0078d4]' : 'border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium account-label">{label}</h3>
          <p className="text-sm text-[#605e5c] account-username">{email}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-2 flex items-center text-xs text-[#605e5c]">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span>Last checked: {lastChecked ? formatDistanceToNow(lastChecked) : 'Never'}</span>
      </div>
      <div className="mt-2 text-xs text-[#605e5c]">
        <span>{unreadCount} unread emails</span>
      </div>
    </div>
  );
};

export default AccountCard;
