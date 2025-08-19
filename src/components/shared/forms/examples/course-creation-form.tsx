'use client';

import React from 'react';
import { MultiStepForm } from '@/components/forms/multi-step-form';
import { FormSection } from '@/components/forms/form-section';
import { FormGrid } from '@/components/forms/form-grid';
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper';
import { FormInput } from '@/components/ui/form-fields/form-input';
import { FormTextarea } from '@/components/ui/form-fields/form-textarea';
import { FormSelect } from '@/components/ui/form-fields/form-select';
import { FormFileUpload } from '@/components/ui/form-fields/form-file-upload';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import {
  courseSchema,
  type CourseFormData,
} from '@/lib/validations/course-schemas';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';

// Step component props interface
interface StepComponentProps {
  form: UseFormReturn<CourseFormData>;
}

// Step 1: Basic Information
const BasicInfoStep: React.FC<StepComponentProps> = ({ form }) => {
  const categories = [
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'fr', label: 'French' },
  ];

  return (
    <FormSection
      title="Course Information"
      description="Provide basic information about your course"
      variant="card"
    >
      <FormGrid columns={1} gap="lg">
        <FormFieldWrapper
          form={form}
          name="title"
          label="Course Title"
          description="Choose a clear, descriptive title for your course"
          required
        >
          {field => (
            <FormInput
              {...field}
              placeholder="e.g., Complete Web Development Bootcamp"
            />
          )}
        </FormFieldWrapper>

        <FormFieldWrapper
          form={form}
          name="shortDescription"
          label="Short Description"
          description="Brief summary that appears in course listings"
          required
        >
          {field => (
            <FormTextarea
              {...field}
              placeholder="A concise description of what students will learn"
              rows={3}
            />
          )}
        </FormFieldWrapper>

        <FormFieldWrapper
          form={form}
          name="description"
          label="Full Description"
          description="Detailed description of the course content and objectives"
          required
        >
          {field => (
            <FormTextarea
              {...field}
              placeholder="Provide a comprehensive description of your course..."
              rows={6}
            />
          )}
        </FormFieldWrapper>

        <FormGrid columns={3}>
          <FormFieldWrapper
            form={form}
            name="categoryId"
            label="Category"
            required
          >
            {field => (
              <FormSelect
                {...field}
                placeholder="Select category"
                options={categories}
              />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper form={form} name="level" label="Difficulty Level">
            {field => (
              <FormSelect
                {...field}
                placeholder="Select level"
                options={levels}
              />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper
            form={form}
            name="language"
            label="Language"
            required
          >
            {field => (
              <FormSelect
                {...field}
                placeholder="Select language"
                options={languages}
              />
            )}
          </FormFieldWrapper>
        </FormGrid>
      </FormGrid>
    </FormSection>
  );
};

// Step 2: Media and Pricing
const MediaPricingStep: React.FC<StepComponentProps> = ({ form }) => {
  return (
    <FormSection
      title="Media & Pricing"
      description="Upload course media and set pricing"
      variant="card"
    >
      <FormGrid columns={1} gap="lg">
        <FormFieldWrapper
          form={form}
          name="thumbnail"
          label="Course Thumbnail"
          description="Upload an attractive thumbnail image (1280x720 recommended)"
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

        <FormFieldWrapper
          form={form}
          name="previewVideo"
          label="Preview Video"
          description="Upload a short preview video (optional, max 100MB)"
        >
          {field => (
            <FormFileUpload
              accept="video/*"
              maxSize={100}
              variant="dropzone"
              onFileChange={files => {
                if (files && files.length > 0) {
                  field.onChange(files[0]);
                }
              }}
            />
          )}
        </FormFieldWrapper>

        <FormGrid columns={2}>
          <FormFieldWrapper
            form={form}
            name="price"
            label="Course Price"
            description="Set to 0 for free courses"
            required
          >
            {field => (
              <FormInput
                {...field}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
              />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper
            form={form}
            name="duration"
            label="Total Duration (hours)"
            description="Estimated total course duration"
            required
          >
            {field => (
              <FormInput
                {...field}
                type="number"
                min="1"
                placeholder="10"
                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
              />
            )}
          </FormFieldWrapper>
        </FormGrid>
      </FormGrid>
    </FormSection>
  );
};

// Step 3: Learning Objectives
const ObjectivesStep: React.FC<StepComponentProps> = ({ form }) => {
  const [objectives, setObjectives] = React.useState<string[]>(['']);
  const [requirements, setRequirements] = React.useState<string[]>(['']);
  const [targetAudience, setTargetAudience] = React.useState<string[]>(['']);

  const addItem = (items: string[], setItems: (items: string[]) => void) => {
    setItems([...items, '']);
  };

  const removeItem = (
    index: number,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    value: string,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  React.useEffect(() => {
    form.setValue(
      'objectives',
      objectives.filter(obj => obj.trim())
    );
    form.setValue(
      'requirements',
      requirements.filter(req => req.trim())
    );
    form.setValue(
      'targetAudience',
      targetAudience.filter(aud => aud.trim())
    );
  }, [objectives, requirements, targetAudience, form]);

  return (
    <FormSection
      title="Learning Details"
      description="Define what students will learn and what they need to know"
      variant="card"
    >
      <FormGrid columns={1} gap="lg">
        {/* Learning Objectives */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Learning Objectives *</h4>
            <p className="mb-4 text-xs text-muted-foreground">
              What will students be able to do after taking your course?
            </p>
          </div>
          {objectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <FormInput
                value={objective}
                onChange={e =>
                  updateItem(index, e.target.value, objectives, setObjectives)
                }
                placeholder={`Learning objective ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index, objectives, setObjectives)}
                disabled={objectives.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem(objectives, setObjectives)}
          >
            Add Objective
          </Button>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Prerequisites</h4>
            <p className="mb-4 text-xs text-muted-foreground">
              What do students need to know before taking your course?
            </p>
          </div>
          {requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2">
              <FormInput
                value={requirement}
                onChange={e =>
                  updateItem(
                    index,
                    e.target.value,
                    requirements,
                    setRequirements
                  )
                }
                placeholder={`Requirement ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index, requirements, setRequirements)}
                disabled={requirements.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem(requirements, setRequirements)}
          >
            Add Requirement
          </Button>
        </div>

        {/* Target Audience */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Target Audience</h4>
            <p className="mb-4 text-xs text-muted-foreground">
              Who is this course intended for?
            </p>
          </div>
          {targetAudience.map((audience, index) => (
            <div key={index} className="flex gap-2">
              <FormInput
                value={audience}
                onChange={e =>
                  updateItem(
                    index,
                    e.target.value,
                    targetAudience,
                    setTargetAudience
                  )
                }
                placeholder={`Target audience ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  removeItem(index, targetAudience, setTargetAudience)
                }
                disabled={targetAudience.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem(targetAudience, setTargetAudience)}
          >
            Add Audience
          </Button>
        </div>
      </FormGrid>
    </FormSection>
  );
};

interface CourseCreationFormProps {
  onComplete: (data: CourseFormData) => Promise<void>;
  initialData?: Partial<CourseFormData>;
}

export function CourseCreationForm({
  onComplete,
  initialData,
}: CourseCreationFormProps) {
  const form = useFormWithSchema({
    schema: courseSchema,
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      categoryId: '',
      level: undefined,
      language: '',
      price: 0,
      currency: 'USD',
      tags: [],
      duration: 1,
      objectives: [],
      requirements: [],
      targetAudience: [],
      isPublished: false,
      allowEnrollment: true,
      certificateEnabled: true,
      ...initialData,
    },
  });

  const steps = [
    {
      name: 'basic-info',
      title: 'Basic Info',
      description: 'Course title, description, and category',
      component: BasicInfoStep,
    },
    {
      name: 'media-pricing',
      title: 'Media & Pricing',
      description: 'Upload images, videos, and set pricing',
      component: MediaPricingStep,
    },
    {
      name: 'objectives',
      title: 'Learning Details',
      description: 'Define objectives and requirements',
      component: ObjectivesStep,
    },
  ];

  const validateStep = async (step: number, data: Partial<CourseFormData>) => {
    switch (step) {
      case 0:
        return form.trigger([
          'title',
          'description',
          'shortDescription',
          'categoryId',
          'language',
        ]);
      case 1:
        return form.trigger(['price', 'duration']);
      case 2:
        return form.trigger(['objectives']);
      default:
        return true;
    }
  };

  return (
    <MultiStepForm
      form={form}
      steps={steps}
      onComplete={onComplete}
      validateStep={validateStep}
      showProgress
      showStepNumbers
    />
  );
}
