'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Gift,
  Clock,
  Star,
  TrendingUp,
  Info,
  Calendar,
  Infinity,
  Target,
  Calculator,
  Zap,
  Award,
  Percent,
  BookOpen,
  Globe,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import type { CourseDraft } from '@/lib/redux/api/course-creation-api';

interface PricingStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'VND', label: 'Vietnamese Dong (₫)', symbol: '₫' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
];

const PRICING_MODELS = [
  {
    value: 'free',
    label: 'Free',
    description: 'Completely free course',
    icon: Gift,
    color: 'bg-green-100 text-green-800 border-green-200',
    features: [
      'No payment required',
      'Great for building audience',
      'Can include ads',
    ],
  },
  {
    value: 'paid',
    label: 'One-time Payment',
    description: 'Students pay once for lifetime access',
    icon: CreditCard,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: ['Single purchase', 'Lifetime access', 'Higher perceived value'],
  },
  {
    value: 'subscription',
    label: 'Subscription',
    description: 'Recurring monthly or yearly payment',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    features: [
      'Recurring revenue',
      'Monthly/yearly options',
      'Ongoing content updates',
    ],
  },
  {
    value: 'freemium',
    label: 'Freemium',
    description: 'Free with premium paid content',
    icon: Star,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    features: [
      'Free tier available',
      'Premium paid content',
      'Best of both worlds',
    ],
  },
];

const SUGGESTED_PRICES = {
  beginner: { min: 19, max: 99, recommended: 49 },
  intermediate: { min: 49, max: 199, recommended: 99 },
  advanced: { min: 99, max: 499, recommended: 199 },
  expert: { min: 199, max: 999, recommended: 399 },
  all_levels: { min: 29, max: 149, recommended: 79 },
};

