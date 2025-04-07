import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAccountSchema } from "@shared/schema";
import { API_ROUTES } from "@/lib/constants";

// Extend the schema with additional validations
const createAccountSchema = insertAccountSchema.extend({
  username: z.string().min(5, "Username must be at least 5 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain uppercase, lowercase, number, and special character")
});

type FormValues = z.infer<typeof createAccountSchema>;

const AccountForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [captchaBlocked, setCaptchaBlocked] = useState(false);
  const [needCaptchaApiKey, setNeedCaptchaApiKey] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      label: "",
      username: "",
      password: "",
      autoMaintain: true
    }
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Transform the data to match our API schema
      const accountData = {
        label: data.label || "My Account",
        email: `${data.username}@hotmail.com`,
        password: data.password,
        autoMaintain: data.autoMaintain
      };
      
      return apiRequest("POST", API_ROUTES.ACCOUNTS, accountData);
    },
    onSuccess: () => {
      // Invalidate accounts query to refetch the data
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.ACCOUNTS] });
      
      // Reset form and show success message
      form.reset();
      setSuccessVisible(true);
      setCaptchaBlocked(false);
      setTimeout(() => setSuccessVisible(false), 3000);
      
      toast({
        title: "Account created successfully",
        description: "Your new Hotmail account has been created and added to your dashboard.",
      });
    },
    onError: (error: any) => {
      // Check if the error is due to CAPTCHA
      if (error.response && error.response.status === 422) {
        // Set CAPTCHA blocked state
        setCaptchaBlocked(true);
        toast({
          title: "CAPTCHA detected",
          description: "Account creation was blocked by CAPTCHA. To automatically solve CAPTCHAs, add an API key.",
          variant: "default"
        });
        return;
      }
      
      // For non-CAPTCHA errors
      setCaptchaBlocked(false);
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    createAccountMutation.mutate(data);
  };
  
  const handleAddCaptchaKey = () => {
    setNeedCaptchaApiKey(true);
    // We'll call the API secrets tool in the main application to request a CAPTCHA API key
  };

  return (
    <Form {...form}>
      {captchaBlocked && (
        <Alert className="mb-4 bg-amber-50 border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">CAPTCHA Detected</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              Account creation was blocked by CAPTCHA. To automatically solve CAPTCHAs, add an API key.
            </p>
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm"
                className="text-amber-700 border-amber-300 hover:text-amber-800 hover:bg-amber-100"
                onClick={handleAddCaptchaKey}
              >
                Add CAPTCHA API Key
              </Button>
              <span className="text-xs text-amber-600">
                Automatically solve CAPTCHA challenges
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {needCaptchaApiKey && (
        <Alert className="mb-4 bg-blue-50 border border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Add CAPTCHA API Key</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p className="mb-2">
              To solve CAPTCHA challenges automatically, you'll need to add a CAPTCHA solving service API key.
            </p>
            <p className="text-xs mb-2">
              Supported services: NopeCHA, 2Captcha, Anti-Captcha, or CapMonster
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="text-blue-700 border-blue-300 hover:text-blue-800 hover:bg-blue-100"
              onClick={() => setNeedCaptchaApiKey(false)}
            >
              I'll add this later
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} id="create-account-form" className="space-y-6">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#323130]">Account Label</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="w-full p-3 border border-[#d2d0ce] rounded-md focus:outline-none focus:border-[#0078d4]" 
                  placeholder="e.g. Work Account, Personal"
                />
              </FormControl>
              <p className="mt-1 text-xs text-[#605e5c]">A friendly name to help you identify this account</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#323130]">Username</FormLabel>
              <div className="flex">
                <FormControl>
                  <Input 
                    {...field} 
                    className="w-full p-3 border border-[#d2d0ce] rounded-l-md focus:outline-none focus:border-[#0078d4]" 
                    placeholder="desired_username"
                  />
                </FormControl>
                <div className="bg-[#f3f2f1] border border-[#d2d0ce] border-l-0 rounded-r-md px-3 flex items-center text-[#605e5c]">
                  @hotmail.com
                </div>
              </div>
              <p className="mt-1 text-xs text-[#605e5c]">Create a unique username for your new Hotmail account</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#323130]">Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    {...field} 
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border border-[#d2d0ce] rounded-md focus:outline-none focus:border-[#0078d4]" 
                    placeholder="Enter a strong password"
                  />
                </FormControl>
                <button 
                  type="button" 
                  className="absolute right-3 top-3 text-[#605e5c] hover:text-[#0078d4]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-[#605e5c]">8+ characters with letters, numbers & symbols</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="autoMaintain"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0 mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                  className="h-4 w-4 text-[#0078d4] focus:ring-[#0078d4] border-[#d2d0ce] rounded"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium text-[#323130]">
                  Enable automatic account maintenance
                </FormLabel>
                <p className="text-xs text-[#605e5c]">Keeps the account active to prevent disabling</p>
              </div>
            </FormItem>
          )}
        />
        
        {/* Success message */}
        {successVisible && (
          <div className="bg-[#107c10] bg-opacity-10 border border-[#107c10] border-opacity-20 rounded-md p-3">
            <div className="flex items-start">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-[#107c10] mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-[#107c10]">Account created successfully!</p>
                <p className="text-xs text-[#323130] mt-1">The new account has been added to your dashboard.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="outline" 
            className="px-4 py-2 border border-[#d2d0ce] rounded-md text-[#323130] hover:bg-[#f3f2f1] mr-3"
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
          <Button 
            id="create-btn" 
            type="submit" 
            className="px-4 py-2 bg-[#0078d4] text-white rounded-md hover:bg-[#106ebe]"
            disabled={createAccountMutation.isPending}
          >
            {createAccountMutation.isPending ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountForm;
