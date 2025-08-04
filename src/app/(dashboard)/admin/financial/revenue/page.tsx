'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RevenueMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  averageOrderValue: number;
  refundRate: number;
  activeSubscriptions: number;
  monthlyRecurring: number;
  conversionRate: number;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'one_time' | 'subscription' | 'refund';
  description: string;
  paymentMethod: string;
  createdAt: string;
  courseId?: string;
  courseName?: string;
}

interface PaymentProvider {
  id: string;
  name: string;
  isActive: boolean;
  transactionCount: number;
  totalAmount: number;
  successRate: number;
}

export default function RevenueDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    provider: 'all',
  });

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange, filters]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Fetch revenue metrics
      const metricsResponse = await fetch(
        '/api/v1/financial/revenue/metrics?' +
          new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          })
      );
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch transactions
      const transactionsResponse = await fetch(
        '/api/v1/financial/transactions?' +
          new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            status: filters.status,
            type: filters.type,
            provider: filters.provider,
            limit: '50',
          })
      );
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData.data || []);

      // Fetch payment providers
      const providersResponse = await fetch(
        '/api/v1/financial/payment-providers/statistics'
      );
      const providersData = await providersResponse.json();
      setProviders(providersData || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revenue data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(
        '/api/v1/financial/revenue/export?' +
          new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            format: 'xlsx',
          })
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-report-${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Revenue report exported successfully',
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export revenue report',
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

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">
            Track revenue metrics and payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRevenueData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <DatePicker
              date={dateRange.from}
              onDateChange={date =>
                setDateRange(prev => ({ ...prev, from: date || new Date() }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <DatePicker
              date={dateRange.to}
              onDateChange={date =>
                setDateRange(prev => ({ ...prev, to: date || new Date() }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={filters.type}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <Select
              value={filters.provider}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className="flex items-center text-sm">
                {metrics.revenueGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    metrics.revenueGrowth >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }
                >
                  {Math.abs(metrics.revenueGrowth)}%
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalTransactions.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Average: {formatCurrency(metrics.averageOrderValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Recurring
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.monthlyRecurring)}
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.activeSubscriptions} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.conversionRate.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Refund rate: {metrics.refundRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="providers">Payment Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium">
                          {transaction.userName}
                        </span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.userEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                      {transaction.courseName && (
                        <p className="text-sm text-blue-600">
                          Course: {transaction.courseName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.paymentMethod}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Providers</CardTitle>
              <CardDescription>
                Performance metrics for each payment provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map(provider => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${provider.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(provider.totalAmount)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Success rate: {provider.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
