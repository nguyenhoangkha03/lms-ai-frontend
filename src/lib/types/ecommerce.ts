export interface CartItem {
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

export interface CartSummary {
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

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'stripe' | 'bank_transfer' | 'crypto';
  name: string;
  description: string;
  icon: string;
  fees?: number;
  processingTime: string;
  isEnabled: boolean;
}

export interface BillingInfo {
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

export interface Purchase {
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
  billingInfo: BillingInfo;
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

export interface PurchaseItem {
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

export interface Subscription {
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

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'pending';
  paidAt: string;
  invoiceUrl?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  type: 'free' | 'paid' | 'subscription' | 'freemium';
  price: number;
  currency: string;
  billingPeriod?: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  trialDays?: number;
}

export interface Coupon {
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
  applicableProducts: string[];
  applicableCategories: string[];
  userGroups: string[];
}
