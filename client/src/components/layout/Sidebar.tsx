import { Link } from "wouter";
import { TabType } from "@/types";
import { ROUTES } from "@/lib/constants";

interface SidebarProps {
  isOpen: boolean;
  closeMenu: () => void;
  activeTab: TabType;
}

const Sidebar = ({ isOpen, closeMenu, activeTab }: SidebarProps) => {
  return (
    <aside 
      className={`${isOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 flex-col bg-white border-r border-[#d2d0ce] h-full`}
    >
      <div className="p-6">
        <h1 className="text-xl font-semibold text-[#0078d4]">Hotmail Manager</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul>
          <li>
            <Link href={ROUTES.DASHBOARD} onClick={closeMenu}>
              <a className={`flex items-center px-6 py-3 ${
                activeTab === "dashboard" 
                  ? "text-[#0078d4] bg-[#0078d4] bg-opacity-10 border-l-4 border-[#0078d4]" 
                  : "text-[#323130] hover:bg-[#f3f2f1] hover:text-[#0078d4]"
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
                <span>Dashboard</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href={ROUTES.CREATE_ACCOUNT} onClick={closeMenu}>
              <a className={`flex items-center px-6 py-3 ${
                activeTab === "create" 
                  ? "text-[#0078d4] bg-[#0078d4] bg-opacity-10 border-l-4 border-[#0078d4]" 
                  : "text-[#323130] hover:bg-[#f3f2f1] hover:text-[#0078d4]"
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                <span>Create Account</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/emails" onClick={closeMenu}>
              <a className="flex items-center px-6 py-3 text-[#323130] hover:bg-[#f3f2f1] hover:text-[#0078d4]">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-3" 
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
                <span>Email Reader</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href={ROUTES.SETTINGS} onClick={closeMenu}>
              <a className={`flex items-center px-6 py-3 ${
                activeTab === "settings" 
                  ? "text-[#0078d4] bg-[#0078d4] bg-opacity-10 border-l-4 border-[#0078d4]" 
                  : "text-[#323130] hover:bg-[#f3f2f1] hover:text-[#0078d4]"
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-3" 
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
                <span>Settings</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-6 border-t border-[#d2d0ce]">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#0078d4] text-white flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-[#605e5c]">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
