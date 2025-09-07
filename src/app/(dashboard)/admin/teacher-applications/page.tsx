'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useGetTeacherApplicationsQuery,
  useGetApprovalStatsQuery,
  useGetUsersQuery,
} from '@/lib/redux/api/admin-api';
import { TeacherApplicationQuery } from '@/lib/types';
import Link from 'next/link';

export default function TeacherApplicationsPage() {
  const [currentTab, setCurrentTab] = useState('pending');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const queryParams: TeacherApplicationQuery = {
    status: currentTab as any,
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    sortBy: sortBy as any,
    sortOrder,
  };

  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useGetTeacherApplicationsQuery(queryParams);

  // Try alternative approach - get all teachers
  const {
    data: allTeachersData,
    isLoading: teachersLoading,
    error: teachersError,
  } = useGetUsersQuery({
    userType: 'teacher',
    page: 1,
    limit: 50,
  });

  console.log('all', allTeachersData);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" />
            Under Review
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  // Process teachers data to create applications list
  const processedApplications = useMemo(() => {
    if (!allTeachersData?.users) return [];

    return allTeachersData.users
      .filter(user => {
        // Filter based on approval status to match currentTab
        // Backend returns teacherProfile as 'profile' field
        const isApproved = user.profile?.isApproved;
        const approvedBy = user.profile?.approvedBy;

        // Handle both boolean and number values for isApproved
        const isApprovedBool = isApproved === true;
        const isRejected = isApproved === false;

        switch (currentTab) {
          case 'pending':
            return !isApprovedBool && !approvedBy;
          case 'approved':
            return isApprovedBool;
          //   case 'rejected':
          //     return isRejected && approvedBy; // Rejected by someone
          case 'under_review':
            return !isApprovedBool && approvedBy; // Being reviewed
          default:
            return true;
        }
      })
      .filter(user => {
        // Apply search filter
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.profile?.specializations
            ?.join(',')
            .toLowerCase()
            .includes(searchLower)
        );
      });
  }, [allTeachersData?.users, currentTab, searchTerm]);

  // Calculate stats from processed data
  const calculatedStats = useMemo(() => {
    if (!allTeachersData?.users)
      return { pending: 0, approved: 0, rejected: 0, total: 0 };

    return allTeachersData.users.reduce(
      (stats, user) => {
        // Backend returns teacherProfile as 'profile' field
        const isApproved = user.profile?.isApproved;
        const approvedBy = user.profile?.approvedBy;

        // Handle both boolean and number values for isApproved
        const isApprovedBool = isApproved === true;
        const isRejected = isApproved === false;

        stats.total++;

        if (!isApprovedBool && !approvedBy) {
          stats.pending++;
        } else if (isApprovedBool) {
          stats.approved++;
        } else if (isRejected && approvedBy) {
          stats.rejected++;
        }

        return stats;
      },
      { pending: 0, approved: 0, rejected: 0, total: 0 }
    );
  }, [allTeachersData?.users]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teacher Applications
          </h1>
          <p className="text-muted-foreground">
            Manage and review teacher application requests
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetchApplications()}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{calculatedStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{calculatedStats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{calculatedStats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{calculatedStats.total}</p>
                <p className="text-xs text-muted-foreground">
                  Total Applications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submittedAt">Submitted Date</SelectItem>
                <SelectItem value="reviewedAt">Review Date</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="firstName">First Name</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={value => setSortOrder(value as 'ASC' | 'DESC')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Newest First</SelectItem>
                <SelectItem value="ASC">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({calculatedStats.pending})
              </TabsTrigger>
              <TabsTrigger value="under_review">Under Review (0)</TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({calculatedStats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({calculatedStats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {teachersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachersError && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-8 text-center text-red-600"
                          >
                            Error loading teachers: {teachersError?.toString()}
                          </TableCell>
                        </TableRow>
                      )}

                      {!teachersError && processedApplications.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No teacher applications found for status "
                            {currentTab}"
                          </TableCell>
                        </TableRow>
                      )}

                      {processedApplications.map(user => {
                        // Backend returns teacherProfile as 'profile' field
                        const isApproved = user.profile?.isApproved;
                        const isApprovedBool = isApproved === true;
                        const isRejected = isApproved === false;

                        const status = isApprovedBool
                          ? 'approved'
                          : isRejected
                            ? 'pending'
                            : 'pending';

                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {user.profile?.specializations ||
                                  'Not specified'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {user.profile?.yearsExperience || 0} years
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(
                                  user.profile?.createdAt || user.createdAt
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Link
                                  href={`/admin/teacher-applications/${user.id}`}
                                >
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {applicationsData && applicationsData.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {applicationsData.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === applicationsData.totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
