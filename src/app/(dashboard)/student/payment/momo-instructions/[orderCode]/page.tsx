'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  CheckCircle2,
  Copy,
  Wallet,
  Smartphone,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Clock,
  AlertCircle,
  Phone,
  User,
  Hash,
  FileText,
  QrCode,
  Shield,
  ChevronRight,
  Zap,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import {
  useGetMoMoInstructionsQuery,
  useMarkMoMoPaidMutation,
  useGetPaymentByOrderCodeQuery,
} from '@/lib/redux/api/ecommerce-api';
import confetti from 'canvas-confetti';

export default function MoMoInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = params.orderCode as string;
  
  const [copied, setCopied] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    data: instructionsData,
    isLoading: instructionsLoading,
    error: instructionsError,
  } = useGetMoMoInstructionsQuery(orderCode);
  
  const {
    data: paymentData,
    isLoading: paymentLoading,
    refetch: refetchPayment,
  } = useGetPaymentByOrderCodeQuery(orderCode);
  
  const [markMoMoPaid, { isLoading: markingPaid }] = useMarkMoMoPaidMutation();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`Copied ${label}`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleMarkAsPaid = async () => {
    try {
      const result = await markMoMoPaid(orderCode).unwrap();
      toast.success(result.message);
      setShowSuccess(true);
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      refetchPayment();
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/student/courses/my-courses');
      }, 3000);
    } catch (error: any) {
      console.error('Mark paid error:', error);
      toast.error(error.data?.message || 'An error occurred while marking payment as paid');
    }
  };

  const formatCurrency = (amount: number, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  useEffect(() => {
    if (paymentData?.status === 'completed') {
      setShowSuccess(true);
    }
  }, [paymentData]);

  if (instructionsLoading || paymentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Wallet className="h-16 w-16 text-pink-300" />
              </div>
              <Wallet className="h-16 w-16 text-pink-500 relative z-10" />
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (instructionsError || !instructionsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-md text-center mt-20">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mx-auto mb-4 h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Unable to load payment information</h2>
              <p className="mb-6 text-gray-600">
                Please try again later or contact our support team.
              </p>
              <Link href="/student/cart">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { payment, instructions } = instructionsData;
  const isPaymentCompleted = paymentData?.status === 'completed';
  const isPaymentPending = paymentData?.status === 'pending_verification';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
            >
              <div className="mx-auto mb-4 h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment information submitted!</h3>
              <p className="text-gray-600 mb-6">
                We will verify your payment within 24 hours.
              </p>
              <Button 
                onClick={() => router.push('/student/courses/my-courses')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Go to My Courses
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/student/cart">
              <Button variant="ghost" size="sm" className="hover:bg-pink-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-pink-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-medium text-pink-700">Fast & Secure Payment</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Pay with MoMo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your payment in 3 simple steps to activate your course instantly
          </p>
        </motion.div>

        {/* Payment Status Card */}
        {isPaymentCompleted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-8 text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your course has been activated. You can start learning right now.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/student/courses/my-courses">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <Zap className="mr-2 h-5 w-5" />
                      Start Learning Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Instructions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Order Info */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <p className="text-pink-100 text-sm mb-1">Order Code</p>
                      <p className="font-bold text-2xl">{payment.orderCode}</p>
                    </div>
                    <div className="text-right text-white">
                      <p className="text-pink-100 text-sm mb-1">Payment Amount</p>
                      <p className="font-bold text-2xl">{formatCurrency(payment.amount, payment.currency)}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">
                          {isPaymentPending ? 'Pending verification' : 'Awaiting payment'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={isPaymentPending ? 'secondary' : 'outline'}
                      className="px-4 py-2"
                    >
                      {isPaymentPending ? 'Processing' : 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Step by Step Instructions */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span>Payment Instructions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {instructions.steps.map((step, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-4 p-4 rounded-xl transition-all ${
                        currentStep === index + 1 ? 'bg-pink-50 border-2 border-pink-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentStep(index + 1)}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep > index + 1 
                          ? 'bg-green-500 text-white' 
                          : currentStep === index + 1
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > index + 1 ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <p className={`flex-1 ${currentStep === index + 1 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Transfer Details */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-pink-600" />
                    Transfer Information
                  </h3>
                </div>
                <CardContent className="p-6 space-y-4">
                  {/* Phone Number */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-mono font-bold text-lg">{instructions.manualInfo.phone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.manualInfo.phone, 'phone number')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === 'phone number' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Recipient Name */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Recipient Name</p>
                        <p className="font-bold text-lg">{instructions.manualInfo.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-mono font-bold text-2xl text-green-700">
                          {instructions.manualInfo.amount.toLocaleString()} VND
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(instructions.manualInfo.amount.toString(), 'amount')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === 'amount' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Transfer Note */}
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Hash className="h-5 w-5 text-yellow-700" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Transfer Note (Important!)</p>
                          <p className="font-mono font-bold text-lg text-yellow-700 break-all">
                            {instructions.manualInfo.note}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instructions.manualInfo.note, 'note')}
                        className="flex-shrink-0"
                      >
                        {copied === 'note' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isPaymentPending && (
                    <div className="pt-4">
                      <Button 
                        onClick={handleMarkAsPaid}
                        disabled={markingPaid}
                        size="lg"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 text-lg shadow-lg"
                      >
                        {markingPaid ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            I have transferred the money
                          </>
                        )}
                      </Button>
                      <p className="text-center text-sm text-gray-500 mt-3">
                        Click this button after you have completed the transfer
                      </p>
                    </div>
                  )}

                  {isPaymentPending && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                          <Clock className="h-5 w-5 text-yellow-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-yellow-900 mb-1">Awaiting verification</p>
                          <p className="text-sm text-yellow-700">
                            We will verify your payment within 24 hours. 
                            You will receive an email notification when the payment is confirmed.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - QR Code */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* QR Code Card */}
              <Card className="border-0 shadow-xl sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-white" />
                    </div>
                    <span>Scan QR Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-2xl">
                    <div className="bg-white p-4 rounded-xl shadow-inner">
                      {instructions.qrInfo.data ? (
                        <QRCode
                          size={240}
                          value={instructions.qrInfo.data}
                          level="M"
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="h-[240px] flex items-center justify-center">
                          <div className="text-center">
                            <Smartphone className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500">QR Code not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Open MoMo app and scan the QR code
                    </p>
                    <p className="text-xs text-gray-500">
                      {instructions.qrInfo.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Quick Tips */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Quick payment tips:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">Double-check the transfer note</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">Take a screenshot after transfer</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">Click "I have transferred" immediately after</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refresh Status */}
              <Card className="border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Already transferred but don't see updates?
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => refetchPayment()}
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check status again
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-blue-900">Need support?</h4>
                    <p className="text-sm text-blue-700">
                      Contact: support@lms.edu.vn
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}