import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";

const EmptyState = () => {
  return (
    <div className="w-full lg:w-2/3 xl:w-3/4 bg-white h-full flex flex-col items-center justify-center" id="empty-state">
      <div className="text-center max-w-md p-6">
        <div className="inline-block p-4 rounded-full bg-[#f3f2f1]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-[#a19f9d]" 
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
        <h2 className="mt-4 text-xl font-semibold text-[#201f1e]">Select an account</h2>
        <p className="mt-2 text-[#605e5c]">Choose an account from the list on the left or create a new one to get started.</p>
        <Link href={ROUTES.CREATE_ACCOUNT}>
          <a className="mt-6 px-6 py-3 bg-[#0078d4] text-white rounded-md hover:bg-[#106ebe] transition-colors inline-block">
            Create New Account
          </a>
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;
