'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  CreditCard,
  RefreshCw,
  Percent,
  BarChart3,
  Mail,
  TrendingUp,
  Users,
  ShoppingCart,
} from 'lucide-react';

interface FinancialLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'Revenue Dashboard',
    href: '/admin/financial/revenue',
    icon: DollarSign,
    description: 'Revenue metrics and payment analytics',
    badge: null,
  },
  {
    title: 'Payment Management',
    href: '/admin/financial/payments',
    icon: CreditCard,
    description: 'Transaction processing and monitoring',
    badge: null,
  },
  {
    title: 'Refund Processing',
    href: '/admin/financial/refunds',
    icon: RefreshCw,
    description: 'Manage refund requests and processing',
    badge: 'New',
  },
  {
    title: 'Coupon Management',
    href: '/admin/financial/coupons',
    icon: Percent,
    description: 'Create and manage discount coupons',
    badge: null,
  },
  {
    title: 'Financial Reports',
    href: '/admin/financial/reports',
    icon: BarChart3,
    description: 'Comprehensive financial analytics',
    badge: null,
  },
  {
    title: 'Email Campaigns',
    href: '/admin/financial/email-campaigns',
    icon: Mail,
    description: 'Marketing campaigns and automation',
    badge: null,
  },
];

export default function FinancialLayout({ children }: FinancialLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics, payment processing, and revenue
            management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-200 text-green-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            Revenue Growing
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-xl font-bold">$124,567</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Transactions
              </p>
              <p className="text-xl font-bold">2,847</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Customers
              </p>
              <p className="text-xl font-bold">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Order Value
              </p>
              <p className="text-xl font-bold">$87.50</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Card
                className={cn(
                  'cursor-pointer p-6 transition-all duration-200 hover:shadow-md',
                  isActive && 'bg-primary/5 ring-2 ring-primary'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'rounded-lg p-3',
                        isActive ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-6 w-6',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3
                        className={cn(
                          'font-semibold',
                          isActive && 'text-primary'
                        )}
                      >
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="mt-8">{children}</div>
    </div>
  );
}
