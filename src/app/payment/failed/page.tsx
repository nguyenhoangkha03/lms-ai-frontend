('use client');

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  XCircle,
  RefreshCw,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';

interface FailureDetails {
  orderId?: string;
  errorCode: string;
  errorMessage: string;
  failureReason: string;
  suggestedActions: string[];
  retryAllowed: boolean;
  supportContactInfo: {
    email: string;
    phone: string;
  };
}

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [failureDetails, setFailureDetails] = useState<FailureDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const errorCode = searchParams.get('error');

  useEffect(() => {
    fetchFailureDetails();
  }, []);

  const fetchFailureDetails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (orderId) params.append('orderId', orderId);
      if (errorCode) params.append('errorCode', errorCode);

      const response = await fetch(`/api/v1/payment/failure-details?${params}`);

      if (response.ok) {
        const data = await response.json();
        setFailureDetails(data);
      } else {
        // Fallback failure details
        setFailureDetails({
          errorCode: errorCode || 'PAYMENT_FAILED',
          errorMessage: 'Payment could not be processed',
          failureReason:
            'There was an issue processing your payment. Please try again or contact support.',
          suggestedActions: [
            'Check your payment method details',
            'Ensure sufficient funds are available',
            'Try a different payment method',
            'Contact your bank if the issue persists',
          ],
          retryAllowed: true,
          supportContactInfo: {
            email: 'support@learningplatform.com',
            phone: '+1-800-123-4567',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching failure details:', error);
      setFailureDetails({
        errorCode: 'UNKNOWN_ERROR',
        errorMessage: 'An unexpected error occurred',
        failureReason:
          'We encountered an unexpected issue. Please try again or contact support.',
        suggestedActions: ['Try again later', 'Contact support for assistance'],
        retryAllowed: true,
        supportContactInfo: {
          email: 'support@learningplatform.com',
          phone: '+1-800-123-4567',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Failure Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-red-600">
            Payment Failed
          </h1>
          <p className="text-lg text-muted-foreground">
            We couldn't process your payment. Don't worry, no charges were made.
          </p>
        </div>

        {/* Error Details */}
        {failureDetails && (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {failureDetails.errorMessage}
                {failureDetails.errorCode && (
                  <span className="mt-1 block text-xs opacity-75">
                    Error Code: {failureDetails.errorCode}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>What happened?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {failureDetails.failureReason}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to fix this</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {failureDetails.suggestedActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {failureDetails.retryAllowed && (
                <Button onClick={retryPayment} size="lg" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Link href="/cart" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Button>
              </Link>
            </div>

            {/* Support Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  If you continue experiencing issues, our support team is here
                  to help.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <a
                        href={`mailto:${failureDetails.supportContactInfo.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {failureDetails.supportContactInfo.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <a
                        href={`tel:${failureDetails.supportContactInfo.phone}`}
                        className="text-sm text-green-600 hover:underline"
                      >
                        {failureDetails.supportContactInfo.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <div className="space-y-4 text-center">
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/courses">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Continue Browsing Courses
                  </Button>
                </Link>
                <Link href="/student/wishlist">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    View My Wishlist
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Payment issues are usually resolved quickly. We appreciate
                  your patience.
                </p>
              </div>
            </div>

            {/* Order Reference */}
            {orderId && (
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <strong>Reference:</strong> Order #{orderId}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Please include this reference when contacting support
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
