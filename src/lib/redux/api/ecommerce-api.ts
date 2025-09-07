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
    getCart: builder.query<
      {
        success: boolean;
        items: CartItem[];
        stats?: CartSummary;
        message?: string;
      },
      {
        includeCourseDetails?: boolean;
        includeTeacher?: boolean;
        includeStats?: boolean;
      }
    >({
      query: (params = {}) => ({
        url: '/cart',
        params: {
          includeCourseDetails: params.includeCourseDetails ?? true,
          includeTeacher: params.includeTeacher ?? true,
          includeStats: params.includeStats ?? true,
        },
      }),
      providesTags: ['Cart'],
      transformResponse: (response: any) => {
        console.log('response', response);
        return response;
      },
    }),

    addToCart: builder.mutation<
      CartItem,
      { courseId: string; metadata?: Record<string, any> }
    >({
      query: data => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        'Cart',
        'CartCount', 
        { type: 'CartCheck', id: courseId }
      ],
    }),

    removeFromCart: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: courseId => ({
        url: `/cart/items/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, courseId) => [
        'Cart',
        'CartCount',
        { type: 'CartCheck', id: courseId }
      ],
    }),

    applyCoupon: builder.mutation<CartSummary, { couponCode: string }>({
      query: data => ({
        url: '/cart/apply-coupon',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    removeCoupon: builder.mutation<CartSummary, void>({
      query: () => ({
        url: '/cart/remove-coupon',
        method: 'POST',
      }),
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    clearCart: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // New cart endpoints to match backend
    getCartCount: builder.query<{ count: number; success: boolean }, void>({
      query: () => '/cart/count',
      providesTags: ['Cart', 'CartCount'],
    }),

    checkInCart: builder.query<{ inCart: boolean; success: boolean }, string>({
      query: courseId => `/cart/check/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'CartCheck', id: courseId },
      ],
    }),

    bulkAddToCart: builder.mutation<
      { success: boolean; added: number; failed: string[] },
      { courseIds: string[]; metadata?: Record<string, any> }
    >({
      query: data => ({
        url: '/cart/bulk/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    bulkRemoveFromCart: builder.mutation<
      { success: boolean; removed: number; failed: string[] },
      { courseIds: string[] }
    >({
      query: data => ({
        url: '/cart/bulk/remove',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // Payment Methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/payment/methods',
      providesTags: ['PaymentMethods'],
    }),

    createPaymentFromCart: builder.mutation<
      {
        paymentUrl: string;
        orderCode: string;
        paymentId: string;
        expiredAt: string;
      },
      {
        paymentMethod: 'momo' | 'stripe';
        couponCode?: string;
        description?: string;
        metadata?: any;
      }
    >({
      query: data => ({
        url: '/payment/create-from-cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'Payments'],
    }),

    getPaymentByOrderCode: builder.query<
      {
        id: string;
        orderCode: string;
        paymentMethod: string;
        status: string;
        totalAmount: number;
        discountAmount: number;
        finalAmount: number;
        currency: string;
        description: string;
        createdAt: string;
        paidAt: string;
        items: Array<{
          id: string;
          courseId: string;
          courseTitle: string;
          courseThumbnail: string;
          price: number;
          originalPrice: number;
          discountAmount: number;
          currency: string;
          hasDiscount: boolean;
          discountPercent: number;
        }>;
      },
      string
    >({
      query: orderCode => ({
        url: `/payment/order/${orderCode}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, orderCode) => [
        { type: 'Payment', id: orderCode },
      ],
    }),

    createPayment: builder.mutation<
      {
        paymentUrl: string;
        orderCode: string;
        paymentId: string;
        expiredAt: string;
      },
      {
        paymentMethod: 'vnpay' | 'momo' | 'zalopay';
        items: {
          courseId: string;
          price: number;
          originalPrice?: number;
          currency?: string;
        }[];
        couponCode?: string;
        description?: string;
        metadata?: any;
      }
    >({
      query: data => ({
        url: '/payment/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    getPayment: builder.query<
      {
        id: string;
        orderCode: string;
        paymentMethod: string;
        status: string;
        totalAmount: number;
        discountAmount?: number;
        finalAmount: number;
        currency: string;
        description?: string;
        createdAt: string;
        paidAt?: string;
        items: {
          id: string;
          courseId: string;
          courseTitle?: string;
          courseThumbnail?: string;
          price: number;
          originalPrice?: number;
          discountAmount?: number;
          currency: string;
          hasDiscount: boolean;
          discountPercent: number;
        }[];
      },
      string
    >({
      query: paymentId => `/payment/${paymentId}`,
      providesTags: (result, error, paymentId) => [
        { type: 'Payment', id: paymentId },
      ],
    }),

    getUserPayments: builder.query<
      {
        payments: Array<{
          id: string;
          orderCode: string;
          paymentMethod: string;
          status: string;
          totalAmount: number;
          finalAmount: number;
          currency: string;
          createdAt: string;
          paidAt?: string;
        }>;
        total: number;
      },
      {
        status?: string;
        paymentMethod?: string;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: params => ({
        url: '/payment/my-payments',
        params,
      }),
      providesTags: ['Payments'],
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

    // MoMo Payment endpoints
    getMoMoInstructions: builder.query<
      {
        success: boolean;
        payment: {
          orderCode: string;
          amount: number;
          currency: string;
          status: string;
        };
        instructions: {
          steps: string[];
          manualInfo: {
            phone: string;
            name: string;
            amount: number;
            note: string;
          };
          qrInfo: {
            data: string;
            description: string;
          };
        };
      },
      string
    >({
      query: orderCode => `/payment/momo/instructions/${orderCode}`,
      providesTags: (result, error, orderCode) => [
        { type: 'Payment', id: orderCode },
      ],
    }),

    markMoMoPaid: builder.mutation<
      {
        success: boolean;
        message: string;
        orderCode: string;
      },
      string
    >({
      query: orderCode => ({
        url: `/payment/momo/mark-paid/${orderCode}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, orderCode) => [
        { type: 'Payment', id: orderCode },
      ],
    }),

    verifyMoMoPayment: builder.mutation<
      {
        success: boolean;
        message: string;
        result?: any;
      },
      { orderCode: string; transactionCode: string }
    >({
      query: ({ orderCode, transactionCode }) => ({
        url: `/payment/momo/verify/${orderCode}`,
        method: 'POST',
        body: { transactionCode },
      }),
      invalidatesTags: (result, error, { orderCode }) => [
        { type: 'Payment', id: orderCode },
        'Payments',
      ],
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
  useGetCartCountQuery,
  useCheckInCartQuery,
  useBulkAddToCartMutation,
  useBulkRemoveFromCartMutation,

  // Payment hooks
  useGetPaymentMethodsQuery,
  useCreatePaymentFromCartMutation,
  useGetPaymentByOrderCodeQuery,
  useCreatePaymentMutation,
  useGetPaymentQuery,
  useGetUserPaymentsQuery,
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

  // MoMo Payment hooks
  useGetMoMoInstructionsQuery,
  useMarkMoMoPaidMutation,
  useVerifyMoMoPaymentMutation,
} = ecommerceApi;
