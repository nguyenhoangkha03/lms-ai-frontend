'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Receipt,
  Download,
  Search,
  Filter,
  CreditCard,
  RefreshCw,
  Star,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PurchaseItem {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  thumbnailUrl: string;
  teacherName: string;
  price: number;
  currency: string;
  pricingModel: 'paid' | 'subscription' | 'freemium';
  subscriptionType?: 'monthly' | 'yearly';
}

interface Purchase {
  id: string;
  orderId: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  purchaseDate: string;
  billingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    country: string;
  };
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
  refundInfo?: {
    refundedAt: string;
    refundAmount: number;
    reason: string;
  };
}

interface PurchaseStats {
  totalPurchases: number;
  totalSpent: number;
  totalCourses: number;
  averageOrderValue: number;
  currency: string;
}

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Purchase | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  useEffect(() => {
    fetchPurchaseHistory();
    fetchPurchaseStats();
  }, [searchTerm, statusFilter, dateFilter]);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        dateRange: dateFilter,
        limit: '50',
      });

      const response = await fetch(`/api/v1/purchases/history?${params}`);
      const data = await response.json();
      setPurchases(data.data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseStats = async () => {
    try {
      const response = await fetch('/api/v1/purchases/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching purchase stats:', error);
    }
  };

  const downloadReceipt = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/v1/purchases/${purchaseId}/receipt`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${purchaseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Receipt downloaded successfully',
        });
      } else {
        throw new Error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  const requestRefund = async (purchaseId: string) => {
    try {
      const response = await fetch(
        `/api/v1/purchases/${purchaseId}/refund-request`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Refund request submitted successfully',
        });
        await fetchPurchaseHistory();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request refund');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request refund',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canRequestRefund = (purchase: Purchase) => {
    const daysSincePurchase = Math.floor(
      (Date.now() - new Date(purchase.purchaseDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return (
      purchase.paymentStatus === 'completed' &&
      daysSincePurchase <= 30 &&
      !purchase.refundInfo
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground">
            Track your course purchases and download receipts
          </p>
        </div>
        <Button onClick={fetchPurchaseHistory} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchases
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPurchases}</div>
              <p className="text-sm text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalSpent, stats.currency)}
              </div>
              <p className="text-sm text-muted-foreground">Lifetime value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Courses Owned
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-sm text-muted-foreground">In your library</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.averageOrderValue, stats.currency)}
              </div>
              <p className="text-sm text-muted-foreground">Per purchase</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Purchase List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-4 rounded-lg border p-4">
                    <div className="h-16 w-20 rounded bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                      <div className="h-3 w-1/4 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-8 text-center">
              <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No purchases found</h3>
              <p className="mb-4 text-muted-foreground">
                You haven't made any purchases yet or no purchases match your
                filters.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map(purchase => (
                <div
                  key={purchase.id}
                  className="space-y-4 rounded-lg border p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          Order #{purchase.orderId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(purchase.purchaseDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog
                        open={
                          receiptDialogOpen &&
                          selectedReceipt?.id === purchase.id
                        }
                        onOpenChange={open => {
                          setReceiptDialogOpen(open);
                          if (!open) setSelectedReceipt(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReceipt(purchase)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Receipt
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Receipt - Order #{purchase.orderId}
                            </DialogTitle>
                            <DialogDescription>
                              Purchase details and invoice information
                            </DialogDescription>
                          </DialogHeader>

                          {selectedReceipt && (
                            <div className="space-y-6">
                              {/* Receipt Header */}
                              <div className="rounded-lg bg-muted p-6 text-center">
                                <h2 className="mb-2 text-xl font-bold">
                                  Learning Platform
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                  Transaction ID:{' '}
                                  {selectedReceipt.transactionId}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Date:{' '}
                                  {formatDate(selectedReceipt.purchaseDate)}
                                </p>
                              </div>

                              {/* Billing Information */}
                              <div>
                                <h3 className="mb-3 font-medium">
                                  Billing Information
                                </h3>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    {selectedReceipt.billingInfo.firstName}{' '}
                                    {selectedReceipt.billingInfo.lastName}
                                  </p>
                                  <p>{selectedReceipt.billingInfo.email}</p>
                                  <p>{selectedReceipt.billingInfo.address}</p>
                                  <p>
                                    {selectedReceipt.billingInfo.city},{' '}
                                    {selectedReceipt.billingInfo.country}
                                  </p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <h3 className="mb-3 font-medium">
                                  Items Purchased
                                </h3>
                                <div className="space-y-3">
                                  {selectedReceipt.items.map(item => (
                                    <div
                                      key={item.id}
                                      className="flex items-start justify-between rounded-lg bg-muted p-3"
                                    >
                                      <div className="flex gap-3">
                                        <div className="relative h-12 w-16 overflow-hidden rounded bg-background">
                                          <Image
                                            src={
                                              item.thumbnailUrl ||
                                              '/placeholder-course.jpg'
                                            }
                                            alt={item.courseName}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div>
                                          <h4 className="font-medium">
                                            {item.courseName}
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                            by {item.teacherName}
                                          </p>
                                          {item.pricingModel ===
                                            'subscription' && (
                                            <Badge
                                              variant="outline"
                                              className="mt-1 text-xs"
                                            >
                                              {item.subscriptionType}{' '}
                                              subscription
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="font-medium">
                                        {formatCurrency(
                                          item.price,
                                          item.currency
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Payment Summary */}
                              <div className="space-y-2 rounded-lg bg-muted p-4">
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span>
                                    {formatCurrency(
                                      selectedReceipt.subtotal,
                                      selectedReceipt.currency
                                    )}
                                  </span>
                                </div>
                                {selectedReceipt.discount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>
                                      Discount
                                      {selectedReceipt.appliedCoupon && (
                                        <span className="ml-1 text-xs">
                                          ({selectedReceipt.appliedCoupon.code})
                                        </span>
                                      )}
                                    </span>
                                    <span>
                                      -
                                      {formatCurrency(
                                        selectedReceipt.discount,
                                        selectedReceipt.currency
                                      )}
                                    </span>
                                  </div>
                                )}
                                {selectedReceipt.tax > 0 && (
                                  <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>
                                      {formatCurrency(
                                        selectedReceipt.tax,
                                        selectedReceipt.currency
                                      )}
                                    </span>
                                  </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                  <span>Total</span>
                                  <span>
                                    {formatCurrency(
                                      selectedReceipt.total,
                                      selectedReceipt.currency
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Payment Method */}
                              <div>
                                <h3 className="mb-2 font-medium">
                                  Payment Method
                                </h3>
                                <p className="text-sm capitalize">
                                  {selectedReceipt.paymentMethod.replace(
                                    '_',
                                    ' '
                                  )}
                                </p>
                              </div>

                              {/* Refund Info */}
                              {selectedReceipt.refundInfo && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                  <h3 className="mb-2 font-medium text-red-800">
                                    Refund Information
                                  </h3>
                                  <div className="space-y-1 text-sm text-red-700">
                                    <p>
                                      Refunded:{' '}
                                      {formatCurrency(
                                        selectedReceipt.refundInfo.refundAmount,
                                        selectedReceipt.currency
                                      )}
                                    </p>
                                    <p>
                                      Date:{' '}
                                      {formatDate(
                                        selectedReceipt.refundInfo.refundedAt
                                      )}
                                    </p>
                                    <p>
                                      Reason:{' '}
                                      {selectedReceipt.refundInfo.reason}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    downloadReceipt(selectedReceipt.id)
                                  }
                                  className="flex-1"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(purchase.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Course List */}
                  <div className="space-y-3">
                    {purchase.items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg bg-muted p-3"
                      >
                        <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded bg-background">
                          <Image
                            src={item.thumbnailUrl || '/placeholder-course.jpg'}
                            alt={item.courseName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/courses/${item.courseSlug}`}>
                            <h4 className="line-clamp-1 font-medium transition-colors hover:text-primary">
                              {item.courseName}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            by {item.teacherName}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {item.pricingModel === 'subscription' && (
                              <Badge variant="outline" className="text-xs">
                                {item.subscriptionType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(item.price, item.currency)}
                          </div>
                          <Link href={`/student/courses/${item.courseId}`}>
                            <Button variant="ghost" size="sm" className="mt-1">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Access Course
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Payment: {purchase.paymentMethod.replace('_', ' ')}
                      </span>
                      <span>Items: {purchase.items.length}</span>
                      {purchase.appliedCoupon && (
                        <span className="text-green-600">
                          Coupon: {purchase.appliedCoupon.code}
                          (-
                          {formatCurrency(
                            purchase.appliedCoupon.discountAmount,
                            purchase.currency
                          )}
                          )
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold">
                        {formatCurrency(purchase.total, purchase.currency)}
                      </div>
                      {canRequestRefund(purchase) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestRefund(purchase.id)}
                        >
                          Request Refund
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Refund Info Display */}
                  {purchase.refundInfo && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <div className="mb-1 flex items-center gap-2 font-medium text-red-800">
                        <RefreshCw className="h-4 w-4" />
                        Refunded
                      </div>
                      <div className="text-sm text-red-700">
                        <p>
                          Amount:{' '}
                          {formatCurrency(
                            purchase.refundInfo.refundAmount,
                            purchase.currency
                          )}
                        </p>
                        <p>
                          Date: {formatDate(purchase.refundInfo.refundedAt)}
                        </p>
                        <p>Reason: {purchase.refundInfo.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
