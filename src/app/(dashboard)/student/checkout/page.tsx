'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Wallet,
  Smartphone,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useGetCartQuery,
  useCreatePaymentFromCartMutation,
} from '@/lib/redux/api/ecommerce-api';
import { useAuth } from '@/contexts/auth-context';

interface BillingInfo {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'momo' | 'stripe'>('stripe');
  
  // RTK Query hooks
  const { 
    data: cartData, 
    isLoading: cartLoading, 
    error: cartError 
  } = useGetCartQuery({
    includeCourseDetails: true,
    includeTeacher: true,
    includeStats: true,
  });
  
  const [createPaymentFromCart, { isLoading: processing }] = useCreatePaymentFromCartMutation();
  
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'VN',
    taxId: '',
  });
  
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  
  // Derived data
  const items = cartData?.items || [];
  const orderSummary = cartData?.stats;
  
  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setBillingInfo(prev => ({
        ...prev,
        fullName: user.displayName || user.fullName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleBillingChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields: (keyof BillingInfo)[] = [
      'fullName',
      'email',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
    ];

    const missingFields = requiredFields.filter(
      field => !billingInfo[field]
    );

    if (missingFields.length > 0) {
      toast.error('Please fill in all required billing fields');
      return false;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!cartData?.items?.length) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const paymentData = {
        paymentMethod: selectedPaymentMethod,
        description: `Payment for ${cartData.items.length} course(s)`,
        metadata: {
          billingInfo,
          subscribeNewsletter,
        },
      };

      const result = await createPaymentFromCart(paymentData).unwrap();
      
      // Handle different payment methods
      if (selectedPaymentMethod === 'momo') {
        // For MoMo, redirect to instructions page
        router.push(`/student/payment/momo-instructions/${result.orderCode}`);
      } else {
        // For Stripe and other methods, redirect to payment gateway
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          toast.error('Payment URL not received');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.data?.message || 'Payment failed. Please try again.');
    }
  };

  const formatCurrency = (amount: number, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (cartError || !cartData?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some courses to your cart before checkout.
          </p>
          <Link href="/student/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/student/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your purchase securely
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Billing & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={billingInfo.fullName}
                    onChange={(e) => handleBillingChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => handleBillingChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={billingInfo.phone || ''}
                    onChange={(e) => handleBillingChange('phone', e.target.value)}
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={billingInfo.company || ''}
                    onChange={(e) => handleBillingChange('company', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={billingInfo.address}
                  onChange={(e) => handleBillingChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={billingInfo.city}
                    onChange={(e) => handleBillingChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={billingInfo.state}
                    onChange={(e) => handleBillingChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={billingInfo.zipCode}
                    onChange={(e) => handleBillingChange('zipCode', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={billingInfo.country}
                  onValueChange={(value) => handleBillingChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VN">Vietnam</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stripe"
                    checked={selectedPaymentMethod === 'stripe'}
                    onCheckedChange={() => setSelectedPaymentMethod('stripe')}
                  />
                  <Label htmlFor="stripe" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Stripe (Credit Card)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="momo"
                    checked={selectedPaymentMethod === 'momo'}
                    onCheckedChange={() => setSelectedPaymentMethod('momo')}
                  />
                  <Label htmlFor="momo" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    MoMo E-Wallet
                  </Label>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment information is encrypted and secure. You'll be redirected to the selected payment gateway to complete your transaction.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary underline">
                        Privacy Policy
                      </Link>
                      .
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={setSubscribeNewsletter}
                    className="mt-1"
                  />
                  <Label htmlFor="newsletter" className="text-sm cursor-pointer">
                    Subscribe to our newsletter for updates and special offers.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={item.course?.thumbnailUrl || '/placeholder-course.jpg'}
                      alt={item.course?.title || 'Course'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {item.course?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      by {item.course?.teacher?.displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">
                        {formatCurrency(item.priceAtAdd, item.currency)}
                      </span>
                      {item.hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(item.course?.originalPrice || 0, item.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {orderSummary && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orderSummary.totalValue || 0, orderSummary.currency)}</span>
                  </div>

                  {(orderSummary.totalDiscount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(orderSummary.totalDiscount || 0, orderSummary.currency)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(orderSummary.finalPrice || 0, orderSummary.currency)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={processing || !agreeToTerms}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Complete Payment
                    </>
                  )}
                </Button>

                <div className="text-center mt-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Secured by SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}