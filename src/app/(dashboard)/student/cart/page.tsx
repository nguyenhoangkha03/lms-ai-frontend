'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Trash2,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Gift,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CreditCard,
  Wallet,
  Smartphone,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// Remove LoadingSpinner import to avoid hydration issues
import { toast } from 'sonner';
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useClearCartMutation,
  useCreatePaymentFromCartMutation,
} from '@/lib/redux/api/ecommerce-api';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency, formatDuration } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // API calls
  const {
    data: cartResponse,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useGetCartQuery(
    {
      includeCourseDetails: true,
      includeTeacher: true,
      includeStats: true,
    },
    {
      skip: !user,
    }
  );

  const [removeFromCart, { isLoading: removing }] = useRemoveFromCartMutation();
  const [applyCoupon, { isLoading: applyingCoupon }] = useApplyCouponMutation();
  const [removeCoupon, { isLoading: removingCoupon }] =
    useRemoveCouponMutation();
  const [clearCart, { isLoading: clearingCart }] = useClearCartMutation();
  const [createPayment, { isLoading: creatingPayment }] =
    useCreatePaymentFromCartMutation();

  // Extract data from response
  const cartItems = cartResponse?.items || [];
  const cartStats = cartResponse?.stats;
  const hasItems = cartItems.length > 0;

  const handleRemoveItem = async (courseId: string) => {
    try {
      await removeFromCart(courseId).unwrap();
      toast.success('Course removed from cart');
      refetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove course from cart');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      await applyCoupon({ couponCode: couponCode.trim() }).unwrap();
      toast.success('Coupon applied successfully');
      setCouponCode('');
      refetchCart();
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      toast.error(error?.data?.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon().unwrap();
      toast.success('Coupon removed');
      refetchCart();
    } catch (error) {
      console.error('Failed to remove coupon:', error);
      toast.error('Failed to remove coupon');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      toast.success('Cart cleared');
      refetchCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = async (paymentMethod: 'momo' | 'stripe' = 'momo') => {
    if (!hasItems) return;

    try {
      const response = await createPayment({
        paymentMethod,
        description: `Payment for ${cartItems.length} course${cartItems.length > 1 ? 's' : ''}`,
        ...(cartStats?.appliedCoupon && {
          couponCode: cartStats.appliedCoupon.code,
        }),
      }).unwrap();

      // Handle different payment methods
      if (paymentMethod === 'momo') {
        // For MoMo, redirect to instructions page
        router.push(`/student/payment/momo-instructions/${response.orderCode}`);
      } else {
        // For Stripe and other methods, redirect to payment gateway
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          toast.error('Payment URL not received');
        }
      }
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      toast.error(error?.data?.message || 'Failed to create payment');
    }
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8 text-center">
          <CardContent>
            <h2 className="mb-4 text-xl font-semibold">Please Sign In</h2>
            <p className="mb-6 text-gray-600">
              You need to be signed in to view your cart.
            </p>
            <Button onClick={() => router.push('/auth/login')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-lg">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8 text-center">
          <CardContent>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl text-red-500">!</span>
            </div>
            <h2 className="mb-4 text-xl font-semibold">Error Loading Cart</h2>
            <p className="mb-6 text-gray-600">
              There was an error loading your cart. Please try again.
            </p>
            <Button onClick={() => refetchCart()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600">
                {hasItems
                  ? `${cartItems.length} course${cartItems.length > 1 ? 's' : ''} in your cart`
                  : 'Your cart is empty'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {!hasItems ? (
          // Empty Cart
          <div className="py-16 text-center">
            <div className="mx-auto mb-8 flex h-48 w-48 items-center justify-center rounded-2xl bg-gray-100">
              <ShoppingCart className="h-20 w-20 text-gray-400" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h3>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              Discover our amazing courses and start your learning journey
              today!
            </p>
            <Button
              onClick={() => router.push('/student/courses')}
              size="lg"
              className="px-8"
            >
              Browse Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-6 lg:col-span-2">
              {/* Clear Cart Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cart Items</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={clearingCart}
                >
                  {clearingCart ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Clear Cart
                </Button>
              </div>

              {/* Cart Items List */}
              {cartItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="relative h-20 w-32 overflow-hidden rounded-lg">
                          <Image
                            src={
                              item.course.thumbnailUrl ||
                              '/images/course-placeholder.jpg'
                            }
                            alt={item.course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">
                              <Link
                                href={`/student/courses/${item.course.slug}`}
                                className="transition-colors hover:text-blue-600"
                              >
                                {item.course.title}
                              </Link>
                            </h3>
                            <p className="mb-2 text-sm text-gray-600">
                              by{' '}
                              {item.course.teacher?.displayName ||
                                'Unknown Instructor'}
                            </p>

                            <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{item.course.rating || 0}</span>
                                <span>
                                  (
                                  {(
                                    item.course.totalRatings || 0
                                  ).toLocaleString()}
                                  )
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDuration(
                                    (item.course.durationHours || 0) * 60
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>
                                  {item.course.totalLessons || 0} lessons
                                </span>
                              </div>
                            </div>

                            <Badge variant="secondary" className="text-xs">
                              {item.course.level || 'All Levels'}
                            </Badge>
                          </div>

                          {/* Price and Actions */}
                          <div className="text-right">
                            <div className="mb-3">
                              {item.course.price &&
                              Number(item.course.price) <
                                Number(item.course.originalPrice || 0) ? (
                                <div>
                                  <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(
                                      item.course.price,
                                      item.course.currency || 'USD'
                                    )}
                                  </span>
                                  <div className="text-sm">
                                    <span className="text-gray-500 line-through">
                                      {formatCurrency(
                                        item.course.originalPrice || 0,
                                        item.course.currency || 'USD'
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xl font-bold">
                                  {formatCurrency(
                                    item.course.originalPrice || 0,
                                    item.course.currency || 'USD'
                                  )}
                                </span>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.courseId)}
                              disabled={removing}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {removing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Coupon Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cartStats?.appliedCoupon ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">
                            {cartStats.appliedCoupon.code}
                          </p>
                          <p className="text-sm text-green-600">
                            -
                            {formatCurrency(
                              cartStats.appliedCoupon.discountAmount,
                              cartStats.currency
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          disabled={removingCoupon}
                          className="text-green-700 hover:text-green-800"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          disabled={applyingCoupon}
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || applyingCoupon}
                          size="sm"
                        >
                          {applyingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {cartStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>
                          {formatCurrency(
                            cartStats.totalValue,
                            cartStats.currency
                          )}
                        </span>
                      </div>

                      {cartStats.totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>
                            -
                            {formatCurrency(
                              cartStats.totalDiscount,
                              cartStats.currency
                            )}
                          </span>
                        </div>
                      )}

                      {cartStats.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>
                            {formatCurrency(cartStats.tax, cartStats.currency)}
                          </span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>
                          {formatCurrency(
                            cartStats.finalPrice,
                            cartStats.currency
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Loading summary...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Checkout Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleCheckout('momo')}
                  disabled={!hasItems || creatingPayment}
                  className="h-12 w-full bg-pink-600 text-lg font-semibold hover:bg-pink-700"
                  size="lg"
                >
                  {creatingPayment ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Wallet className="mr-2 h-5 w-5" />
                  )}
                  Pay with MoMo
                </Button>

                <Button
                  onClick={() => handleCheckout('stripe')}
                  disabled={!hasItems || creatingPayment}
                  className="h-12 w-full bg-purple-600 text-lg font-semibold hover:bg-purple-700"
                  size="lg"
                >
                  {creatingPayment ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-5 w-5" />
                  )}
                  Pay with Stripe
                </Button>
              </div>

              {/* Security Notice */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-blue-900">
                      Secure Payment
                    </p>
                    <p className="text-xs text-blue-700">
                      Your payment information is encrypted and secure. 30-day
                      money-back guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