export function PricingStep({
  draft,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  errors = {},
}: PricingStepProps) {
  const { toast } = useToast();
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);

  const selectedCurrency =
    CURRENCIES.find(c => c.value === draft.pricing.currency) || CURRENCIES[0];
  const priceRange =
    SUGGESTED_PRICES[draft.basicInfo.level] || SUGGESTED_PRICES.beginner;

  // Calculate revenue projections
  const revenueProjections = useMemo(() => {
    if (draft.pricing.isFree) return null;

    const price = draft.pricing.price;
    const estimatedStudents = {
      conservative: Math.max(10, Math.floor(draft.curriculum.totalLessons * 2)),
      moderate: Math.max(25, Math.floor(draft.curriculum.totalLessons * 5)),
      optimistic: Math.max(50, Math.floor(draft.curriculum.totalLessons * 10)),
    };

    return {
      conservative: price * estimatedStudents.conservative,
      moderate: price * estimatedStudents.moderate,
      optimistic: price * estimatedStudents.optimistic,
      students: estimatedStudents,
    };
  }, [
    draft.pricing.price,
    draft.pricing.isFree,
    draft.curriculum.totalLessons,
  ]);

  // Update pricing model
  const updatePricingModel = (model: string) => {
    const isFree = model === 'free';
    onUpdate({
      pricing: {
        ...draft.pricing,
        pricingModel: model as any,
        isFree,
        price: isFree ? 0 : draft.pricing.price || priceRange.recommended,
      },
    });
  };

  // Apply suggested price
  const applySuggestedPrice = (priceType: 'min' | 'recommended' | 'max') => {
    onUpdate({
      pricing: {
        ...draft.pricing,
        price: priceRange[priceType],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Pricing Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Model
          </CardTitle>
          <CardDescription>
            Choose how students will access your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PRICING_MODELS.map(model => {
              const Icon = model.icon;
              const isSelected = draft.pricing.pricingModel === model.value;

              return (
                <motion.div
                  key={model.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md',
                      isSelected && 'border-blue-200 ring-2 ring-blue-500'
                    )}
                    onClick={() => updatePricingModel(model.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('rounded-lg p-2', model.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{model.label}</h3>
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="mb-2 text-sm text-gray-600">
                            {model.description}
                          </p>
                          <ul className="space-y-1 text-xs text-gray-500">
                            {model.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <div className="h-1 w-1 rounded-full bg-current" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Price Settings */}
      {!draft.pricing.isFree && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Price Settings
            </CardTitle>
            <CardDescription>
              Set your course price and currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Currency and Price */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={draft.pricing.currency}
                  onValueChange={value =>
                    onUpdate({
                      pricing: { ...draft.pricing, currency: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Course Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.pricing.price}
                    onChange={e =>
                      onUpdate({
                        pricing: {
                          ...draft.pricing,
                          price: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Original Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.pricing.originalPrice || ''}
                    onChange={e =>
                      onUpdate({
                        pricing: {
                          ...draft.pricing,
                          originalPrice:
                            parseFloat(e.target.value) || undefined,
                        },
                      })
                    }
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Show discount from original price
                </p>
              </div>
            </div>

            {/* Price Suggestions */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">
                  Suggested Pricing for {draft.basicInfo.level} Level
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestedPrice('min')}
                  className="flex h-auto flex-col p-3"
                >
                  <span className="text-lg font-bold">
                    {selectedCurrency.symbol}
                    {priceRange.min}
                  </span>
                  <span className="text-xs text-gray-600">Minimum</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestedPrice('recommended')}
                  className="flex h-auto flex-col border-blue-200 bg-blue-50 p-3"
                >
                  <span className="text-lg font-bold text-blue-700">
                    {selectedCurrency.symbol}
                    {priceRange.recommended}
                  </span>
                  <span className="text-xs text-blue-600">Recommended</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestedPrice('max')}
                  className="flex h-auto flex-col p-3"
                >
                  <span className="text-lg font-bold">
                    {selectedCurrency.symbol}
                    {priceRange.max}
                  </span>
                  <span className="text-xs text-gray-600">Premium</span>
                </Button>
              </div>
            </div>

            {/* Discount Display */}
            {draft.pricing.originalPrice &&
              draft.pricing.originalPrice > draft.pricing.price && (
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Discount Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-700">
                      {selectedCurrency.symbol}
                      {draft.pricing.price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {selectedCurrency.symbol}
                      {draft.pricing.originalPrice}
                    </span>
                    <Badge className="bg-red-100 text-red-700">
                      {Math.round(
                        (1 -
                          draft.pricing.price / draft.pricing.originalPrice) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Access Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Access Settings
          </CardTitle>
          <CardDescription>
            Configure how long students have access to your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Infinity className="h-4 w-4" />
                Lifetime Access
              </Label>
              <p className="text-sm text-gray-600">
                Students can access the course forever
              </p>
            </div>
            <Switch
              checked={draft.pricing.lifetimeAccess}
              onCheckedChange={checked =>
                onUpdate({
                  pricing: { ...draft.pricing, lifetimeAccess: checked },
                })
              }
            />
          </div>

          {!draft.pricing.lifetimeAccess && (
            <div className="space-y-2">
              <Label>Access Duration (days)</Label>
              <Input
                type="number"
                min="1"
                value={draft.pricing.accessDuration || ''}
                onChange={e =>
                  onUpdate({
                    pricing: {
                      ...draft.pricing,
                      accessDuration: parseInt(e.target.value) || undefined,
                    },
                  })
                }
                placeholder="365"
              />
              <p className="text-xs text-gray-500">
                Number of days students have access after enrollment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      {revenueProjections && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Projections
            </CardTitle>
            <CardDescription>
              Estimated revenue based on your course content and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {selectedCurrency.symbol}
                  {revenueProjections.conservative.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Conservative</div>
                <div className="text-xs text-gray-500">
                  {revenueProjections.students.conservative} students
                </div>
              </div>
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {selectedCurrency.symbol}
                  {revenueProjections.moderate.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">Moderate</div>
                <div className="text-xs text-blue-500">
                  {revenueProjections.students.moderate} students
                </div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {selectedCurrency.symbol}
                  {revenueProjections.optimistic.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Optimistic</div>
                <div className="text-xs text-green-500">
                  {revenueProjections.students.optimistic} students
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                These are rough estimates based on course length and industry
                averages. Actual results depend on many factors including
                marketing, course quality, and market demand.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Pricing Strategy Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Pricing Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Pricing Best Practices:</strong>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>Research competitor pricing in your category</li>
                  <li>
                    Consider the value you're providing vs. time investment
                  </li>
                  <li>
                    Start with competitive pricing and adjust based on feedback
                  </li>
                  <li>Offer early-bird discounts to build initial momentum</li>
                  <li>Consider free preview lessons to demonstrate value</li>
                  <li>Bundle multiple courses for higher perceived value</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Course Value Assessment */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium">
                  <BookOpen className="h-4 w-4" />
                  Course Value Metrics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Content:</span>
                    <span className="font-medium">
                      {Math.floor(draft.curriculum.totalDuration / 60)}h{' '}
                      {draft.curriculum.totalDuration % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Lessons:</span>
                    <span className="font-medium">
                      {draft.curriculum.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Course Level:</span>
                    <span className="font-medium capitalize">
                      {draft.basicInfo.level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per Hour:</span>
                    <span className="font-medium">
                      {draft.curriculum.totalDuration > 0
                        ? `${selectedCurrency.symbol}${(draft.pricing.price / (draft.curriculum.totalDuration / 60)).toFixed(2)}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium">
                  <Globe className="h-4 w-4" />
                  Market Position
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Suggested Range:</span>
                    <span className="font-medium">
                      {selectedCurrency.symbol}
                      {priceRange.min} - {selectedCurrency.symbol}
                      {priceRange.max}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Price:</span>
                    <Badge
                      variant={
                        draft.pricing.price < priceRange.min
                          ? 'destructive'
                          : draft.pricing.price > priceRange.max
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {selectedCurrency.symbol}
                      {draft.pricing.price}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Position:</span>
                    <span className="font-medium">
                      {draft.pricing.price < priceRange.recommended
                        ? 'Budget'
                        : draft.pricing.price > priceRange.recommended
                          ? 'Premium'
                          : 'Market'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
