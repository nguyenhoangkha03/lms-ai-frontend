'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  Heart,
  Calendar,
  FileText,
  Download,
  Mail,
  MessageSquare,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  useGetUserByIdQuery,
  useUpdateTeacherProfileMutation,
} from '@/lib/redux/api/admin-api';
import { useToast } from '@/hooks/use-toast';

export default function TeacherApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.id as string;

  const [approvalNotes, setApprovalNotes] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);

  const { data: userData, isLoading, refetch } = useGetUserByIdQuery(userId);

  const [updateTeacherProfile] = useUpdateTeacherProfileMutation();

  const user = userData;
  const teacherProfile = user?.profile; // Backend returns teacherProfile as 'profile'

  console.log('User data:', userData);

  const handleApprove = async (isApproved: boolean) => {
    try {
      await updateTeacherProfile({
        userId,
        data: {
          isApproved,
          approvedBy: 'admin', // In real app, use actual admin ID
          approvalNotes,
        },
      }).unwrap();

      toast({
        title: 'Success',
        description: `Application ${isApproved ? 'approved' : 'pending'} successfully`,
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process application',
        variant: 'destructive',
      });
    }
  };

  const handleRequestMoreInfo = async () => {
    // TODO: Implement request more info functionality
    toast({
      title: 'Info',
      description: 'Request more info functionality not implemented yet',
    });
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">
              Application Not Found
            </h2>
            <p className="mb-4 text-muted-foreground">
              The teacher application you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus =
    teacherProfile?.isApproved === true
      ? 'approved'
      : teacherProfile?.isApproved === false
        ? 'pending'
        : 'pending';

  const documents = teacherProfile?.applicationData?.documents || [];
  const educationData = teacherProfile?.applicationData?.education;
  const experienceData = teacherProfile?.applicationData?.experience;
  const motivationData = teacherProfile?.applicationData?.motivation;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-muted-foreground">Teacher Application Review</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusBadge(currentStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">First Name</Label>
                      <p>{user?.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Last Name</Label>
                      <p>{user?.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Email</Label>
                      <p>{user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Phone</Label>
                      <p>{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">User Type</Label>
                      <p className="capitalize">{user?.userType || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Account Status</Label>
                      <Badge
                        variant={
                          user?.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {user?.status || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-semibold">Email Verified</Label>
                      <Badge
                        variant={
                          user?.emailVerified ? 'default' : 'destructive'
                        }
                      >
                        {user?.emailVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-semibold">Registration Date</Label>
                      <p>{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>

                  {/* Teacher Profile Basic Info */}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Teacher Code</Label>
                      <p className="font-mono">
                        {teacherProfile?.teacherCode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Application Date</Label>
                      <p>
                        {teacherProfile?.applicationDate
                          ? formatDate(teacherProfile.applicationDate)
                          : formatDate(teacherProfile?.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Educational Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {educationData ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold">
                            Highest Degree
                          </Label>
                          <p className="capitalize">
                            {educationData.highestDegree || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <Label className="font-semibold">
                            Field of Study
                          </Label>
                          <p>{educationData.fieldOfStudy || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Institution</Label>
                          <p>{educationData.institution || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">
                            Graduation Year
                          </Label>
                          <p>{educationData.graduationYear || 'N/A'}</p>
                        </div>
                      </div>

                      {educationData.additionalCertifications && (
                        <div>
                          <Label className="font-semibold">
                            Additional Certifications
                          </Label>
                          <p>{educationData.additionalCertifications}</p>
                        </div>
                      )}

                      <div>
                        <Label className="font-semibold">
                          Qualifications (Profile)
                        </Label>
                        <p>
                          {teacherProfile?.qualifications || 'Not specified'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      No education data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Teaching Experience & Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">
                        Years of Experience
                      </Label>
                      <p>
                        {teacherProfile?.yearsExperience ||
                          experienceData?.teachingExperience ||
                          '0'}{' '}
                        years
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">
                        Online Teaching Experience
                      </Label>
                      <Badge
                        variant={
                          experienceData?.onlineTeachingExperience
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {experienceData?.onlineTeachingExperience
                          ? 'Yes'
                          : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {/* Subject Areas */}
                  <div>
                    <Label className="font-semibold">Subject Areas</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {experienceData?.subjectAreas?.length ? (
                        experienceData.subjectAreas.map((subject, index) => (
                          <Badge key={index} variant="outline">
                            {subject}
                          </Badge>
                        ))
                      ) : teacherProfile?.subjects?.length ? (
                        teacherProfile.subjects.map((subject, index) => (
                          <Badge key={index} variant="outline">
                            {subject}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          No subjects specified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <Label className="font-semibold">Specializations</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {teacherProfile?.specializations ? (
                        teacherProfile.specializations
                          .split(',')
                          .map((spec, index) => (
                            <Badge key={index} variant="secondary">
                              {spec.trim()}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-muted-foreground">
                          No specializations listed
                        </span>
                      )}
                    </div>
                  </div>

                  {experienceData?.totalStudentsTaught && (
                    <div>
                      <Label className="font-semibold">
                        Total Students Taught
                      </Label>
                      <p>{experienceData.totalStudentsTaught}</p>
                    </div>
                  )}

                  {experienceData?.previousInstitutions && (
                    <div>
                      <Label className="font-semibold">
                        Previous Institutions
                      </Label>
                      <p>{experienceData.previousInstitutions}</p>
                    </div>
                  )}

                  <div>
                    <Label className="font-semibold">Teaching Style</Label>
                    <p>{teacherProfile?.teachingStyle || 'Not specified'}</p>
                  </div>

                  {/* Current Stats */}
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="font-semibold">Total Students</Label>
                      <p>{teacherProfile?.totalStudents || 0}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Total Courses</Label>
                      <p>{teacherProfile?.totalCourses || 0}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Rating</Label>
                      <p>
                        {teacherProfile?.rating || 0}/5 (
                        {teacherProfile?.totalRatings || 0} reviews)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivation & Philosophy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Motivation & Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {motivationData ? (
                    <>
                      <div>
                        <Label className="font-semibold">
                          Why Do You Want to Teach?
                        </Label>
                        <ScrollArea className="mt-2 h-24 w-full rounded-md border p-3">
                          <p className="text-sm">
                            {motivationData.whyTeach || 'Not provided'}
                          </p>
                        </ScrollArea>
                      </div>

                      <div>
                        <Label className="font-semibold">
                          Teaching Philosophy
                        </Label>
                        <ScrollArea className="mt-2 h-24 w-full rounded-md border p-3">
                          <p className="text-sm">
                            {motivationData.teachingPhilosophy ||
                              'Not provided'}
                          </p>
                        </ScrollArea>
                      </div>

                      {motivationData.specialSkills && (
                        <div>
                          <Label className="font-semibold">
                            Special Skills
                          </Label>
                          <p className="text-sm">
                            {motivationData.specialSkills}
                          </p>
                        </div>
                      )}

                      {motivationData.courseIdeas && (
                        <div>
                          <Label className="font-semibold">Course Ideas</Label>
                          <ScrollArea className="mt-2 h-20 w-full rounded-md border p-3">
                            <p className="text-sm">
                              {motivationData.courseIdeas}
                            </p>
                          </ScrollArea>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      No motivation data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Submitted Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.length > 0 ? (
                      documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.originalName}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {doc.documentType.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {(doc.size / 1024).toFixed(1)} KB
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {doc.mimeType.split('/')[1].toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={doc.isVerified ? 'default' : 'secondary'}
                            >
                              {doc.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-8 text-center text-muted-foreground">
                        No documents submitted
                      </p>
                    )}
                  </div>

                  {/* Document Summary */}
                  {documents.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Resume/CV:</span>
                          <span
                            className={
                              documents.some(d => d.documentType === 'resume')
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {documents.some(d => d.documentType === 'resume')
                              ? 'Submitted'
                              : 'Missing'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Degree Certificate:</span>
                          <span
                            className={
                              documents.some(
                                d => d.documentType === 'degree_certificate'
                              )
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {documents.some(
                              d => d.documentType === 'degree_certificate'
                            )
                              ? 'Submitted'
                              : 'Missing'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ID Document:</span>
                          <span
                            className={
                              documents.some(
                                d => d.documentType === 'identity_document'
                              )
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {documents.some(
                              d => d.documentType === 'identity_document'
                            )
                              ? 'Submitted'
                              : 'Missing'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Certifications:</span>
                          <span
                            className={
                              documents.some(
                                d => d.documentType === 'certification'
                              )
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }
                          >
                            {documents.some(
                              d => d.documentType === 'certification'
                            )
                              ? 'Submitted'
                              : 'Optional'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Current Status</Label>
                <div className="mt-1">{getStatusBadge(currentStatus)}</div>
              </div>

              <div>
                <Label className="font-semibold">Teacher Code</Label>
                <p className="font-mono text-sm">
                  {teacherProfile?.teacherCode || 'N/A'}
                </p>
              </div>

              <div>
                <Label className="font-semibold">Application Submitted</Label>
                <p className="text-sm">
                  {teacherProfile?.applicationData?.submittedAt
                    ? formatDate(teacherProfile.applicationData.submittedAt)
                    : formatDate(teacherProfile?.createdAt || user?.createdAt)}
                </p>
              </div>

              {teacherProfile?.approvedBy && (
                <>
                  <div>
                    <Label className="font-semibold">Reviewed By</Label>
                    <p className="text-sm">{teacherProfile.approvedBy}</p>
                  </div>
                  {teacherProfile?.approvedAt && (
                    <div>
                      <Label className="font-semibold">Review Date</Label>
                      <p className="text-sm">
                        {formatDate(teacherProfile.approvedAt)}
                      </p>
                    </div>
                  )}
                </>
              )}

              {teacherProfile?.approvalNotes && (
                <div>
                  <Label className="font-semibold">Review Notes</Label>
                  <ScrollArea className="mt-1 h-20 w-full rounded-md border p-3">
                    <p className="text-sm">{teacherProfile.approvalNotes}</p>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {currentStatus === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add your review notes..."
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleApprove(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApprove(false)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>

                <Separator />

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Request More Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Additional Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="What additional information do you need?"
                          value={requestMessage}
                          onChange={e => setRequestMessage(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Required Documents (optional)</Label>
                        <Input
                          placeholder="Enter document names separated by commas"
                          onChange={e =>
                            setRequiredDocuments(
                              e.target.value
                                .split(',')
                                .map(s => s.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </div>

                      <Button
                        onClick={handleRequestMoreInfo}
                        className="w-full"
                      >
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Application Metadata */}
          {teacherProfile?.applicationData?.applicationMetadata && (
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="font-mono">
                    {teacherProfile.applicationData.applicationMetadata.source}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IP Address:</span>
                  <span className="font-mono">
                    {
                      teacherProfile.applicationData.applicationMetadata
                        .ipAddress
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = `mailto:${user?.email}`)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
