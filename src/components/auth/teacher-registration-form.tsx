'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-number-input';
import ReactCountryFlag from 'react-country-flag';
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
import { useUploadTeacherDocumentMutation } from '@/lib/redux/api/upload-api';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import { DegreeLevel, ExperienceLevel, DocumentType } from '@/lib/types';
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
  X,
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
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    website?: string;
  };
  education: {
    highestDegree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
    additionalCertifications?: string;
  };
  experience: {
    teachingExperience: string; // ExperienceLevel enum
    subjectAreas: string[];
    previousInstitutions?: string;
    onlineTeachingExperience: boolean;
    totalStudentsTaught?: string;
  };
  professional: {
    teachingStyle?: string;
    officeHours?: string;
    teachingLanguages?: string[];
    hourlyRate?: string;
    currency?: string;
    professionalSummary?: string;
    portfolioUrl?: string;
    licenseNumber?: string;
    affiliations?: string;
    maxStudentsPerClass?: string;
    awards?: string[];
    publications?: string[];
    interests?: string[];
    skills?: string[];
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

// Top 20 countries covering 90%+ of users
const topCountries = [
  {
    code: 'VN',
    name: 'Vietnam',
    timezone: 'Asia/Ho_Chi_Minh',
    phoneCode: '+84',
  },
  {
    code: 'US',
    name: 'United States',
    timezone: 'America/New_York',
    phoneCode: '+1',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    timezone: 'Europe/London',
    phoneCode: '+44',
  },
  { code: 'CA', name: 'Canada', timezone: 'America/Toronto', phoneCode: '+1' },
  {
    code: 'AU',
    name: 'Australia',
    timezone: 'Australia/Sydney',
    phoneCode: '+61',
  },
  { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin', phoneCode: '+49' },
  { code: 'FR', name: 'France', timezone: 'Europe/Paris', phoneCode: '+33' },
  { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo', phoneCode: '+81' },
  { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul', phoneCode: '+82' },
  { code: 'CN', name: 'China', timezone: 'Asia/Shanghai', phoneCode: '+86' },
  { code: 'IN', name: 'India', timezone: 'Asia/Kolkata', phoneCode: '+91' },
  {
    code: 'SG',
    name: 'Singapore',
    timezone: 'Asia/Singapore',
    phoneCode: '+65',
  },
  { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok', phoneCode: '+66' },
  {
    code: 'MY',
    name: 'Malaysia',
    timezone: 'Asia/Kuala_Lumpur',
    phoneCode: '+60',
  },
  { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta', phoneCode: '+62' },
  {
    code: 'PH',
    name: 'Philippines',
    timezone: 'Asia/Manila',
    phoneCode: '+63',
  },
  {
    code: 'BR',
    name: 'Brazil',
    timezone: 'America/Sao_Paulo',
    phoneCode: '+55',
  },
  {
    code: 'MX',
    name: 'Mexico',
    timezone: 'America/Mexico_City',
    phoneCode: '+52',
  },
  { code: 'IT', name: 'Italy', timezone: 'Europe/Rome', phoneCode: '+39' },
  { code: 'ES', name: 'Spain', timezone: 'Europe/Madrid', phoneCode: '+34' },
];

// Common timezones with user-friendly labels
const commonTimezones = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Vietnam (UTC+7)', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Thailand (UTC+7)', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Japan (UTC+9)', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'South Korea (UTC+9)', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'China (UTC+8)', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)', region: 'Asia' },
  {
    value: 'America/New_York',
    label: 'Eastern Time (UTC-5)',
    region: 'Americas',
  },
  {
    value: 'America/Chicago',
    label: 'Central Time (UTC-6)',
    region: 'Americas',
  },
  {
    value: 'America/Denver',
    label: 'Mountain Time (UTC-7)',
    region: 'Americas',
  },
  {
    value: 'America/Los_Angeles',
    label: 'Pacific Time (UTC-8)',
    region: 'Americas',
  },
  {
    value: 'America/Toronto',
    label: 'Eastern Canada (UTC-5)',
    region: 'Americas',
  },
  { value: 'Europe/London', label: 'London (UTC+0)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)', region: 'Europe' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10)', region: 'Oceania' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', region: 'Other' },
];

// Auto-detect user timezone and country
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

const detectUserCountry = async () => {
  try {
    // Simple IP-based detection (fallback to VN)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'VN';
  } catch {
    return 'VN'; // Default to Vietnam
  }
};

const experienceLevels = [
  { value: '0', label: '0 years' },
  { value: '1', label: '1 years' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5 years' },
  { value: '6', label: '6 years' },
  { value: '7', label: '7 years' },
  { value: '8', label: '8 years' },
  { value: '9', label: '9 years' },
  { value: '10', label: '10 years' },
  { value: '10+', label: '10+ years' },
];

export const TeacherRegistrationForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const [detectedCountry, setDetectedCountry] = useState<string>('VN');
  const [detectedTimezone] = useState<string>(getUserTimezone());
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherApplicationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'VN',
        timezone: getUserTimezone(),
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
        teachingExperience: '0',
        subjectAreas: [],
        previousInstitutions: '',
        onlineTeachingExperience: false,
        totalStudentsTaught: '',
      },
      professional: {
        teachingStyle: '',
        officeHours: '',
        teachingLanguages: [],
        hourlyRate: '',
        currency: 'USD',
        professionalSummary: '',
        portfolioUrl: '',
        licenseNumber: '',
        affiliations: '',
        maxStudentsPerClass: '',
        awards: [],
        publications: [],
        interests: [],
        skills: [],
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

  // Auto-detect user country on component mount
  useEffect(() => {
    const detectCountry = async () => {
      const country = await detectUserCountry();
      setDetectedCountry(country);

      // Update form with detected country and its default timezone
      const detectedCountryData = topCountries.find(c => c.code === country);
      if (detectedCountryData) {
        form.setValue('personalInfo.country', country);
        form.setValue('personalInfo.timezone', detectedCountryData.timezone);
      }
    };

    detectCountry();
  }, [form]);

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

  const getDocumentTypeForField = (field: string): DocumentType => {
    const mapping: Record<string, DocumentType> = {
      resume: DocumentType.RESUME,
      degree: DocumentType.DEGREE_CERTIFICATE,
      certification: DocumentType.CERTIFICATION,
      id: DocumentType.IDENTITY_DOCUMENT,
    };
    return mapping[field] || DocumentType.OTHER;
  };

  const handleFileUpload = async (field: string, file: File) => {
    try {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          'File type not supported. Please upload PDF, DOC, JPG, or PNG files only.'
        );
      }

      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      setUploadedFiles(prev => ({ ...prev, [field]: file }));

      form.setValue(`documents.${field}Uploaded` as any, true);

      toast({
        title: 'File selected successfully',
        description: `${file.name} will be uploaded during registration.`,
      });
    } catch (error: any) {
      console.error('File validation error:', error);
      toast({
        title: 'File validation failed',
        description: error.message || 'Failed to validate file',
        variant: 'destructive',
      });
    }
  };

  const uploadAllDocuments = async (userId: string): Promise<void> => {
    const uploadPromises = Object.entries(uploadedFiles).map(
      async ([field, file]) => {
        try {
          const documentType = getDocumentTypeForField(field);
          const metadata = {
            uploadedDuringRegistration: true,
            fieldName: field,
            userId,
          };

          await uploadDocument({
            file,
            documentType,
            userId,
            metadata,
          }).unwrap();

          console.log(`✅ Successfully uploaded ${field}: ${file.name}`);
        } catch (error) {
          console.error(`❌ Failed to upload ${field}:`, error);
        }
      }
    );

    await Promise.allSettled(uploadPromises);
  };

  const [applyAsTeacher, { isLoading: isSubmitting }] =
    useApplyAsTeacherMutation();
  const [uploadDocument, { isLoading: isUploading }] =
    useUploadTeacherDocumentMutation();

  const onSubmit: SubmitHandler<TeacherFormData> = async data => {
    try {
      setError(null);
      setLocalSubmitting(true);

      console.log('🚀 Submitting teacher application:', data);

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
          teachingExperience: parseInt(data.experience.teachingExperience, 10),
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
          fileMetadata: Object.entries(uploadedFiles).reduce(
            (acc, [key, file]) => {
              acc[key] = {
                originalName: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                documentType: getDocumentTypeForField(key),
              };
              return acc;
            },
            {} as Record<string, any>
          ),
          totalFiles: Object.keys(uploadedFiles).length,
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

      console.log('Id:', response.user.id);
      if (response.accessToken) {
        AdvancedTokenManager.setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || '',
          expiresIn: response.expiresIn || 900,
          tokenType: 'Bearer' as const,
        });
        console.log('🔑 Tokens stored for file uploads');
      }

      if (Object.keys(uploadedFiles).length > 0) {
        console.log('📤 Uploading documents...');
        try {
          await uploadAllDocuments(response.user.id);
          console.log('✅ All documents uploaded successfully');

          toast({
            title: 'Application submitted with documents!',
            description:
              'Your application and documents have been submitted. Please check your email to verify your account.',
          });
        } catch (error) {
          console.error('❌ Some documents failed to upload:', error);
          toast({
            title: 'Application submitted!',
            description:
              'Your application was submitted but some documents may have failed to upload. You can upload them later from your dashboard.',
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Application submitted!',
          description:
            'Please check your email to verify your account before we can review your application.',
        });
      }

      const email = encodeURIComponent(data.personalInfo.email);
      router.push(`/teacher-register/success?email=${email}`);
    } catch (error: any) {
      setLocalSubmitting(false);
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
        render={({ field }) => {
          const selectedCountryData = topCountries.find(
            c => c.code === detectedCountry
          );
          const phoneCode = selectedCountryData?.phoneCode || '+84';
          const phoneNumber = field.value.replace(/^\+\d+\s?/, '') || '';

          return (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Select
                    value={detectedCountry}
                    onValueChange={value => {
                      setDetectedCountry(value);
                      // Update form country too
                      form.setValue('personalInfo.country', value);
                      const selectedCountry = topCountries.find(
                        c => c.code === value
                      );
                      if (selectedCountry) {
                        form.setValue(
                          'personalInfo.timezone',
                          selectedCountry.timezone
                        );
                        // Update phone with new country code, keep current number
                        field.onChange(
                          `${selectedCountry.phoneCode} ${phoneNumber}`
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-[110px] shrink-0">
                      <SelectValue>
                        {selectedCountryData && (
                          <span className="flex items-center space-x-1">
                            <ReactCountryFlag
                              countryCode={selectedCountryData.code}
                              svg
                              style={{ width: '20px', height: '15px' }}
                            />
                            <span className="font-mono text-sm">
                              {selectedCountryData.phoneCode}
                            </span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {topCountries.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center space-x-2">
                            <ReactCountryFlag
                              countryCode={country.code}
                              svg
                              style={{ width: '20px', height: '15px' }}
                            />
                            <span className="font-mono text-sm">
                              {country.phoneCode}
                            </span>
                            <span className="text-sm">{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform font-mono text-sm text-muted-foreground">
                      {phoneCode}
                    </div>
                    <Input
                      placeholder="123 456 789"
                      value={phoneNumber}
                      onChange={e => {
                        const inputValue = e.target.value;
                        const numbersOnly = inputValue.replace(/\D/g, '');

                        let formattedNumber = numbersOnly;
                        if (numbersOnly.length > 3) {
                          formattedNumber = numbersOnly
                            .replace(/(\d{3})(\d{3})(\d*)/, '$1 $2 $3')
                            .trim();
                        }

                        field.onChange(`${phoneCode} ${formattedNumber}`);
                      }}
                      onKeyDown={e => {
                        if (
                          (e.key === 'Backspace' || e.key === 'Delete') &&
                          e.currentTarget.selectionStart === 0
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="flex-1 pl-16"
                      style={{ paddingLeft: `${phoneCode.length * 8 + 12}px` }}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
              <p className="mt-1 text-xs text-muted-foreground">
                Format: {phoneCode} 123 456 789
              </p>
            </FormItem>
          );
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.country"
          render={({ field }) => {
            const filteredCountries = topCountries.filter(
              country =>
                country.name
                  .toLowerCase()
                  .includes(countrySearch.toLowerCase()) ||
                country.code.toLowerCase().includes(countrySearch.toLowerCase())
            );

            return (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={value => {
                    field.onChange(value);
                    setDetectedCountry(value); // Update phone country

                    // Auto-update timezone when country changes
                    const selectedCountry = topCountries.find(
                      c => c.code === value
                    );
                    if (selectedCountry) {
                      form.setValue(
                        'personalInfo.timezone',
                        selectedCountry.timezone
                      );
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country">
                        {field.value && (
                          <span className="flex items-center space-x-2">
                            {/* <span>
                              {
                                topCountries.find(c => c.code === field.value)
                                  ?.flag
                              }
                            </span> */}
                            <ReactCountryFlag
                              countryCode={field.value}
                              svg
                              style={{ width: '20px', height: '15px' }}
                            />
                            <span>
                              {
                                topCountries.find(c => c.code === field.value)
                                  ?.name
                              }
                            </span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-48">
                    <div className="px-2 py-1.5">
                      <Input
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="my-1 border-t border-border"></div>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center space-x-2">
                            <ReactCountryFlag
                              countryCode={country.code}
                              svg
                              style={{ width: '20px', height: '15px' }}
                            />
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No countries found. Try a different search term.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {!topCountries.find(c => c.code === detectedCountry) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Don't see your country? Contact support for additional
                    options.
                  </p>
                )}
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="personalInfo.timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48">
                  {commonTimezones.map((tz, index) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      <span className="flex w-full items-center justify-between">
                        <span>{tz.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {tz.region}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              <p className="mt-1 text-xs text-muted-foreground">
                Detected: {detectedTimezone}
                {detectedTimezone !== field.value &&
                  ' (Auto-updated based on country)'}
              </p>
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
            <FormLabel>Teaching Experience Level</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {experienceLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

  const renderProfessional = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="professional.teachingStyle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teaching Style</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your teaching style and methodology..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="professional.hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 25" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professional.currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="professional.officeHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Office Hours</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Mon-Fri 9AM-5PM EST" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="professional.maxStudentsPerClass"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Students Per Class</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 20" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="professional.professionalSummary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Summary</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief summary of your professional background and expertise..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="professional.portfolioUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Portfolio/Website URL</FormLabel>
            <FormControl>
              <Input placeholder="https://yourportfolio.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="professional.licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teaching License Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="License number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professional.affiliations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Affiliations</FormLabel>
              <FormControl>
                <Input placeholder="e.g., NEA, IEEE, ACM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Please upload the following documents. All files should be in PDF,
          DOC, JPG, or PNG format and under 10MB. Documents will be uploaded
          automatically when you submit your application.
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
                  input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleFileUpload(doc.key, file);
                    }
                  };
                  input.click();
                }}
                disabled={isUploading || isSubmitting || localSubmitting}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadedFiles[doc.key] ? 'Change File' : 'Choose File'}
              </Button>
              {uploadedFiles[doc.key] && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{uploadedFiles[doc.key].name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newFiles = { ...uploadedFiles };
                      delete newFiles[doc.key];
                      setUploadedFiles(newFiles);
                      form.setValue(
                        `documents.${doc.key}Uploaded` as any,
                        false
                      );
                    }}
                    disabled={isUploading || isSubmitting || localSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
          {(isSubmitting || localSubmitting) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>
                    <h3 className="font-medium">Submitting Application</h3>
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(uploadedFiles).length > 0
                        ? 'Processing application and uploading documents...'
                        : 'Please wait while we process your application...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <Button
                type="submit"
                disabled={isSubmitting || localSubmitting}
                className="min-w-[160px]"
              >
                {isSubmitting || localSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
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
