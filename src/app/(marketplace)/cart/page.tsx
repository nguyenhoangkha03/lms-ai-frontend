'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart as ShoppingCartIcon,
  Trash2,
  Tag,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  Heart,
  Share2,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CartItem {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  thumbnailUrl: string;
  teacherName: string;
  originalPrice: number;
  discountedPrice?: number;
  currency: string;
  level: string;
  rating: number;
  totalRatings: number;
  durationHours: number;
  totalLessons: number;
  addedAt: string;
  pricingModel: 'paid' | 'subscription' | 'freemium';
  subscriptionType?: 'monthly' | 'yearly';
}

interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed_amount';
  };
}

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/cart');
      const data = await response.json();
      setCartItems(data.items || []);
      setCartSummary(data.summary);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Item removed from cart',
        });
        await fetchCartItems();
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      });
    }
  };

  const moveToWishlist = async (courseId: string, itemId: string) => {
    try {
      // Add to wishlist
      await fetch('/api/v1/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      // Remove from cart
      await removeFromCart(itemId);

      toast({
        title: 'Success',
        description: 'Item moved to wishlist',
      });
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to move item to wishlist',
        variant: 'destructive',
      });
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      const response = await fetch('/api/v1/cart/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Coupon applied successfully',
        });
        await fetchCartItems();
        setCouponCode('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid coupon code');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply coupon',
        variant: 'destructive',
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await fetch('/api/v1/cart/remove-coupon', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Coupon removed',
        });
        await fetchCartItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove coupon',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-20 w-32 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                      <div className="h-3 w-1/4 rounded bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card className="animate-pulse">
              <CardContent className="space-y-4 p-6">
                <div className="h-6 rounded bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <ShoppingCartIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Discover our amazing courses and start learning today!
          </p>
          <Link href="/courses">
            <Button>
              Browse Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? 'course' : 'courses'} in
          your cart
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.thumbnailUrl || '/placeholder-course.jpg'}
                      alt={item.courseName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <Link href={`/courses/${item.courseSlug}`}>
                          <h3 className="line-clamp-2 text-lg font-semibold transition-colors hover:text-primary">
                            {item.courseName}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          by {item.teacherName}
                        </p>
                      </div>

                      <div className="ml-4 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveToWishlist(item.courseId, item.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {item.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({item.totalRatings.toLocaleString()})
                        </span>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {item.level}
                      </Badge>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(item.durationHours)}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {item.totalLessons} lessons
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.discountedPrice &&
                        item.discountedPrice < item.originalPrice ? (
                          <>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(
                                item.discountedPrice,
                                item.currency
                              )}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(
                                item.originalPrice,
                                item.currency
                              )}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(
                                (1 -
                                  item.discountedPrice / item.originalPrice) *
                                  100
                              )}
                              % OFF
                            </Badge>
                          </>
                        ) : (
                          <span className="text-lg font-bold">
                            {formatCurrency(item.originalPrice, item.currency)}
                            {item.pricingModel === 'subscription' && (
                              <span className="text-sm font-normal text-muted-foreground">
                                /{item.subscriptionType}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {item.pricingModel === 'subscription' && (
                        <Badge
                          variant="default"
                          className="bg-purple-100 text-purple-800"
                        >
                          Subscription
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="space-y-4">
          {/* Coupon Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5" />
                Apply Coupon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartSummary?.appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                  <div>
                    <div className="font-medium text-green-800">
                      {cartSummary.appliedCoupon.code}
                    </div>
                    <div className="text-sm text-green-600">
                      -
                      {formatCurrency(
                        cartSummary.appliedCoupon.discountAmount,
                        cartSummary.currency
                      )}{' '}
                      discount applied
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeCoupon}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || applyingCoupon}
                    variant="outline"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          {cartSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        cartSummary.subtotal,
                        cartSummary.currency
                      )}
                    </span>
                  </div>

                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>
                        -
                        {formatCurrency(
                          cartSummary.discount,
                          cartSummary.currency
                        )}
                      </span>
                    </div>
                  )}

                  {cartSummary.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>
                        {formatCurrency(cartSummary.tax, cartSummary.currency)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(cartSummary.total, cartSummary.currency)}
                  </span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <div className="text-center">
                  <Link href="/courses">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Badge */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
