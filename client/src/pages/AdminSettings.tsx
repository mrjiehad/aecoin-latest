import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { PaymentSetting } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();

  // Fetch payment settings
  const { data: settings, isLoading } = useQuery<PaymentSetting[]>({
    queryKey: ['/api/admin/payment-settings'],
  });

  // Update payment setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ gateway, enabled }: { gateway: string; enabled: boolean }) => {
      return apiRequest(`/api/admin/payment-settings/${gateway}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({
        title: "Success",
        description: "Payment gateway settings updated",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment gateway settings",
      });
    },
  });

  const handleToggle = (gateway: string, enabled: boolean) => {
    updateSettingMutation.mutate({ gateway, enabled });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFEB3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-bebas text-5xl text-[#FFEB3B] mb-2 tracking-wide">
            ADMIN SETTINGS
          </h1>
          <p className="text-gray-400 font-rajdhani">
            Configure payment gateway visibility and system settings
          </p>
        </div>

        {/* Payment Gateways */}
        <Card className="bg-[#0A0A0A] border-[#FFEB3B]/20 mb-6">
          <CardHeader>
            <CardTitle className="font-bebas text-2xl text-[#FFEB3B] tracking-wide">
              PAYMENT GATEWAYS
            </CardTitle>
            <CardDescription className="text-gray-400 font-rajdhani">
              Control which payment gateways are visible to customers during checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings?.map((setting) => (
              <div
                key={setting.gateway}
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#FFEB3B]/10 hover:border-[#FFEB3B]/30 transition-colors"
                data-testid={`payment-gateway-${setting.gateway}`}
              >
                <div className="flex-1">
                  <Label
                    htmlFor={`gateway-${setting.gateway}`}
                    className="text-white font-rajdhani font-bold text-lg cursor-pointer"
                  >
                    {setting.displayName}
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">
                    {setting.gateway === 'billplz' && 'Accept FPX, credit/debit cards, and e-wallets'}
                    {setting.gateway === 'toyyibpay' && 'Accept FPX and online banking payments'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-rajdhani font-bold ${
                      setting.enabled ? 'text-[#4CAF50]' : 'text-gray-500'
                    }`}
                  >
                    {setting.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                  <Switch
                    id={`gateway-${setting.gateway}`}
                    checked={setting.enabled}
                    onCheckedChange={(checked) => handleToggle(setting.gateway, checked)}
                    disabled={updateSettingMutation.isPending}
                    className="data-[state=checked]:bg-[#FFEB3B]"
                    data-testid={`switch-${setting.gateway}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-[#FFEB3B]/10 to-[#00BCD4]/10 border-[#FFEB3B]/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#FFEB3B] rounded-full mt-2"></div>
              <div>
                <p className="text-white font-rajdhani font-bold mb-2">
                  Important Information:
                </p>
                <ul className="text-gray-300 text-sm space-y-1 font-rajdhani">
                  <li>• Payment gateways can be enabled/disabled without removing integrations</li>
                  <li>• At least one payment gateway should remain enabled for customers to checkout</li>
                  <li>• Changes take effect immediately on the checkout page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
