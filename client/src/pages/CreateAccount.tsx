import AccountForm from "@/components/account/AccountForm";
import BatchAccountForm from "@/components/account/BatchAccountForm";

const CreateAccount = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-[#201f1e]">Create New Hotmail Account</h2>
        <p className="mt-2 text-[#605e5c]">Quickly set up a new Hotmail account with automated verification.</p>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-[#d2d0ce] p-6">
          <AccountForm />
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-[#d2d0ce] p-6">
          <h3 className="text-lg font-medium text-[#201f1e]">Batch Creation</h3>
          <p className="mt-1 text-[#605e5c]">Create multiple accounts at once</p>
          
          <div className="mt-4">
            <BatchAccountForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
