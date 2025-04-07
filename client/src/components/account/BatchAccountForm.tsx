import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { API_ROUTES } from "@/lib/constants";

const batchSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").max(50, "Maximum 50 accounts at once"),
  prefix: z.string().min(3, "Prefix must be at least 3 characters").max(15, "Prefix cannot exceed 15 characters")
});

type BatchFormValues = z.infer<typeof batchSchema>;

const BatchAccountForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [batchResults, setBatchResults] = useState<{
    created: number;
    failed: number;
    captchaBlocked: number;
    total: number;
    failedAccounts?: {email: string; reason: string}[];
  } | null>(null);
  
  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      quantity: 5,
      prefix: ""
    }
  });

  const batchCreateMutation = useMutation({
    mutationFn: async (data: BatchFormValues) => {
      return apiRequest("POST", `${API_ROUTES.ACCOUNTS}/batch`, data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.ACCOUNTS] });
      
      response.json().then(data => {
        setBatchResults({
          created: data.created,
          failed: data.failed,
          captchaBlocked: data.captchaBlocked || 0,
          total: data.total,
          failedAccounts: data.failedAccounts
        });
        
        if (data.captchaBlocked > 0) {
          toast({
            title: "Batch creation partially successful",
            description: `Created ${data.created} of ${data.total} accounts. ${data.captchaBlocked} were blocked by CAPTCHA.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Batch creation successful",
            description: `Created ${data.created} of ${data.total} accounts successfully.`,
          });
        }
      });
      
      form.reset({
        quantity: 5,
        prefix: ""
      });
    },
    onError: (error) => {
      setBatchResults(null);
      toast({
        title: "Error creating accounts",
        description: error.message || "Something went wrong with batch creation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: BatchFormValues) => {
    batchCreateMutation.mutate(data);
  };

  const [needCaptchaApiKey, setNeedCaptchaApiKey] = useState(false);
  
  const handleAddCaptchaKey = () => {
    setNeedCaptchaApiKey(true);
    // We'll call the API secrets tool in the main application to request a CAPTCHA API key
  };
  
  return (
    <Form {...form}>
      {batchResults && batchResults.captchaBlocked > 0 && (
        <Alert className="mb-4 bg-amber-50 border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">CAPTCHA Detected</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              {batchResults.captchaBlocked} account(s) couldn't be created due to CAPTCHA challenges.
            </p>
            <div className="flex gap-2 items-center mb-2">
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
            {batchResults.failedAccounts && batchResults.failedAccounts.length > 0 && (
              <div className="mt-2 text-sm">
                <p className="font-medium mb-1">Failed accounts:</p>
                <ul className="space-y-1 list-disc list-inside text-amber-600">
                  {batchResults.failedAccounts.slice(0, 3).map((account, index) => (
                    <li key={index}>
                      {account.email}: {account.reason}
                    </li>
                  ))}
                  {batchResults.failedAccounts.length > 3 && (
                    <li>And {batchResults.failedAccounts.length - 3} more...</li>
                  )}
                </ul>
              </div>
            )}
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
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#323130]">Number of Accounts</FormLabel>
              <div className="flex w-1/3">
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    min={1}
                    max={50}
                    className="w-full p-3 border border-[#d2d0ce] rounded-md focus:outline-none focus:border-[#0078d4]"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="prefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#323130]">Username Prefix</FormLabel>
              <div className="flex w-2/3">
                <FormControl>
                  <Input 
                    {...field} 
                    className="w-full p-3 border border-[#d2d0ce] rounded-md focus:outline-none focus:border-[#0078d4]" 
                    placeholder="myaccount"
                  />
                </FormControl>
                <div className="ml-2 flex items-center text-[#605e5c]">
                  + random numbers
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            {batchResults && (
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  {batchResults.created} Created
                </Badge>
                {batchResults.failed > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    {batchResults.failed} Failed
                  </Badge>
                )}
                {batchResults.captchaBlocked > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    {batchResults.captchaBlocked} CAPTCHA Blocked
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="px-4 py-2 bg-[#0078d4] text-white rounded-md hover:bg-[#106ebe]"
            disabled={batchCreateMutation.isPending}
          >
            {batchCreateMutation.isPending ? "Creating..." : "Create Batch"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BatchAccountForm;
