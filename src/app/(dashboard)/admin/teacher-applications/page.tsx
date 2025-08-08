'use client';

import React, { useState } from 'react';
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
import { useGetTeacherApplicationsQuery, useGetApprovalStatsQuery } from '@/lib/redux/api/admin-api';
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
    refetch: refetchApplications,
  } = useGetTeacherApplicationsQuery(queryParams);

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useGetApprovalStatsQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case 'under_review':
        return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" />Under Review</Badge>;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Applications</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{statsData?.stats?.pending || 0}</p>
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
                <p className="text-2xl font-bold">{statsData?.stats?.approved || 0}</p>
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
                <p className="text-2xl font-bold">{statsData?.stats?.rejected || 0}</p>
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
                <p className="text-2xl font-bold">{statsData?.stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'ASC' | 'DESC')}>
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
                Pending ({statsData?.stats?.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                Under Review ({statsData?.stats?.underReview || 0})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({statsData?.stats?.approved || 0})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({statsData?.stats?.rejected || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {applicationsLoading ? (
                <div className="flex justify-center items-center py-8">
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
                      {applicationsData?.applications?.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {application.user.firstName} {application.user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {application.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {application.teacherProfile.specializations || 'Not specified'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {application.teacherProfile.yearsExperience} years
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(application.teacherProfile.submittedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(application.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={`/dashboard/admin/teacher-applications/${application.id}`}>
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
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {applicationsData && applicationsData.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
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