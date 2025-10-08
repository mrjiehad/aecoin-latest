import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet, Tag, Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartItem, Package, Coupon, PaymentSetting } from "@shared/schema";

interface CartItemWithPackage extends CartItem {
  package: Package;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"toyyibpay" | "billplz">("billplz");
  
  // Billing information
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    email: user?.email || "",
    phoneNumber: "",
  });
  
  // Pre-fill email when user data loads
  useEffect(() => {
    if (user?.email && !billingInfo.email) {
      setBillingInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Check for error query parameter and redirect BEFORE anything else
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  
  if (error === 'payment_failed') {
    navigate('/payment/failed');
    return null;
  } else if (error === 'payment_cancelled') {
    navigate('/payment/cancelled');
    return null;
  }

  // Fetch cart items (only if user is authenticated)
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithPackage[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Fetch enabled payment gateways
  const { data: enabledGateways = [] } = useQuery<PaymentSetting[]>({
    queryKey: ['/api/payment-gateways'],
  });

  // Update default payment method when gateways are loaded
  useEffect(() => {
    if (enabledGateways.length > 0 && !enabledGateways.find(g => g.gateway === paymentMethod)) {
      setPaymentMethod(enabledGateways[0].gateway as "toyyibpay" | "billplz");
    }
  }, [enabledGateways]);

  // Validate coupon mutation
  const validateCoupon = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("GET", `/api/coupons/${code}?subtotal=${subtotal}`);
      return await response.json();
    },
    onSuccess: (data: Coupon) => {
      // Check minimum purchase on frontend as well
      if (data.minPurchase && parseFloat(data.minPurchase) > subtotal) {
        toast({
          title: "Coupon Not Applicable",
          description: `Minimum purchase of RM${data.minPurchase} required.`,
          variant: "destructive",
        });
        return;
      }
      
      setAppliedCoupon(data);
      const discountText = data.discountType === 'percentage' 
        ? `${data.discountValue}% discount` 
        : `RM${data.discountValue} discount`;
      toast({
        title: "Coupon Applied!",
        description: `${discountText} applied successfully.`,
      });
    },
    onError: (error: any) => {
      const message = error.message || "The coupon code you entered is invalid or expired.";
      toast({
        title: "Invalid Coupon",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.package.price) * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon 
    ? appliedCoupon.discountType === 'percentage'
      ? (subtotal * parseFloat(appliedCoupon.discountValue)) / 100
      : parseFloat(appliedCoupon.discountValue)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      validateCoupon.mutate(couponCode.trim().toUpperCase());
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };


  const handlePaymentSuccess = () => {
    // Clear cart and redirect to orders page
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    navigate("/orders");
  };

  const [isProcessingToyyibPay, setIsProcessingToyyibPay] = useState(false);
  const [isProcessingBillplz, setIsProcessingBillplz] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Validate billing information
    if (!billingInfo.fullName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!billingInfo.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "toyyibpay") {
      setIsProcessingToyyibPay(true);
      
      console.log("ToyyibPay: Sending billing info:", billingInfo);
      
      try {
        const response = await apiRequest("POST", "/api/create-toyyibpay-bill", {
          couponCode: appliedCoupon?.code || "",
          billingInfo,
        });
        
        const data = await response.json();
        
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          toast({
            title: "Error",
            description: "Failed to create payment. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to initialize ToyyibPay payment.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingToyyibPay(false);
      }
    } else if (paymentMethod === "billplz") {
      setIsProcessingBillplz(true);
      
      console.log("Billplz: Sending billing info:", billingInfo);
      
      try {
        const response = await apiRequest("POST", "/api/create-billplz-bill", {
          couponCode: appliedCoupon?.code || "",
          billingInfo,
        });
        
        const data = await response.json();
        
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          toast({
            title: "Error",
            description: "Failed to create payment. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to initialize Billplz payment.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingBillplz(false);
      }
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pb-12">
      {/* Header */}
      <div className="bg-[#000000] border-b border-white/10 py-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:text-neon-yellow mb-4"
            data-testid="button-back-to-shop"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
          <h1 className="text-4xl font-bebas text-white uppercase tracking-wider">
            Checkout
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Information */}
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#000000] border-2 border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bebas text-white uppercase tracking-wider">
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-rajdhani font-semibold text-white mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={billingInfo.fullName}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="bg-[#000000]/50 border-white/20 text-white placeholder:text-gray-500"
                    required
                    data-testid="input-billing-name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-rajdhani font-semibold text-white mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="bg-[#000000]/50 border-white/20 text-white placeholder:text-gray-500"
                    required
                    data-testid="input-billing-email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-rajdhani font-semibold text-white mb-2">
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    value={billingInfo.phoneNumber}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+60123456789"
                    className="bg-[#000000]/50 border-white/20 text-white placeholder:text-gray-500"
                    data-testid="input-billing-phone"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Malaysian format: +60123456789
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#000000] border-2 border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bebas text-white uppercase tracking-wider">
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid gap-4 ${enabledGateways.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {enabledGateways.map((gateway) => (
                    <button
                      key={gateway.gateway}
                      onClick={() => setPaymentMethod(gateway.gateway as "toyyibpay" | "billplz")}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        paymentMethod === gateway.gateway
                          ? "border-neon-yellow bg-neon-yellow/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                      data-testid={`button-payment-${gateway.gateway}`}
                    >
                      <Wallet className="w-12 h-12 mx-auto mb-3 text-neon-yellow" />
                      <p className="font-rajdhani font-bold text-white text-center">
                        {gateway.gateway === 'toyyibpay' ? 'ToyyibPay' : 'Billplz'}
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        {gateway.gateway === 'toyyibpay' ? 'FPX, Online Banking' : 'FPX, Cards, E-Wallets'}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#000000] border-2 border-neon-yellow/30 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bebas text-white uppercase tracking-wider">
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethod === "toyyibpay" ? (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm text-center py-8">
                      You will be redirected to ToyyibPay to complete your payment
                    </p>
                    <Button
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0 || isProcessingToyyibPay}
                      className="w-full bg-neon-yellow hover:bg-neon-yellow/90 text-black font-bold uppercase text-base h-12 rounded-full font-rajdhani tracking-wide"
                      data-testid="button-place-order"
                    >
                      {isProcessingToyyibPay ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-5 h-5 mr-2" />
                          Continue to ToyyibPay
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm text-center py-8">
                      You will be redirected to Billplz to complete your payment
                    </p>
                    <Button
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0 || isProcessingBillplz}
                      className="w-full bg-neon-yellow hover:bg-neon-yellow/90 text-black font-bold uppercase text-base h-12 rounded-full font-rajdhani tracking-wide"
                      data-testid="button-place-order-billplz"
                    >
                      {isProcessingBillplz ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Continue to Billplz
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center mt-6">
                  By completing this purchase, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#000000] border-2 border-neon-yellow/30 rounded-3xl sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bebas text-white uppercase tracking-wider">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-[#000000]/50 rounded-xl border border-white/5"
                      data-testid={`checkout-item-${item.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="font-rajdhani font-bold text-white text-sm">
                          {item.package.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {item.package.aecoinAmount.toLocaleString()} AECOIN × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neon-yellow text-sm">
                          RM{(parseFloat(item.package.price) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/10" />

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-rajdhani font-semibold text-white mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-2xl">
                      <Badge className="bg-green-500 text-black font-bold">
                        {appliedCoupon.code}
                      </Badge>
                      <span className="text-sm text-green-400 flex-1">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% OFF` 
                          : `RM${appliedCoupon.discountValue} OFF`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-400 hover:text-red-300 h-7"
                        data-testid="button-remove-coupon"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="bg-[#000000] border-white/10 text-white rounded-xl"
                        data-testid="input-coupon-code"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || validateCoupon.isPending}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl"
                        data-testid="button-apply-coupon"
                      >
                        {validateCoupon.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="bg-white/10" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-white">
                    <span className="font-rajdhani">Subtotal:</span>
                    <span data-testid="text-subtotal">RM{subtotal.toFixed(0)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span className="font-rajdhani">
                        Discount{appliedCoupon.discountType === 'percentage' ? ` (${appliedCoupon.discountValue}%)` : ''}:
                      </span>
                      <span data-testid="text-discount">-RM{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white font-rajdhani">Total:</span>
                    <span className="text-neon-yellow" data-testid="text-total">
                      RM{total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
