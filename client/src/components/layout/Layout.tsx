import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { TabType } from "@/types";
import { useLocation } from "wouter";
import { ROUTES } from "@/lib/constants";

interface LayoutProps {
  children: React.ReactNode;
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

const Layout = ({ children, selectedAccountId, setSelectedAccountId }: LayoutProps) => {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine active tab based on current route
  let activeTab: TabType = "dashboard"; // Default
  if (location === ROUTES.CREATE_ACCOUNT) activeTab = "create";
  else if (location === ROUTES.SETTINGS) activeTab = "settings";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f2f1] text-[#201f1e] font-sans">
      <Header toggleSidebar={toggleSidebar} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeMenu={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 lg:pt-0 lg:ml-64">
        <div className="bg-white border-b border-[#d2d0ce] px-6 flex">
          <button 
            onClick={() => window.location.href = ROUTES.DASHBOARD}
            className={`py-4 px-6 font-medium text-sm rounded-t-md ${
              activeTab === "dashboard" 
                ? "text-white bg-[#0078d4]" 
                : "text-[#323130] bg-[#f3f2f1]"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => window.location.href = ROUTES.CREATE_ACCOUNT}
            className={`py-4 px-6 font-medium text-sm rounded-t-md ml-2 ${
              activeTab === "create" 
                ? "text-white bg-[#0078d4]" 
                : "text-[#323130] bg-[#f3f2f1]"
            }`}
          >
            Create Account
          </button>
          <button 
            onClick={() => window.location.href = ROUTES.SETTINGS}
            className={`py-4 px-6 font-medium text-sm rounded-t-md ml-2 ${
              activeTab === "settings" 
                ? "text-white bg-[#0078d4]" 
                : "text-[#323130] bg-[#f3f2f1]"
            }`}
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
