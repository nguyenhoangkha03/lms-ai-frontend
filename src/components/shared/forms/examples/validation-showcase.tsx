'use client';

import React from 'react';
import { BaseForm } from '@/components/forms/base-form';
import { FormSection } from '@/components/forms/form-section';
import { FormGrid } from '@/components/forms/form-grid';
import { FormInput } from '@/components/ui/form-fields/form-input';
import { FormSelect } from '@/components/ui/form-fields/form-select';
import { FormRadioGroup } from '@/components/ui/form-fields/form-radio-group';
import { FormDatePicker } from '@/components/ui/form-fields/form-date-picker';
import { FormFileUpload } from '@/components/ui/form-fields/form-file-upload';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import { useFormValidation } from '@/hooks/use-form-validation';
import {
  studentProfileSchema,
  type StudentProfileFormData,
} from '@/lib/validations/user-schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormFieldWrapper } from '../form-field-wrapper';

export function ValidationShowcase() {
  const form = useFormWithSchema({
    schema: studentProfileSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: undefined,
      bio: '',
      website: '',
      location: '',
      timezone: '',
      language: '',
      interests: [],
      learningGoals: [],
      experienceLevel: undefined,
      preferredLearningStyle: undefined,
    },
  });

  const validation = useFormValidation(form);

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Some experience',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Extensive experience',
    },
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual' },
    { value: 'auditory', label: 'Auditory' },
    { value: 'kinesthetic', label: 'Kinesthetic' },
    { value: 'reading', label: 'Reading/Writing' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London Time' },
    { value: 'Asia/Tokyo', label: 'Tokyo Time' },
  ];

  const handleSubmit = async (data: StudentProfileFormData) => {
    console.log('Form submitted:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Form Validation Showcase</h2>
        <p className="text-muted-foreground">
          Comprehensive form with various field types and validation rules.
        </p>

        {/* Validation Status */}
        <div className="flex gap-2">
          <Badge
            variant={validation.hasAnyErrors() ? 'destructive' : 'secondary'}
          >
            {validation.hasAnyErrors() ? 'Has Errors' : 'Valid'}
          </Badge>
          <Badge variant="outline">
            {Object.keys(form.formState.errors).length} Error(s)
          </Badge>
          <Badge variant="outline">
            Touched: {Object.keys(form.formState.touchedFields).length}
          </Badge>
        </div>
      </div>

      <BaseForm form={form} onSubmit={handleSubmit} submitText="Save Profile">
        <FormSection
          title="Personal Information"
          description="Basic information about yourself"
          variant="card"
          required
        >
          <FormGrid columns={2}>
            <FormFieldWrapper
              form={form}
              name="firstName"
              label="First Name"
              required
            >
              {field => (
                <FormInput {...field} placeholder="Enter your first name" />
              )}
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="lastName"
              label="Last Name"
              required
            >
              {field => (
                <FormInput {...field} placeholder="Enter your last name" />
              )}
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="email"
              label="Email Address"
              required
            >
              {field => (
                <FormInput
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                />
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="phone" label="Phone Number">
              {field => (
                <FormInput
                  {...field}
                  type="tel"
                  placeholder="Enter your phone number"
                />
              )}
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="dateOfBirth"
              label="Date of Birth"
            >
              {field => (
                <FormDatePicker
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="Select your birth date"
                  toDate={new Date()}
                />
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="timezone" label="Timezone">
              {field => (
                <FormSelect
                  {...field}
                  placeholder="Select timezone"
                  options={timezones}
                />
              )}
            </FormFieldWrapper>
          </FormGrid>
        </FormSection>

        <FormSection
          title="Learning Preferences"
          description="Help us customize your learning experience"
          variant="card"
        >
          <FormGrid columns={1} gap="lg">
            <FormFieldWrapper
              form={form}
              name="experienceLevel"
              label="Experience Level"
              description="What's your overall experience level?"
            >
              {field => (
                <FormRadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  options={experienceLevels}
                />
              )}
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="preferredLearningStyle"
              label="Preferred Learning Style"
              description="How do you learn best?"
            >
              {field => (
                <FormRadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  options={learningStyles}
                  orientation="horizontal"
                />
              )}
            </FormFieldWrapper>
          </FormGrid>
        </FormSection>

        <FormSection
          title="Profile Media"
          description="Upload your profile picture"
          variant="card"
        >
          <FormFieldWrapper
            form={form}
            name="bio"
            label="Profile Picture"
            description="Upload a profile picture (max 5MB)"
          >
            {field => (
              <FormFileUpload
                accept="image/*"
                maxSize={5}
                variant="dropzone"
                onFileChange={files => {
                  if (files && files.length > 0) {
                    field.onChange(files[0]);
                  }
                }}
              />
            )}
          </FormFieldWrapper>
        </FormSection>

        {/* Validation Controls */}
        <FormSection title="Validation Controls" variant="card">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validation.validateAllFields()}
            >
              Validate All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validation.validateField('email')}
            >
              Validate Email
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.clearErrors()}
            >
              Clear Errors
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.reset()}
            >
              Reset Form
            </Button>
          </div>
        </FormSection>
      </BaseForm>
    </div>
  );
}
