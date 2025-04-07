import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/lib/constants";
import { Email } from "@shared/schema";
import { truncateText, replaceRouteParams } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailListProps {
  accountId: number;
  onSelectEmail: (email: Email) => void;
}

const EmailList = ({ accountId, onSelectEmail }: EmailListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: emails, isLoading } = useQuery<Email[]>({
    queryKey: [replaceRouteParams(API_ROUTES.ACCOUNT_EMAILS, { id: accountId })],
    enabled: !!accountId
  });

  // Filter emails based on search query
  const filteredEmails = emails?.filter(email => 
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format email received time for display
  const formatEmailTime = (date: Date) => {
    const now = new Date();
    const emailDate = new Date(date);
    
    // If same day, show time
    if (now.toDateString() === emailDate.toDateString()) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within 7 days, show day name
    const diffDays = Math.floor((now.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return emailDate.toLocaleDateString([], { weekday: 'long' });
    }
    
    // Otherwise show month and day
    return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative w-full">
        <input 
          type="text" 
          placeholder="Search emails..." 
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
      
      {isLoading ? (
        // Loading skeleton
        <div className="divide-y divide-[#d2d0ce] mt-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
            </div>
          ))}
        </div>
      ) : filteredEmails && filteredEmails.length > 0 ? (
        <div className="divide-y divide-[#d2d0ce] mt-4">
          {filteredEmails.map(email => (
            <div 
              key={email.id} 
              className="p-4 hover:bg-[#f3f2f1] cursor-pointer"
              onClick={() => onSelectEmail(email)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{email.sender}</h3>
                  <p className="font-medium text-[#201f1e]">{email.subject}</p>
                  <p className="text-sm text-[#605e5c] line-clamp-2 mt-1">{truncateText(email.preview, 100)}</p>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-xs text-[#605e5c]">{formatEmailTime(email.receivedAt)}</span>
                  {!email.isRead && <span className="inline-block w-3 h-3 rounded-full bg-[#0078d4] mt-1"></span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center mt-8">
          <div className="inline-block p-4 rounded-full bg-[#f3f2f1]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#a19f9d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-[#323130]">No emails found</h3>
          <p className="mt-2 text-[#605e5c]">Check again later or try refreshing</p>
        </div>
      )}
    </div>
  );
};

export default EmailList;
