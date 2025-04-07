import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        toast({
          title: "Batch creation successful",
          description: `Created ${data.created} of ${data.total} accounts successfully.`,
        });
      });
      
      form.reset({
        quantity: 5,
        prefix: ""
      });
    },
    onError: (error) => {
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

  return (
    <Form {...form}>
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
        
        <div className="mt-6 flex justify-end">
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
