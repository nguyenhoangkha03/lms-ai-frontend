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
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface CheckoutItem {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  thumbnailUrl: string;
  teacherName: string;
  originalPrice: number;
  discountedPrice?: number;
  currency: string;
  pricingModel: 'paid' | 'subscription' | 'freemium';
  subscriptionType?: 'monthly' | 'yearly';
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'stripe' | 'bank_transfer' | 'crypto';
  name: string;
  description: string;
  icon: string;
  fees?: number;
  processingTime: string;
  isEnabled: boolean;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
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

interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  processingFee: number;
  total: number;
  currency: string;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    taxId: '',
  });
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);

      // Fetch checkout items from cart
      const cartResponse = await fetch('/api/v1/cart');
      const cartData = await cartResponse.json();
      setItems(cartData.items || []);
      setOrderSummary(cartData.summary);

      // Fetch available payment methods
      const paymentResponse = await fetch('/api/v1/payment/methods');
      const paymentData = await paymentResponse.json();
      setPaymentMethods(
        paymentData.filter((pm: PaymentMethod) => pm.isEnabled)
      );

      if (paymentData.length > 0) {
        setSelectedPaymentMethod(paymentData[0].id);
      }

      // Pre-fill billing info if user is logged in
      const userResponse = await fetch('/api/v1/auth/profile');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setBillingInfo(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load checkout information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBillingChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (field: string, value: string) => {
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredBillingFields: (keyof BillingInfo)[] = [
      'firstName',
      'lastName',
      'email',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
    ];

    const missingFields = requiredBillingFields.filter(
      field => !billingInfo[field]
    );

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required billing fields',
        variant: 'destructive',
      });
      return false;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: 'Payment Method Required',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return false;
    }

    if (selectedPaymentMethod === 'card') {
      if (
        !cardInfo.number ||
        !cardInfo.expiry ||
        !cardInfo.cvv ||
        !cardInfo.name
      ) {
        toast({
          title: 'Card Information Required',
          description: 'Please fill in all card details',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (!agreeToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);

      const paymentData = {
        items: items.map(item => ({
          courseId: item.courseId,
          pricingModel: item.pricingModel,
          subscriptionType: item.subscriptionType,
        })),
        billingInfo,
        paymentMethod: selectedPaymentMethod,
        cardInfo: selectedPaymentMethod === 'card' ? cardInfo : undefined,
        subscribeNewsletter,
      };

      const response = await fetch('/api/v1/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear cart after successful payment
        await fetch('/api/v1/cart/clear', { method: 'POST' });

        toast({
          title: 'Payment Successful!',
          description: 'Your enrollment has been confirmed',
        });

        // Redirect to success page
        router.push(`/payment/success?orderId=${result.orderId}`);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Failed',
        description:
          error.message || 'There was an error processing your payment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">No items to checkout</h2>
        <p className="mb-6 text-muted-foreground">
          Your cart appears to be empty.
        </p>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/cart">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Checkout Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={billingInfo.firstName}
                    onChange={e =>
                      handleBillingChange('firstName', e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={billingInfo.lastName}
                    onChange={e =>
                      handleBillingChange('lastName', e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={billingInfo.email}
                  onChange={e => handleBillingChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={billingInfo.phone}
                    onChange={e => handleBillingChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={billingInfo.company}
                    onChange={e =>
                      handleBillingChange('company', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={billingInfo.address}
                  onChange={e => handleBillingChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={billingInfo.city}
                    onChange={e => handleBillingChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={billingInfo.state}
                    onChange={e => handleBillingChange('state', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={billingInfo.zipCode}
                    onChange={e =>
                      handleBillingChange('zipCode', e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={billingInfo.country}
                    onValueChange={value =>
                      handleBillingChange('country', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="VN">Vietnam</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  value={billingInfo.taxId}
                  onChange={e => handleBillingChange('taxId', e.target.value)}
                  placeholder="For business purchases"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                {paymentMethods.map(method => (
                  <div key={method.id} className="space-y-4">
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label
                        htmlFor={method.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                              {method.type === 'card' && (
                                <CreditCard className="h-4 w-4" />
                              )}
                              {method.type === 'paypal' && (
                                <span className="text-xs font-bold">PP</span>
                              )}
                              {method.type === 'stripe' && (
                                <span className="text-xs font-bold">S</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {method.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {method.fees && method.fees > 0 && (
                              <div className="text-sm text-muted-foreground">
                                +{formatCurrency(method.fees)} fee
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {method.processingTime}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Card Details Form */}
                    {selectedPaymentMethod === method.id &&
                      method.type === 'card' && (
                        <div className="ml-6 space-y-4 rounded-lg bg-muted/50 p-4">
                          <div>
                            <Label htmlFor="cardName">Cardholder Name *</Label>
                            <Input
                              id="cardName"
                              value={cardInfo.name}
                              onChange={e =>
                                handleCardChange('name', e.target.value)
                              }
                              placeholder="Name on card"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              value={cardInfo.number}
                              onChange={e =>
                                handleCardChange('number', e.target.value)
                              }
                              placeholder="1234 5678 9012 3456"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cardExpiry">Expiry Date *</Label>
                              <Input
                                id="cardExpiry"
                                value={cardInfo.expiry}
                                onChange={e =>
                                  handleCardChange('expiry', e.target.value)
                                }
                                placeholder="MM/YY"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cardCvv">CVV *</Label>
                              <Input
                                id="cardCvv"
                                value={cardInfo.cvv}
                                onChange={e =>
                                  handleCardChange('cvv', e.target.value)
                                }
                                placeholder="123"
                                maxLength={4}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </RadioGroup>
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
                    onCheckedChange={checked => setAgreeToTerms(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    . I understand that all sales are final and non-refundable
                    after 30 days.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={checked =>
                      setSubscribeNewsletter(!!checked)
                    }
                  />
                  <Label htmlFor="newsletter" className="text-sm">
                    Subscribe to our newsletter for course updates and special
                    offers
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Course Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.thumbnailUrl || '/placeholder-course.jpg'}
                      alt={item.courseName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-medium">
                      {item.courseName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      by {item.teacherName}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.pricingModel === 'subscription' && (
                          <Badge variant="outline" className="text-xs">
                            {item.subscriptionType}
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium">
                        {item.discountedPrice &&
                        item.discountedPrice < item.originalPrice ? (
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">
                              {formatCurrency(
                                item.discountedPrice,
                                item.currency
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(
                                item.originalPrice,
                                item.currency
                              )}
                            </span>
                          </div>
                        ) : (
                          <span>
                            {formatCurrency(item.originalPrice, item.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {orderSummary && (
            <Card>
              <CardContent className="space-y-3 pt-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {formatCurrency(
                      orderSummary.subtotal,
                      orderSummary.currency
                    )}
                  </span>
                </div>

                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {orderSummary.appliedCoupon && (
                        <span className="ml-1 text-xs">
                          ({orderSummary.appliedCoupon.code})
                        </span>
                      )}
                    </span>
                    <span>
                      -
                      {formatCurrency(
                        orderSummary.discount,
                        orderSummary.currency
                      )}
                    </span>
                  </div>
                )}

                {orderSummary.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      {formatCurrency(orderSummary.tax, orderSummary.currency)}
                    </span>
                  </div>
                )}

                {orderSummary.processingFee > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>
                      {formatCurrency(
                        orderSummary.processingFee,
                        orderSummary.currency
                      )}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(orderSummary.total, orderSummary.currency)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={processPayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    30-day money-back guarantee
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Features */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Instant access after purchase</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Lifetime access to courses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
