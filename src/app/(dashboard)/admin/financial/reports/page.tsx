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
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Percent,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FinancialOverview {
  totalRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  transactionGrowth: number;
  activeCustomers: number;
  customerGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  refundRate: number;
  conversionRate: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
}

interface RevenueBreakdown {
  oneTimePayments: number;
  subscriptions: number;
  refunds: number;
  fees: number;
  netRevenue: number;
}

interface TopProducts {
  id: string;
  name: string;
  revenue: number;
  units: number;
  growth: number;
}

interface PaymentMethodStats {
  method: string;
  transactions: number;
  revenue: number;
  percentage: number;
  successRate: number;
}

interface GeographicData {
  country: string;
  revenue: number;
  transactions: number;
  percentage: number;
}

export default function FinancialReports() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] =
    useState<RevenueBreakdown | null>(null);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodStats[]>(
    []
  );
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [reportType, setReportType] = useState('summary');
  const [compareWith, setCompareWith] = useState('previous_period');

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange, compareWith]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        compare: compareWith,
      });

      // Fetch overview data
      const overviewResponse = await fetch(
        `/api/v1/financial/reports/overview?${params}`
      );
      const overviewData = await overviewResponse.json();
      setOverview(overviewData);

      // Fetch revenue breakdown
      const breakdownResponse = await fetch(
        `/api/v1/financial/reports/breakdown?${params}`
      );
      const breakdownData = await breakdownResponse.json();
      setRevenueBreakdown(breakdownData);

      // Fetch top products
      const productsResponse = await fetch(
        `/api/v1/financial/reports/top-products?${params}`
      );
      const productsData = await productsResponse.json();
      setTopProducts(productsData || []);

      // Fetch payment methods stats
      const paymentResponse = await fetch(
        `/api/v1/financial/reports/payment-methods?${params}`
      );
      const paymentData = await paymentResponse.json();
      setPaymentMethods(paymentData || []);

      // Fetch geographic data
      const geoResponse = await fetch(
        `/api/v1/financial/reports/geographic?${params}`
      );
      const geoData = await geoResponse.json();
      setGeographicData(geoData || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        type: reportType,
        format,
      });

      const response = await fetch(
        `/api/v1/financial/reports/export?${params}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: `Financial report exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
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
          <h1 className="text-3xl font-bold">Financial Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive financial insights and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchFinancialData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="detailed">Detailed Report</SelectItem>
              <SelectItem value="tax">Tax Report</SelectItem>
              <SelectItem value="reconciliation">Reconciliation</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('xlsx')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex gap-4 pt-6">
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
            <label className="text-sm font-medium">Compare With</label>
            <Select value={compareWith} onValueChange={setCompareWith}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous_period">Previous Period</SelectItem>
                <SelectItem value="previous_year">Previous Year</SelectItem>
                <SelectItem value="no_comparison">No Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      {overview && (
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
                {formatCurrency(overview.totalRevenue)}
              </div>
              <div
                className={`flex items-center text-sm ${getGrowthColor(overview.revenueGrowth)}`}
              >
                {getGrowthIcon(overview.revenueGrowth)}
                <span className="ml-1">
                  {formatPercentage(overview.revenueGrowth)}
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs {compareWith.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalTransactions.toLocaleString()}
              </div>
              <div
                className={`flex items-center text-sm ${getGrowthColor(overview.transactionGrowth)}`}
              >
                {getGrowthIcon(overview.transactionGrowth)}
                <span className="ml-1">
                  {formatPercentage(overview.transactionGrowth)}
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs {compareWith.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.activeCustomers.toLocaleString()}
              </div>
              <div
                className={`flex items-center text-sm ${getGrowthColor(overview.customerGrowth)}`}
              >
                {getGrowthIcon(overview.customerGrowth)}
                <span className="ml-1">
                  {formatPercentage(overview.customerGrowth)}
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs {compareWith.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Order Value
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.averageOrderValue)}
              </div>
              <div
                className={`flex items-center text-sm ${getGrowthColor(overview.aovGrowth)}`}
              >
                {getGrowthIcon(overview.aovGrowth)}
                <span className="ml-1">
                  {formatPercentage(overview.aovGrowth)}
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs {compareWith.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary Metrics */}
      {overview && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.monthlyRecurringRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">
                Monthly Recurring Revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.conversionRate.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Visitor to customer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.refundRate.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Of total transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.churnRate.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Monthly churn</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          {revenueBreakdown && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>
                    Revenue composition by source
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <span className="font-medium">One-time Payments</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(revenueBreakdown.oneTimePayments)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <span className="font-medium">Subscriptions</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(revenueBreakdown.subscriptions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                    <span className="font-medium">Refunds</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(revenueBreakdown.refunds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                    <span className="font-medium">Processing Fees</span>
                    <span className="font-bold text-yellow-600">
                      -{formatCurrency(revenueBreakdown.fees)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border-2 border-gray-300 bg-gray-100 p-3">
                    <span className="text-lg font-bold">Net Revenue</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(revenueBreakdown.netRevenue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Visualization</CardTitle>
                  <CardDescription>
                    Visual representation of revenue sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                    <div className="text-center">
                      <PieChart className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Revenue breakdown pie chart
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Interactive chart placeholder
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Best selling courses and products by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.units} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(product.revenue)}
                      </div>
                      <div
                        className={`flex items-center text-sm ${getGrowthColor(product.growth)}`}
                      >
                        {getGrowthIcon(product.growth)}
                        <span className="ml-1">
                          {formatPercentage(product.growth)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <div className="py-8 text-center">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No product data available for this period
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Performance</CardTitle>
              <CardDescription>
                Transaction volume and success rates by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <div key={method.method} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium capitalize">
                          {method.method.replace('_', ' ')}
                        </h3>
                      </div>
                      <Badge variant="outline">
                        {method.percentage.toFixed(1)}% of total
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-bold">
                          {method.transactions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-bold">
                          {formatCurrency(method.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-bold text-green-600">
                          {method.successRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {paymentMethods.length === 0 && (
                  <div className="py-8 text-center">
                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No payment method data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Revenue Distribution</CardTitle>
              <CardDescription>
                Revenue breakdown by country and region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map(country => (
                  <div
                    key={country.country}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <span className="text-xs font-bold text-green-600">
                          {country.country.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{country.country}</h3>
                        <p className="text-sm text-muted-foreground">
                          {country.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(country.revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {country.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
                {geographicData.length === 0 && (
                  <div className="py-8 text-center">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No geographic data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="mr-2 h-5 w-5" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Revenue performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
            <div className="text-center">
              <LineChart className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Revenue trend line chart
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Time series visualization placeholder
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
