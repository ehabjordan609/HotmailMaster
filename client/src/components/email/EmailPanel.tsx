import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Account, Email } from "@shared/schema";
import { API_ROUTES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import EmailList from "./EmailList";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, replaceRouteParams } from "@/lib/utils";

interface EmailPanelProps {
  account: Account;
  onClose: () => void;
}

const EmailPanel = ({ account, onClose }: EmailPanelProps) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations
  const refreshEmailsMutation = useMutation({
    mutationFn: () => apiRequest("POST", replaceRouteParams(API_ROUTES.ACCOUNT_EMAILS, { id: account.id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [replaceRouteParams(API_ROUTES.ACCOUNT_EMAILS, { id: account.id })] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [API_ROUTES.ACCOUNTS] 
      });
      toast({
        title: "Emails refreshed",
        description: "Your emails have been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to refresh emails",
        description: error.message || "There was an error refreshing your emails.",
        variant: "destructive"
      });
    }
  });

  const maintainAccountMutation = useMutation({
    mutationFn: () => apiRequest(
      "POST", 
      replaceRouteParams(API_ROUTES.ACCOUNT_MAINTENANCE, { id: account.id })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.ACCOUNTS] });
      toast({
        title: "Account maintained",
        description: "Your account has been successfully maintained."
      });
    },
    onError: (error) => {
      toast({
        title: "Maintenance failed",
        description: error.message || "There was an error maintaining your account.",
        variant: "destructive"
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiRequest(
      "DELETE", 
      `${API_ROUTES.ACCOUNTS}/${account.id}`
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.ACCOUNTS] });
      toast({
        title: "Account deleted",
        description: "The account has been successfully removed."
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting your account.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteAccount = () => {
    if (window.confirm(`Are you sure you want to delete the account ${account.email}?`)) {
      deleteAccountMutation.mutate();
    }
  };

  return (
    <div className="w-full lg:w-2/3 xl:w-3/4 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-[#d2d0ce] flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#201f1e]">{account.email}</h2>
          <div className="flex items-center mt-1">
            <StatusBadge status={account.status} />
            <span className="text-sm text-[#605e5c] ml-2">
              • {account.unreadCount} unread email{account.unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex">
          <Button 
            variant="ghost"
            size="icon"
            className="ml-2 p-2 rounded-md text-[#323130] hover:bg-[#f3f2f1] hover:text-[#0078d4]"
            onClick={() => refreshEmailsMutation.mutate()}
            disabled={refreshEmailsMutation.isPending}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${refreshEmailsMutation.isPending ? 'animate-spin' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="ml-2 p-2 rounded-md text-[#323130] hover:bg-[#f3f2f1] hover:text-[#0078d4]"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="ml-2 p-2 rounded-md text-[#323130] hover:bg-[#f3f2f1] hover:text-[#d13438]"
            onClick={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b border-[#d2d0ce] flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            className="p-2 rounded-md text-white bg-[#0078d4] hover:bg-[#106ebe] flex items-center"
            onClick={() => refreshEmailsMutation.mutate()}
            disabled={refreshEmailsMutation.isPending}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-1 ${refreshEmailsMutation.isPending ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            <span>{refreshEmailsMutation.isPending ? "Checking..." : "Check Emails"}</span>
          </Button>
          <Button 
            variant="outline"
            className="ml-3 p-2 rounded-md text-[#323130] border border-[#d2d0ce] hover:bg-[#f3f2f1] flex items-center"
            onClick={() => maintainAccountMutation.mutate()}
            disabled={maintainAccountMutation.isPending}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-1 ${maintainAccountMutation.isPending ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
            <span>{maintainAccountMutation.isPending ? "Maintaining..." : "Maintain Account"}</span>
          </Button>
        </div>
        <div className="text-sm text-[#605e5c]">
          Last checked: {account.lastChecked ? formatDistanceToNow(account.lastChecked) : 'Never'}
        </div>
      </div>
      
      {/* Email content area */}
      <EmailList accountId={account.id} onSelectEmail={setSelectedEmail} />
    </div>
  );
};

export default EmailPanel;
