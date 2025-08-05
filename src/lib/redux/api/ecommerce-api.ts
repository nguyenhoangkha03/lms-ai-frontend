import { baseApi } from '@/lib/api/base-api';
import type {
  CartItem,
  CartSummary,
  PaymentMethod,
  Purchase,
  Subscription,
  PricingPlan,
  Coupon,
  BillingInfo,
} from '@/lib/types/ecommerce';

export const ecommerceApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Cart Management
    getCart: builder.query<{ items: CartItem[]; summary: CartSummary }, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<
      CartItem,
      { courseId: string; pricingModel?: string; subscriptionType?: string }
    >({
      query: data => ({
        url: '/cart/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation<void, string>({
      query: itemId => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    applyCoupon: builder.mutation<CartSummary, { couponCode: string }>({
      query: data => ({
        url: '/cart/apply-coupon',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCoupon: builder.mutation<CartSummary, void>({
      query: () => ({
        url: '/cart/remove-coupon',
        method: 'POST',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: '/cart/clear',
        method: 'POST',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Payment Methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/payment/methods',
      providesTags: ['PaymentMethods'],
    }),

    processPayment: builder.mutation<
      { orderId: string; transactionId: string; status: string },
      {
        items: {
          courseId: string;
          pricingModel: string;
          subscriptionType?: string;
        }[];
        billingInfo: BillingInfo;
        paymentMethod: string;
        cardInfo?: any;
        subscribeNewsletter?: boolean;
      }
    >({
      query: data => ({
        url: '/payment/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'Purchases', 'Subscriptions'],
    }),

    // Purchase History
    getPurchaseHistory: builder.query<
      { data: Purchase[]; total: number; page: number; totalPages: number },
      {
        search?: string;
        status?: string;
        dateRange?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/purchases/history',
        params,
      }),
      providesTags: ['Purchases'],
    }),

    getPurchaseStats: builder.query<
      {
        totalPurchases: number;
        totalSpent: number;
        totalCourses: number;
        averageOrderValue: number;
        currency: string;
      },
      void
    >({
      query: () => '/purchases/stats',
      providesTags: ['PurchaseStats'],
    }),

    getPurchaseDetails: builder.query<Purchase, string>({
      query: orderId => `/purchases/${orderId}/details`,
      providesTags: (result, error, orderId) => [
        { type: 'Purchase', id: orderId },
      ],
    }),

    downloadReceipt: builder.mutation<Blob, string>({
      query: purchaseId => ({
        url: `/purchases/${purchaseId}/receipt`,
        method: 'GET',
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    requestRefund: builder.mutation<
      void,
      { purchaseId: string; reason?: string }
    >({
      query: ({ purchaseId, reason }) => ({
        url: `/purchases/${purchaseId}/refund-request`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Purchases'],
    }),

    // Subscriptions
    getSubscriptions: builder.query<
      { data: Subscription[]; total: number },
      { status?: string; limit?: number }
    >({
      query: params => ({
        url: '/subscriptions',
        params,
      }),
      providesTags: ['Subscriptions'],
    }),

    getSubscriptionStats: builder.query<
      {
        totalActiveSubscriptions: number;
        totalMonthlySpend: number;
        totalYearlySpend: number;
        currency: string;
        nextPaymentAmount: number;
        nextPaymentDate: string;
      },
      void
    >({
      query: () => '/subscriptions/stats',
      providesTags: ['SubscriptionStats'],
    }),

    pauseSubscription: builder.mutation<void, string>({
      query: subscriptionId => ({
        url: `/subscriptions/${subscriptionId}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    resumeSubscription: builder.mutation<void, string>({
      query: subscriptionId => ({
        url: `/subscriptions/${subscriptionId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    cancelSubscription: builder.mutation<
      void,
      { subscriptionId: string; cancelAtPeriodEnd?: boolean }
    >({
      query: ({ subscriptionId, cancelAtPeriodEnd = true }) => ({
        url: `/subscriptions/${subscriptionId}/cancel`,
        method: 'POST',
        body: { cancelAtPeriodEnd },
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    changePlan: builder.mutation<
      void,
      { subscriptionId: string; plan: 'monthly' | 'yearly' }
    >({
      query: ({ subscriptionId, plan }) => ({
        url: `/subscriptions/${subscriptionId}/change-plan`,
        method: 'POST',
        body: { plan },
      }),
      invalidatesTags: ['Subscriptions'],
    }),

    // Pricing Plans
    getPricingPlans: builder.query<PricingPlan[], { courseId?: string }>({
      query: params => ({
        url: '/pricing/plans',
        params,
      }),
      providesTags: ['PricingPlans'],
    }),

    // Coupons (public)
    validateCoupon: builder.query<
      { valid: boolean; coupon?: Coupon; error?: string },
      { code: string; courseIds?: string[] }
    >({
      query: params => ({
        url: '/coupons/validate',
        params,
      }),
    }),
  }),
});

export const {
  // Cart hooks
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useClearCartMutation,

  // Payment hooks
  useGetPaymentMethodsQuery,
  useProcessPaymentMutation,

  // Purchase hooks
  useGetPurchaseHistoryQuery,
  useGetPurchaseStatsQuery,
  useGetPurchaseDetailsQuery,
  useDownloadReceiptMutation,
  useRequestRefundMutation,

  // Subscription hooks
  useGetSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
  useChangePlanMutation,

  // Pricing hooks
  useGetPricingPlansQuery,
  useValidateCouponQuery,
} = ecommerceApi;
