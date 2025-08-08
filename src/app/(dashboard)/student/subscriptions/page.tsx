'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  CreditCard,
  RefreshCw,
  Pause,
  Play,
  StopCircle,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Gift,
  Zap,
  Eye,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Subscription {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  thumbnailUrl: string;
  teacherName: string;
  plan: 'monthly' | 'yearly';
  price: number;
  currency: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due';
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  nextPaymentDate: string;
  paymentMethod: string;
  totalPaid: number;
  paymentHistory: PaymentRecord[];
  features: string[];
  usageStats: {
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
    lastAccessed: string;
  };
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'pending';
  paidAt: string;
  invoiceUrl?: string;
}

interface SubscriptionStats {
  totalActiveSubscriptions: number;
  totalMonthlySpend: number;
  totalYearlySpend: number;
  currency: string;
  nextPaymentAmount: number;
  nextPaymentDate: string;
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
    fetchSubscriptionStats();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        limit: '50',
      });

      const response = await fetch(`/api/v1/subscriptions?${params}`);
      const data = await response.json();
      setSubscriptions(data.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
    }
  };

  const pauseSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(
        `/api/v1/subscriptions/${subscriptionId}/pause`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Subscription paused successfully',
        });
        await fetchSubscriptions();
      } else {
        throw new Error('Failed to pause subscription');
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause subscription',
        variant: 'destructive',
      });
    }
  };

  const resumeSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(
        `/api/v1/subscriptions/${subscriptionId}/resume`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Subscription resumed successfully',
        });
        await fetchSubscriptions();
      } else {
        throw new Error('Failed to resume subscription');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume subscription',
        variant: 'destructive',
      });
    }
  };

  const cancelSubscription = async (
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ) => {
    try {
      const response = await fetch(
        `/api/v1/subscriptions/${subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancelAtPeriodEnd }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: cancelAtPeriodEnd
            ? 'Subscription will be cancelled at the end of current period'
            : 'Subscription cancelled immediately',
        });
        await fetchSubscriptions();
        setManageDialogOpen(false);
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  const changePlan = async (
    subscriptionId: string,
    newPlan: 'monthly' | 'yearly'
  ) => {
    try {
      const response = await fetch(
        `/api/v1/subscriptions/${subscriptionId}/change-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: newPlan }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Subscription plan updated successfully',
        });
        await fetchSubscriptions();
        setManageDialogOpen(false);
      } else {
        throw new Error('Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to change subscription plan',
        variant: 'destructive',
      });
    }
  };

  const updatePaymentMethod = async (subscriptionId: string) => {
    // This would typically redirect to a payment method update flow
    toast({
      title: 'Info',
      description: 'Redirecting to payment method update...',
    });
    // Implementation would depend on payment provider
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'cancelled':
        return <StopCircle className="h-4 w-4" />;
      case 'expired':
        return <Clock className="h-4 w-4" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4" />;
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

  const formatDate = (dateString: string, short = false) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: short ? 'short' : 'long',
      day: 'numeric',
    });
  };

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const yearlyMonthly = monthlyPrice * 12;
    const savings = yearlyMonthly - yearlyPrice;
    const percentage = Math.round((savings / yearlyMonthly) * 100);
    return { amount: savings, percentage };
  };

  const isTrialActive = (subscription: Subscription) => {
    return (
      subscription.trialEnd && new Date(subscription.trialEnd) > new Date()
    );
  };

  const getDaysUntilPayment = (nextPaymentDate: string) => {
    const days = Math.ceil(
      (new Date(nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your course subscriptions and billing
          </p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline" size="sm">
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
                Active Subscriptions
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalActiveSubscriptions}
              </div>
              <p className="text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Spend
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalMonthlySpend, stats.currency)}
              </div>
              <p className="text-sm text-muted-foreground">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Yearly Spend
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalYearlySpend, stats.currency)}
              </div>
              <p className="text-sm text-muted-foreground">Per year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Payment
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.nextPaymentAmount, stats.currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(stats.nextPaymentDate, true)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-16 w-20 rounded bg-muted" />
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
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No subscriptions found</h3>
              <p className="mb-6 text-muted-foreground">
                You don't have any active subscriptions or no subscriptions
                match your filter.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map(subscription => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={
                        subscription.thumbnailUrl || '/placeholder-course.jpg'
                      }
                      alt={subscription.courseName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            className={getStatusColor(subscription.status)}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(subscription.status)}
                              {subscription.status}
                            </div>
                          </Badge>

                          {isTrialActive(subscription) && (
                            <Badge
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-blue-700"
                            >
                              <Gift className="mr-1 h-3 w-3" />
                              Trial
                            </Badge>
                          )}

                          {subscription.cancelAtPeriodEnd && (
                            <Badge
                              variant="outline"
                              className="border-orange-200 bg-orange-50 text-orange-700"
                            >
                              Ending{' '}
                              {formatDate(subscription.currentPeriodEnd, true)}
                            </Badge>
                          )}
                        </div>

                        <Link href={`/courses/${subscription.courseSlug}`}>
                          <h3 className="line-clamp-1 text-lg font-semibold transition-colors hover:text-primary">
                            {subscription.courseName}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          by {subscription.teacherName}
                        </p>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency(
                            subscription.price,
                            subscription.currency
                          )}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{subscription.plan}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Next: {formatDate(subscription.nextPaymentDate, true)}
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>Course Progress</span>
                        <span>
                          {subscription.usageStats.lessonsCompleted}/
                          {subscription.usageStats.totalLessons} lessons
                        </span>
                      </div>
                      <Progress
                        value={
                          (subscription.usageStats.lessonsCompleted /
                            subscription.usageStats.totalLessons) *
                          100
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-medium">
                          {Math.floor(subscription.usageStats.timeSpent / 60)}h
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Time Spent
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-medium">
                          {formatCurrency(
                            subscription.totalPaid,
                            subscription.currency
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Paid
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-medium">
                          {getDaysUntilPayment(subscription.nextPaymentDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Days Until Payment
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-medium capitalize">
                          {subscription.paymentMethod.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Payment Method
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/student/courses/${subscription.courseId}`}
                        >
                          <Button variant="outline" size="sm">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Continue Learning
                          </Button>
                        </Link>

                        {subscription.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseSubscription(subscription.id)}
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </Button>
                        )}

                        {subscription.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resumeSubscription(subscription.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </Button>
                        )}
                      </div>

                      <Dialog
                        open={
                          manageDialogOpen &&
                          selectedSubscription?.id === subscription.id
                        }
                        onOpenChange={open => {
                          setManageDialogOpen(open);
                          if (!open) setSelectedSubscription(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedSubscription(subscription)
                            }
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Manage Subscription</DialogTitle>
                            <DialogDescription>
                              {subscription.courseName} - {subscription.plan}{' '}
                              plan
                            </DialogDescription>
                          </DialogHeader>

                          {selectedSubscription && (
                            <div className="space-y-6">
                              {/* Subscription Details */}
                              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                                <div>
                                  <div className="text-sm text-muted-foreground">
                                    Current Plan
                                  </div>
                                  <div className="font-medium capitalize">
                                    {selectedSubscription.plan}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">
                                    Price
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(
                                      selectedSubscription.price,
                                      selectedSubscription.currency
                                    )}
                                    /{selectedSubscription.plan}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">
                                    Status
                                  </div>
                                  <Badge
                                    className={getStatusColor(
                                      selectedSubscription.status
                                    )}
                                  >
                                    {selectedSubscription.status}
                                  </Badge>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">
                                    Next Payment
                                  </div>
                                  <div className="font-medium">
                                    {formatDate(
                                      selectedSubscription.nextPaymentDate,
                                      true
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Plan Change */}
                              <div>
                                <h3 className="mb-3 font-medium">
                                  Change Plan
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <Card
                                    className={
                                      selectedSubscription.plan === 'monthly'
                                        ? 'ring-2 ring-primary'
                                        : ''
                                    }
                                  >
                                    <CardContent className="p-4">
                                      <div className="font-medium">Monthly</div>
                                      <div className="text-2xl font-bold">
                                        {formatCurrency(
                                          selectedSubscription.price,
                                          selectedSubscription.currency
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        per month
                                      </div>
                                      {selectedSubscription.plan !==
                                        'monthly' && (
                                        <Button
                                          className="mt-3 w-full"
                                          size="sm"
                                          onClick={() =>
                                            changePlan(
                                              selectedSubscription.id,
                                              'monthly'
                                            )
                                          }
                                        >
                                          Switch to Monthly
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <Card
                                    className={
                                      selectedSubscription.plan === 'yearly'
                                        ? 'ring-2 ring-primary'
                                        : ''
                                    }
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          Yearly
                                        </span>
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Save 20%
                                        </Badge>
                                      </div>
                                      <div className="text-2xl font-bold">
                                        {formatCurrency(
                                          selectedSubscription.price * 10,
                                          selectedSubscription.currency
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        per year
                                      </div>
                                      {selectedSubscription.plan !==
                                        'yearly' && (
                                        <Button
                                          className="mt-3 w-full"
                                          size="sm"
                                          onClick={() =>
                                            changePlan(
                                              selectedSubscription.id,
                                              'yearly'
                                            )
                                          }
                                        >
                                          Switch to Yearly
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>

                              {/* Payment Method */}
                              <div>
                                <h3 className="mb-3 font-medium">
                                  Payment Method
                                </h3>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium capitalize">
                                        {selectedSubscription.paymentMethod.replace(
                                          '_',
                                          ' '
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Last updated:{' '}
                                        {formatDate(
                                          selectedSubscription.startDate,
                                          true
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updatePaymentMethod(
                                        selectedSubscription.id
                                      )
                                    }
                                  >
                                    Update
                                  </Button>
                                </div>
                              </div>

                              {/* Payment History */}
                              <div>
                                <h3 className="mb-3 font-medium">
                                  Recent Payments
                                </h3>
                                <div className="max-h-40 space-y-2 overflow-y-auto">
                                  {selectedSubscription.paymentHistory
                                    .slice(0, 5)
                                    .map(payment => (
                                      <div
                                        key={payment.id}
                                        className="flex items-center justify-between rounded border p-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant={
                                              payment.status === 'paid'
                                                ? 'default'
                                                : 'destructive'
                                            }
                                            className="text-xs"
                                          >
                                            {payment.status}
                                          </Badge>
                                          <span className="text-sm">
                                            {formatDate(payment.paidAt, true)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {formatCurrency(
                                              payment.amount,
                                              payment.currency
                                            )}
                                          </span>
                                          {payment.invoiceUrl && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              asChild
                                            >
                                              <a
                                                href={payment.invoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <Eye className="h-3 w-3" />
                                              </a>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* Cancel Subscription */}
                              <div className="border-t pt-4">
                                <h3 className="mb-3 font-medium text-red-600">
                                  Cancel Subscription
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                  You can cancel your subscription at any time.
                                  You'll continue to have access until the end
                                  of your current billing period.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      cancelSubscription(
                                        selectedSubscription.id,
                                        true
                                      )
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Cancel at Period End
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      cancelSubscription(
                                        selectedSubscription.id,
                                        false
                                      )
                                    }
                                  >
                                    Cancel Immediately
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
