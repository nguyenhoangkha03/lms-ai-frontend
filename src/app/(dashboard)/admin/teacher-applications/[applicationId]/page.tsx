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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  useGetTeacherApplicationQuery,
  useApproveTeacherMutation,
  useRequestMoreInfoMutation,
} from '@/lib/redux/api/admin-api';
import { useGetTeacherDocumentsQuery } from '@/lib/redux/api/upload-api';
import { useToast } from '@/hooks/use-toast';

export default function TeacherApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicationId = params.applicationId as string;

  const [approvalNotes, setApprovalNotes] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);

  const {
    data: applicationData,
    isLoading,
    refetch,
  } = useGetTeacherApplicationQuery(applicationId);

  const [approveTeacher] = useApproveTeacherMutation();
  const [requestMoreInfo] = useRequestMoreInfoMutation();

  const application = applicationData?.application;

  const handleApprove = async (isApproved: boolean) => {
    try {
      await approveTeacher({
        applicationId,
        approval: {
          isApproved,
          notes: approvalNotes,
        },
      }).unwrap();

      toast({
        title: 'Success',
        description: `Application ${isApproved ? 'approved' : 'rejected'} successfully`,
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
    try {
      await requestMoreInfo({
        applicationId,
        request: {
          message: requestMessage,
          requiredDocuments,
        },
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Information request sent to teacher',
      });

      setRequestMessage('');
      setRequiredDocuments([]);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send information request',
        variant: 'destructive',
      });
    }
  };

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

  if (!application) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Application Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              The teacher application you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applicationDataDetails = application.teacherProfile.applicationData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {application.user.firstName} {application.user.lastName}
            </h1>
            <p className="text-muted-foreground">
              Teacher Application Review
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(application.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="motivation">Motivation</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

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
                      <p>{applicationDataDetails?.personalInfo?.firstName}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Last Name</Label>
                      <p>{applicationDataDetails?.personalInfo?.lastName}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Email</Label>
                      <p>{applicationDataDetails?.personalInfo?.email}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Phone</Label>
                      <p>{applicationDataDetails?.personalInfo?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Country</Label>
                      <p>{applicationDataDetails?.personalInfo?.country || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Timezone</Label>
                      <p>{applicationDataDetails?.personalInfo?.timezone || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Educational Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Highest Degree</Label>
                      <p className="capitalize">{applicationDataDetails?.education?.highestDegree}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Field of Study</Label>
                      <p>{applicationDataDetails?.education?.fieldOfStudy}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Institution</Label>
                      <p>{applicationDataDetails?.education?.institution}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Graduation Year</Label>
                      <p>{applicationDataDetails?.education?.graduationYear}</p>
                    </div>
                  </div>
                  
                  {applicationDataDetails?.education?.additionalCertifications && (
                    <div>
                      <Label className="font-semibold">Additional Certifications</Label>
                      <p>{applicationDataDetails.education.additionalCertifications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Teaching Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Experience Level</Label>
                      <p className="capitalize">{applicationDataDetails?.experience?.teachingExperience}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Online Teaching</Label>
                      <p>{applicationDataDetails?.experience?.onlineTeachingExperience ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold">Subject Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {applicationDataDetails?.experience?.subjectAreas?.map((subject: string, index: number) => (
                        <Badge key={index} variant="outline">{subject}</Badge>
                      ))}
                    </div>
                  </div>

                  {applicationDataDetails?.experience?.previousInstitutions && (
                    <div>
                      <Label className="font-semibold">Previous Institutions</Label>
                      <p>{applicationDataDetails.experience.previousInstitutions}</p>
                    </div>
                  )}

                  {applicationDataDetails?.experience?.totalStudentsTaught && (
                    <div>
                      <Label className="font-semibold">Total Students Taught</Label>
                      <p>{applicationDataDetails.experience.totalStudentsTaught}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="motivation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Motivation & Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-semibold">Why Do You Want to Teach?</Label>
                    <ScrollArea className="h-24 w-full rounded-md border p-3 mt-1">
                      <p className="text-sm">{applicationDataDetails?.motivation?.whyTeach}</p>
                    </ScrollArea>
                  </div>

                  <div>
                    <Label className="font-semibold">Teaching Philosophy</Label>
                    <ScrollArea className="h-24 w-full rounded-md border p-3 mt-1">
                      <p className="text-sm">{applicationDataDetails?.motivation?.teachingPhilosophy}</p>
                    </ScrollArea>
                  </div>

                  {applicationDataDetails?.motivation?.specialSkills && (
                    <div>
                      <Label className="font-semibold">Special Skills</Label>
                      <p>{applicationDataDetails.motivation.specialSkills}</p>
                    </div>
                  )}

                  {applicationDataDetails?.motivation?.courseIdeas && (
                    <div>
                      <Label className="font-semibold">Course Ideas</Label>
                      <ScrollArea className="h-20 w-full rounded-md border p-3 mt-1">
                        <p className="text-sm">{applicationDataDetails.motivation.courseIdeas}</p>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="text-sm">Resume/CV</span>
                      </div>
                      {applicationDataDetails?.documents?.resumeUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="text-sm">Degree Certificate</span>
                      </div>
                      {applicationDataDetails?.documents?.degreeUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="text-sm">ID Document</span>
                      </div>
                      {applicationDataDetails?.documents?.idUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="text-sm">Certifications</span>
                      </div>
                      {applicationDataDetails?.documents?.certificationUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
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
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Teacher Code</Label>
                <p className="font-mono text-sm">{application.teacherProfile.teacherCode}</p>
              </div>

              <div>
                <Label className="font-semibold">Submitted</Label>
                <p className="text-sm">{formatDate(application.teacherProfile.submittedAt)}</p>
              </div>

              {application.reviewedAt && (
                <div>
                  <Label className="font-semibold">Reviewed</Label>
                  <p className="text-sm">{formatDate(application.reviewedAt)}</p>
                </div>
              )}

              {application.reviewNotes && (
                <div>
                  <Label className="font-semibold">Review Notes</Label>
                  <ScrollArea className="h-20 w-full rounded-md border p-3 mt-1">
                    <p className="text-sm">{application.reviewNotes}</p>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {application.status === 'pending' && (
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
                    onChange={(e) => setApprovalNotes(e.target.value)}
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
                          onChange={(e) => setRequestMessage(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Required Documents (optional)</Label>
                        <Input
                          placeholder="Enter document names separated by commas"
                          onChange={(e) => setRequiredDocuments(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        />
                      </div>

                      <Button onClick={handleRequestMoreInfo} className="w-full">
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
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