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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  MessageSquare,
  Eye,
  Download,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RefundRequest {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  amount: number;
  currency: string;
  reason: string;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'processing'
    | 'completed'
    | 'failed';
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  processedBy?: string;
  adminNotes?: string;
  refundMethod: string;
  originalPaymentMethod: string;
  processingFee: number;
  netRefundAmount: number;
  documents: string[];
}

interface RefundStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalRefundAmount: number;
  averageProcessingTime: number;
}

export default function RefundManagement() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [searchTerm, statusFilter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: '50',
      });

      const response = await fetch(`/api/v1/financial/refunds?${params}`);
      const data = await response.json();
      setRefunds(data.data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load refund requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/financial/refunds/statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching refund stats:', error);
    }
  };

  const processRefund = async (
    refundId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    try {
      const response = await fetch(
        `/api/v1/financial/refunds/${refundId}/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            adminNotes: notes,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Refund ${action}d successfully`,
        });
        await fetchRefunds();
        await fetchStats();
        setProcessDialogOpen(false);
        setSelectedRefund(null);
        setAdminNotes('');
      } else {
        throw new Error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: 'Error',
        description: `Failed to ${action} refund`,
        variant: 'destructive',
      });
    }
  };

  const exportRefunds = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        format: 'xlsx',
      });

      const response = await fetch(
        `/api/v1/financial/refunds/export?${params}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `refunds-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Refunds exported successfully',
        });
      }
    } catch (error) {
      console.error('Error exporting refunds:', error);
      toast({
        title: 'Error',
        description: 'Failed to export refunds',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Refund Management</h1>
          <p className="text-muted-foreground">
            Process and manage refund requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRefunds} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportRefunds} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingRequests}
              </div>
              <p className="text-sm text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Refunded
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRefundAmount)}
              </div>
              <p className="text-sm text-muted-foreground">
                Approved: {stats.approvedRequests}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Processing
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageProcessingTime}h
              </div>
              <p className="text-sm text-muted-foreground">
                Rejected: {stats.rejectedRequests}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
                placeholder="Search by user, course, or transaction ID..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Refunds List */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Manage and process refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map(refund => (
                <div
                  key={refund.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className={getStatusColor(refund.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(refund.status)}
                            {refund.status}
                          </div>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Request #{refund.id.slice(-8)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {refund.userName}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {refund.userEmail}
                          </p>
                        </div>

                        <div>
                          <div className="font-medium">{refund.courseName}</div>
                          <p className="text-sm text-muted-foreground">
                            Course ID: {refund.courseId}
                          </p>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">
                              {formatCurrency(refund.amount, refund.currency)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Net:{' '}
                            {formatCurrency(
                              refund.netRefundAmount,
                              refund.currency
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg bg-muted p-3">
                        <p className="mb-1 text-sm font-medium">Reason:</p>
                        <p className="text-sm">{refund.reason}</p>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Requested: {formatDate(refund.requestedAt)}</span>
                        {refund.processedAt && (
                          <span>
                            Processed: {formatDate(refund.processedAt)}
                          </span>
                        )}
                        <span>Payment: {refund.originalPaymentMethod}</span>
                      </div>

                      {refund.adminNotes && (
                        <div className="mt-2 rounded border-l-4 border-blue-400 bg-blue-50 p-2">
                          <p className="text-sm font-medium text-blue-800">
                            Admin Notes:
                          </p>
                          <p className="text-sm text-blue-700">
                            {refund.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Refund Request Details</DialogTitle>
                            <DialogDescription>
                              Complete information for refund request #
                              {refund.id.slice(-8)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-medium">User</label>
                                <p>
                                  {refund.userName} ({refund.userEmail})
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">Course</label>
                                <p>{refund.courseName}</p>
                              </div>
                              <div>
                                <label className="font-medium">Amount</label>
                                <p>
                                  {formatCurrency(
                                    refund.amount,
                                    refund.currency
                                  )}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">
                                  Processing Fee
                                </label>
                                <p>
                                  {formatCurrency(
                                    refund.processingFee,
                                    refund.currency
                                  )}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">
                                  Net Refund
                                </label>
                                <p className="font-bold">
                                  {formatCurrency(
                                    refund.netRefundAmount,
                                    refund.currency
                                  )}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">
                                  Refund Method
                                </label>
                                <p>{refund.refundMethod}</p>
                              </div>
                            </div>

                            <div>
                              <label className="font-medium">Reason</label>
                              <p className="mt-1 rounded bg-muted p-2">
                                {refund.reason}
                              </p>
                            </div>

                            {refund.documents.length > 0 && (
                              <div>
                                <label className="font-medium">
                                  Supporting Documents
                                </label>
                                <div className="mt-2 space-y-1">
                                  {refund.documents.map((doc, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="mr-2"
                                    >
                                      Document {index + 1}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {refund.status === 'pending' && (
                        <>
                          <Dialog
                            open={
                              processDialogOpen &&
                              selectedRefund?.id === refund.id
                            }
                            onOpenChange={open => {
                              setProcessDialogOpen(open);
                              if (!open) {
                                setSelectedRefund(null);
                                setProcessingAction(null);
                                setAdminNotes('');
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setProcessingAction('approve');
                                  setProcessDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {processingAction === 'approve'
                                    ? 'Approve'
                                    : 'Reject'}{' '}
                                  Refund Request
                                </DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to {processingAction}{' '}
                                  this refund request?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    Admin Notes
                                  </label>
                                  <Textarea
                                    placeholder="Add notes about this decision..."
                                    value={adminNotes}
                                    onChange={e =>
                                      setAdminNotes(e.target.value)
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setProcessDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      selectedRefund &&
                                      processingAction &&
                                      processRefund(
                                        selectedRefund.id,
                                        processingAction,
                                        adminNotes
                                      )
                                    }
                                    variant={
                                      processingAction === 'approve'
                                        ? 'default'
                                        : 'destructive'
                                    }
                                  >
                                    {processingAction === 'approve'
                                      ? 'Approve'
                                      : 'Reject'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setProcessingAction('reject');
                              setProcessDialogOpen(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {refunds.length === 0 && (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    No refund requests found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
