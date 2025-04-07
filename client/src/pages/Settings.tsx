import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { API_ROUTES, FREQUENCIES } from "@/lib/constants";
import { Settings, updateSettingsSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const SettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: [API_ROUTES.SETTINGS],
  });

  const form = useForm({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      maintenanceFrequency: "every-3-days",
      emailCheckFrequency: "every-hour",
      notifyLogin: true,
      notifyEmails: true,
      notifyWarnings: true
    }
  });

  // Update form when settings data is loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        maintenanceFrequency: settings.maintenanceFrequency,
        emailCheckFrequency: settings.emailCheckFrequency,
        notifyLogin: settings.notifyLogin,
        notifyEmails: settings.notifyEmails,
        notifyWarnings: settings.notifyWarnings
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof updateSettingsSchema._type) => {
      return apiRequest("PATCH", API_ROUTES.SETTINGS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.SETTINGS] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "There was an error saving your settings.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: typeof updateSettingsSchema._type) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-[#201f1e]">Settings</h2>
        <p className="mt-2 text-[#605e5c]">Configure your account management preferences</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-[#d2d0ce] p-6">
              <h3 className="text-lg font-medium text-[#201f1e]">Account Maintenance</h3>
              
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="maintenanceFrequency"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel className="font-medium text-[#323130]">Automatic Login Schedule</FormLabel>
                        <p className="text-sm text-[#605e5c]">How often should we log into accounts to keep them active</p>
                      </div>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREQUENCIES.MAINTENANCE.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emailCheckFrequency"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel className="font-medium text-[#323130]">Email Checking Frequency</FormLabel>
                        <p className="text-sm text-[#605e5c]">How often should we check for new emails</p>
                      </div>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREQUENCIES.EMAIL_CHECK.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-[#d2d0ce] p-6">
              <h3 className="text-lg font-medium text-[#201f1e]">Notifications</h3>
              
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="notifyLogin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-[#323130]">
                          Account login notifications
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifyEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-[#323130]">
                          New email notifications
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifyWarnings"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-[#323130]">
                          Account health warnings
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="px-4 py-2 border border-[#d2d0ce] rounded-md text-[#323130] hover:bg-[#f3f2f1] mr-3"
                onClick={() => form.reset()}
                disabled={isLoading || updateSettingsMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-4 py-2 bg-[#0078d4] text-white rounded-md hover:bg-[#106ebe]"
                disabled={isLoading || updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SettingsPage;
