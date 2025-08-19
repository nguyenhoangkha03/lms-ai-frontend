'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Download,
  BookOpen,
  Share2,
  Star,
  Gift,
  ArrowRight,
  Mail,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PurchaseDetails {
  orderId: string;
  transactionId: string;
  items: {
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
  }[];
  total: number;
  currency: string;
  paymentMethod: string;
  purchaseDate: string;
  receiptUrl?: string;
  nextSteps: string[];
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [purchaseDetails, setPurchaseDetails] =
    useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchPurchaseDetails();
    } else {
      router.push('/');
    }
  }, [orderId, router]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/purchases/${orderId}/details`);

      if (response.ok) {
        const data = await response.json();
        setPurchaseDetails(data);
      } else {
        throw new Error('Failed to fetch purchase details');
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase details',
        variant: 'destructive',
      });
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!purchaseDetails?.receiptUrl) return;

    try {
      const response = await fetch(purchaseDetails.receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${purchaseDetails.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  const sendReceiptEmail = async () => {
    try {
      const response = await fetch(
        `/api/v1/purchases/${orderId}/send-receipt`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: 'Success',
          description: 'Receipt sent to your email',
        });
      } else {
        throw new Error('Failed to send receipt');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send receipt email',
        variant: 'destructive',
      });
    }
  };

  const shareSuccess = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I just enrolled in new courses!',
          text: `Check out these amazing courses I just purchased on Learning Platform`,
          url: window.location.origin + '/courses',
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.origin + '/courses');
      toast({
        title: 'Link copied',
        description: 'Course link copied to clipboard',
      });
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading purchase details...</p>
        </div>
      </div>
    );
  }

  if (!purchaseDetails) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-2xl font-bold">Purchase not found</h1>
          <p className="mb-6 text-muted-foreground">
            We couldn't find the details for this purchase.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-green-600">
            Payment Successful!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. You now have access to your courses.
          </p>
        </div>

        {/* Purchase Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Order #{purchaseDetails.orderId}</span>
              <span>Transaction #{purchaseDetails.transactionId}</span>
              <span>
                {new Date(purchaseDetails.purchaseDate).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Items */}
            {purchaseDetails.items.map(item => (
              <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                  <Image
                    src={item.thumbnailUrl || '/placeholder-course.jpg'}
                    alt={item.courseName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.courseName}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {item.teacherName}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {item.pricingModel === 'subscription' && (
                      <Badge variant="outline">
                        {item.subscriptionType} subscription
                      </Badge>
                    )}
                    <Link href={`/student/courses/${item.courseId}`}>
                      <Button size="sm" variant="outline">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {formatCurrency(item.price, item.currency)}
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>
                {formatCurrency(
                  purchaseDetails.total,
                  purchaseDetails.currency
                )}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Paid via {purchaseDetails.paymentMethod.replace('_', ' ')}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <Download className="mx-auto mb-3 h-8 w-8 text-blue-600" />
              <h3 className="mb-2 font-medium">Download Receipt</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get your purchase receipt for records
              </p>
              <Button
                onClick={downloadReceipt}
                variant="outline"
                className="w-full"
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="mx-auto mb-3 h-8 w-8 text-green-600" />
              <h3 className="mb-2 font-medium">Email Receipt</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Send receipt to your email address
              </p>
              <Button
                onClick={sendReceiptEmail}
                variant="outline"
                className="w-full"
                disabled={emailSent}
              >
                {emailSent ? 'Sent!' : 'Send Email'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Share2 className="mx-auto mb-3 h-8 w-8 text-purple-600" />
              <h3 className="mb-2 font-medium">Share Your Success</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Tell others about your learning journey
              </p>
              <Button
                onClick={shareSuccess}
                variant="outline"
                className="w-full"
              >
                Share
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchaseDetails.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/student/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              <BookOpen className="mr-2 h-4 w-4" />
              Go to My Courses
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Browse More Courses
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            A confirmation email has been sent to your registered email address.
          </p>
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
