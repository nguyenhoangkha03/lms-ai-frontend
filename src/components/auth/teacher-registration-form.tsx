'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { teacherApplicationSchema } from '@/lib/validations/auth-schemas';
import { useApplyAsTeacherMutation } from '@/lib/redux/api/auth-api';
import { DegreeLevel, ExperienceLevel } from '@/lib/types';
import {
  User,
  Mail,
  Phone,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface TeacherFormData extends FieldValues {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    timezone: string;
    password: string;
    confirmPassword: string;
  };
  education: {
    highestDegree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
    additionalCertifications?: string;
  };
  experience: {
    teachingExperience: number;
    subjectAreas: string[];
    previousInstitutions?: string;
    onlineTeachingExperience: boolean;
    totalStudentsTaught?: string;
  };
  motivation: {
    whyTeach: string;
    teachingPhilosophy: string;
    specialSkills?: string;
    courseIdeas?: string;
  };
  availability: {
    hoursPerWeek?: string;
    preferredSchedule?: string[];
    startDate?: string;
  };
  documents: {
    resumeUploaded: boolean;
    degreeUploaded: boolean;
    certificationUploaded?: boolean;
    idUploaded: boolean;
  };
  agreements: {
    termsAccepted: boolean;
    backgroundCheckConsent: boolean;
    communicationConsent: boolean;
  };
}

const steps = [
  {
    id: 'personal',
    title: 'Personal Info',
    description: 'Basic contact details',
  },
  { id: 'education', title: 'Education', description: 'Your qualifications' },
  { id: 'teaching', title: 'Teaching', description: 'Your expertise' },
  { id: 'documents', title: 'Documents', description: 'Required files' },
  { id: 'review', title: 'Review', description: 'Final review' },
];

const subjectAreas = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Programming',
  'Data Science',
  'AI/Machine Learning',
  'Web Development',
  'Business',
  'Marketing',
  'Languages',
  'Literature',
  'History',
  'Psychology',
  'Art & Design',
  'Music',
  'Engineering',
  'Other',
];

const experienceLevels = [
  { value: 'entry', label: '0-2 years' },
  { value: 'intermediate', label: '3-5 years' },
  { value: 'experienced', label: '6-10 years' },
  { value: 'expert', label: '10+ years' },
];

