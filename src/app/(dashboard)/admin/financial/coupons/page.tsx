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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Calendar,
  Percent,
  DollarSign,
  Users,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const couponFormSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(50),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  minimumAmount: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  isActive: z.boolean(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  userGroups: z.array(z.string()).optional(),
});

type CouponFormData = z.infer<typeof couponFormSchema>;

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  currentUsage: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isExpired: boolean;
  createdAt: string;
  applicableProducts: string[];
  applicableCategories: string[];
  userGroups: string[];
  analytics: {
    totalUses: number;
    totalRevenue: number;
    totalDiscount: number;
    conversionRate: number;
  };
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimumAmount: undefined,
      maximumDiscount: undefined,
      usageLimit: undefined,
      usageLimitPerUser: undefined,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicableProducts: [],
      applicableCategories: [],
      userGroups: [],
    },
  });

  useEffect(() => {
    fetchCoupons();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        limit: '50',
      });

      const response = await fetch(`/api/v1/financial/coupons?${params}`);
      const data = await response.json();
      setCoupons(data.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      const url = editingCoupon
        ? `/api/v1/financial/coupons/${editingCoupon.id}`
        : '/api/v1/financial/coupons';

      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingCoupon
            ? 'Coupon updated successfully'
            : 'Coupon created successfully',
        });
        setCreateDialogOpen(false);
        setEditingCoupon(null);
        form.reset();
        await fetchCoupons();
      } else {
        throw new Error('Failed to save coupon');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to save coupon',
        variant: 'destructive',
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const response = await fetch(`/api/v1/financial/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Coupon deleted successfully',
        });
        await fetchCoupons();
      } else {
        throw new Error('Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
      });
    }
  };

  const duplicateCoupon = async (coupon: Coupon) => {
    const duplicatedData: CouponFormData = {
      code: `${coupon.code}_COPY`,
      name: `${coupon.name} (Copy)`,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minimumAmount: coupon.minimumAmount,
      maximumDiscount: coupon.maximumDiscount,
      usageLimit: coupon.usageLimit,
      usageLimitPerUser: coupon.usageLimitPerUser,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicableProducts: coupon.applicableProducts || [],
      applicableCategories: coupon.applicableCategories || [],
      userGroups: coupon.userGroups || [],
    };

    form.reset(duplicatedData);
    setCreateDialogOpen(true);
  };

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `/api/v1/financial/coupons/${couponId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        await fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update coupon status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return 'bg-gray-100 text-gray-800';
    if (coupon.isExpired) return 'bg-red-100 text-red-800';
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit)
      return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return 'Inactive';
    if (coupon.isExpired) return 'Expired';
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit)
      return 'Used Up';
    return 'Active';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    } else {
      return formatCurrency(coupon.value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground">
            Create and manage discount coupons
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCoupons} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </DialogTitle>
                <DialogDescription>
                  {editingCoupon
                    ? 'Update coupon details'
                    : 'Create a new discount coupon for your platform'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input placeholder="SUMMER2024" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for the coupon
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Sale 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="fixed_amount">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch('type') === 'percentage'
                              ? 'Percentage (%)'
                              : 'Amount ($)'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={
                                form.watch('type') === 'percentage'
                                  ? '20'
                                  : '10.00'
                              }
                              value={field.value || ''}
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : 0
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minimumAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Order Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="50.00"
                              value={field.value || ''}
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Optional minimum order value
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('type') === 'percentage' && (
                      <FormField
                        control={form.control}
                        name="maximumDiscount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                value={field.value || ''}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Cap for percentage discounts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="usageLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Usage Limit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              value={field.value || ''}
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Total times coupon can be used
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usageLimitPerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Limit Per User</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              value={field.value || ''}
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Times each user can use coupon
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid From</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onDateChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onDateChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Enable this coupon for use
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCreateDialogOpen(false);
                        setEditingCoupon(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="used_up">Used Up</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
          <CardDescription>Manage your discount coupons</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map(coupon => (
                <div
                  key={coupon.id}
                  className="space-y-4 rounded-lg border p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{coupon.name}</h3>
                        <Badge className={getStatusColor(coupon)}>
                          {getStatusText(coupon)}
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          {coupon.code}
                        </Badge>
                      </div>

                      {coupon.description && (
                        <p className="mb-3 text-muted-foreground">
                          {coupon.description}
                        </p>
                      )}

                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="flex items-center gap-2">
                          {coupon.type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-green-600" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          )}
                          <div>
                            <p className="text-lg font-semibold">
                              {formatDiscount(coupon)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {coupon.type === 'percentage'
                                ? 'Percentage Off'
                                : 'Fixed Discount'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="font-semibold">
                              {coupon.currentUsage}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {coupon.usageLimit
                                ? `of ${coupon.usageLimit} uses`
                                : 'Total Uses'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="font-semibold">
                              {formatDate(coupon.validFrom)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Start Date
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="font-semibold">
                              {formatDate(coupon.validUntil)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              End Date
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted p-4 md:grid-cols-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {coupon.analytics.totalUses}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Uses
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(coupon.analytics.totalRevenue)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Revenue Generated
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(coupon.analytics.totalDiscount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Discount
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {coupon.analytics.conversionRate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Conversion Rate
                          </p>
                        </div>
                      </div>

                      {/* Restrictions */}
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {coupon.minimumAmount && (
                          <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                            Min: {formatCurrency(coupon.minimumAmount)}
                          </span>
                        )}
                        {coupon.maximumDiscount && (
                          <span className="rounded bg-green-100 px-2 py-1 text-green-800">
                            Max Discount:{' '}
                            {formatCurrency(coupon.maximumDiscount)}
                          </span>
                        )}
                        {coupon.usageLimitPerUser && (
                          <span className="rounded bg-purple-100 px-2 py-1 text-purple-800">
                            {coupon.usageLimitPerUser} per user
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={checked =>
                            toggleCouponStatus(coupon.id, checked)
                          }
                        />
                        <span className="text-sm">Active</span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            const editData: CouponFormData = {
                              code: coupon.code,
                              name: coupon.name,
                              description: coupon.description || '',
                              type: coupon.type,
                              value: coupon.value,
                              minimumAmount: coupon.minimumAmount,
                              maximumDiscount: coupon.maximumDiscount,
                              usageLimit: coupon.usageLimit,
                              usageLimitPerUser: coupon.usageLimitPerUser,
                              validFrom: new Date(coupon.validFrom),
                              validUntil: new Date(coupon.validUntil),
                              isActive: coupon.isActive,
                              applicableProducts:
                                coupon.applicableProducts || [],
                              applicableCategories:
                                coupon.applicableCategories || [],
                              userGroups: coupon.userGroups || [],
                            };
                            form.reset(editData);
                            setCreateDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateCoupon(coupon)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Coupon Analytics: {coupon.name}
                              </DialogTitle>
                              <DialogDescription>
                                Detailed performance metrics for this coupon
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">
                                      {coupon.analytics.totalUses}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Total Uses
                                    </p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-green-600">
                                      {formatCurrency(
                                        coupon.analytics.totalRevenue
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Revenue
                                    </p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-red-600">
                                      {formatCurrency(
                                        coupon.analytics.totalDiscount
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Discount Given
                                    </p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {coupon.analytics.conversionRate.toFixed(
                                        1
                                      )}
                                      %
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Conversion
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                                <div className="text-center">
                                  <BarChart3 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Usage analytics chart placeholder
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {coupons.length === 0 && (
                <div className="py-8 text-center">
                  <Percent className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No coupons found</h3>
                  <p className="mb-4 text-muted-foreground">
                    Create your first coupon to start offering discounts
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Coupon
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