export const TeacherRegistrationForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>(
    {}
  );

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherApplicationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        timezone: '',
        password: '',
        confirmPassword: '',
      },
      education: {
        highestDegree: '',
        fieldOfStudy: '',
        institution: '',
        graduationYear: '',
        additionalCertifications: '',
      },
      experience: {
        teachingExperience: 0,
        subjectAreas: [],
        previousInstitutions: '',
        onlineTeachingExperience: false,
        totalStudentsTaught: '',
      },
      motivation: {
        whyTeach: '',
        teachingPhilosophy: '',
        specialSkills: '',
        courseIdeas: '',
      },
      availability: {
        hoursPerWeek: '',
        preferredSchedule: [],
        startDate: '',
      },
      documents: {
        resumeUploaded: false,
        degreeUploaded: false,
        certificationUploaded: false,
        idUploaded: false,
      },
      agreements: {
        termsAccepted: false,
        backgroundCheckConsent: false,
        communicationConsent: true,
      },
    },
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (field: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [field]: file }));
    form.setValue(`documents.${field}Uploaded` as any, true);
    toast({
      title: 'File uploaded successfully',
      description: `${file.name} has been uploaded.`,
    });
  };

  const [applyAsTeacher, { isLoading: isSubmitting }] =
    useApplyAsTeacherMutation();

  const onSubmit: SubmitHandler<TeacherFormData> = async data => {
    try {
      setError(null);

      console.log('🚀 Submitting teacher application:', data);
      alert('🔍 DEBUG: About to call useApplyAsTeacherMutation');

      const backendData = {
        personalInfo: {
          firstName: data.personalInfo.firstName,
          lastName: data.personalInfo.lastName,
          email: data.personalInfo.email,
          phone: data.personalInfo.phone,
          country: data.personalInfo.country,
          timezone: data.personalInfo.timezone,
        },
        education: {
          highestDegree: data.education.highestDegree as DegreeLevel,
          fieldOfStudy: data.education.fieldOfStudy,
          institution: data.education.institution,
          graduationYear: parseInt(data.education.graduationYear, 10),
          additionalCertifications: data.education.additionalCertifications,
        },
        experience: {
          teachingExperience: data.experience.teachingExperience,
          subjectAreas: data.experience.subjectAreas,
          previousInstitutions: data.experience.previousInstitutions,
          onlineTeachingExperience: data.experience.onlineTeachingExperience,
          totalStudentsTaught: data.experience.totalStudentsTaught,
        },
        motivation: {
          whyTeach: data.motivation.whyTeach,
          teachingPhilosophy: data.motivation.teachingPhilosophy,
          specialSkills: data.motivation.specialSkills,
          courseIdeas: data.motivation.courseIdeas,
        },
        availability: data.availability || {
          hoursPerWeek: '',
          preferredSchedule: [],
          startDate: '',
        },
        documents: {
          resumeUploaded: data.documents.resumeUploaded,
          degreeUploaded: data.documents.degreeUploaded,
          certificationUploaded: data.documents.certificationUploaded || false,
          idUploaded: data.documents.idUploaded,
        },
        agreements: {
          termsAccepted: data.agreements.termsAccepted,
          backgroundCheckConsent: data.agreements.backgroundCheckConsent,
          communicationConsent: data.agreements.communicationConsent,
        },
        password: data.personalInfo.password,
      };

      console.log('📤 Transformed data for backend:', backendData);

      const response = await applyAsTeacher(backendData).unwrap();

      console.log('✅ Application submitted successfully:', response);

      toast({
        title: 'Application submitted!',
        description:
          'Please check your email to verify your account before we can review your application.',
      });

      const email = encodeURIComponent(data.personalInfo.email);
      router.push(`/teacher-register/success?email=${email}`);
    } catch (error: any) {
      console.error('❌ Application submission failed:', error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Application submission failed';
      setError(errorMessage);
      toast({
        title: 'Submission failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="John" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personalInfo.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Doe" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="personalInfo.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="pl-9"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="personalInfo.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="+1 (555) 123-4567"
                  className="pl-9"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personalInfo.timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                  <SelectItem value="CST">Central (CST)</SelectItem>
                  <SelectItem value="MST">Mountain (MST)</SelectItem>
                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                  <SelectItem value="CET">Central European (CET)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personalInfo.confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="education.highestDegree"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Highest Degree</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your highest degree" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="associate">Associate Degree</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD/Doctorate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="education.fieldOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="education.graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2020" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="education.institution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Institution</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Stanford University" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="experience.teachingExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teaching Experience</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderTeaching = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="experience.subjectAreas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject Areas</FormLabel>
            <FormDescription>
              Select the subjects you're qualified to teach
            </FormDescription>
            <FormControl>
              <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
                {subjectAreas.map(subject => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={field.value?.includes(subject)}
                      onCheckedChange={checked => {
                        const currentAreas = field.value || [];
                        if (checked) {
                          field.onChange([...currentAreas, subject]);
                        } else {
                          field.onChange(
                            currentAreas.filter(
                              (area: string) => area !== subject
                            )
                          );
                        }
                      }}
                    />
                    <label htmlFor={subject} className="text-sm">
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="motivation.whyTeach"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Why do you want to teach on our platform?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Share your motivation for teaching..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="motivation.teachingPhilosophy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teaching Philosophy</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your approach to teaching..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Please upload the following documents. All files should be in PDF
          format and under 5MB.
        </AlertDescription>
      </Alert>

      {[
        { key: 'resume', label: 'Resume/CV', required: true },
        { key: 'degree', label: 'Degree Certificate', required: true },
        {
          key: 'certification',
          label: 'Teaching Certifications',
          required: false,
        },
        { key: 'id', label: 'Government ID', required: true },
      ].map(doc => (
        <Card key={doc.key}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {doc.label}
              {doc.required && <Badge variant="destructive">Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleFileUpload(doc.key, file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              {uploadedFiles[doc.key] && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {uploadedFiles[doc.key].name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please review your information before submitting.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Name:</strong> {form.getValues('personalInfo.firstName')}{' '}
              {form.getValues('personalInfo.lastName')}
            </p>
            <p>
              <strong>Email:</strong> {form.getValues('personalInfo.email')}
            </p>
            <p>
              <strong>Phone:</strong> {form.getValues('personalInfo.phone')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Degree:</strong>{' '}
              {form.getValues('education.highestDegree')}
            </p>
            <p>
              <strong>Field:</strong> {form.getValues('education.fieldOfStudy')}
            </p>
            <p>
              <strong>Institution:</strong>{' '}
              {form.getValues('education.institution')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="agreements.termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the Terms of Service and Instructor Agreement
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreements.backgroundCheckConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I consent to a background check</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderEducation();
      case 2:
        return renderTeaching();
      case 3:
        return renderDocuments();
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{steps[currentStep].title}</span>
          <span className="text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          {steps[currentStep].description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Application
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
