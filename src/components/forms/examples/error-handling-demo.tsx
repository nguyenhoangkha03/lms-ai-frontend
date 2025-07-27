'use client';

import React from 'react';
import { BaseForm } from '@/components/forms/base-form';
import { FormErrorBoundary } from '@/components/forms/form-error-boundary';
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper';
import { FormInput } from '@/components/ui/form-fields/form-input';
import { FormSaveIndicator } from '@/components/forms/form-save-indicator';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import { useFormAutoSave } from '@/hooks/use-form-auto-save';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import {
  contactSchema,
  type ContactFormData,
} from '@/lib/validations/common-schemas';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { FormTextarea } from '@/components/ui/form-fields';

export function ErrorHandlingDemo() {
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [simulateError, setSimulateError] = React.useState(false);

  const form = useFormWithSchema({
    schema: contactSchema,
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      department: undefined,
    },
    showSuccessToast: false,
    showErrorToast: false,
  });

  const autoSave = useFormAutoSave({
    form,
    onSave: async data => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Auto-saved:', data);
    },
    enabled: true,
    debounceMs: 2000,
  });

  useFormPersistence({
    form,
    key: 'contact-form-demo',
    enabled: true,
    exclude: ['message'],
  });

  const handleSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (simulateError) {
        throw new Error('Simulated network error');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitSuccess(true);
      form.reset();
      autoSave.manualSave();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(errorMessage);

      if (errorMessage.includes('email')) {
        form.setError('email', { message: 'This email is already in use' });
      }
    }
  };

  const triggerBoundaryError = () => {
    throw new Error('This is a boundary error for testing');
  };

  return (
    <FormErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Form error boundary caught:', error, errorInfo);
      }}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Form Error Handling Demo</h2>
          <p className="text-muted-foreground">
            This demo showcases various error handling, auto-save, and form
            persistence features.
          </p>

          {/* Demo Controls */}
          <div className="flex gap-4 rounded-lg bg-muted p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSimulateError(!simulateError)}
            >
              {simulateError ? 'Disable' : 'Enable'} Submit Error
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerBoundaryError}
            >
              Trigger Boundary Error
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                form.setError('email', { message: 'Custom validation error' })
              }
            >
              Set Field Error
            </Button>
          </div>

          {/* Save Indicator */}
          <FormSaveIndicator
            isSaving={autoSave.isSaving}
            lastSaved={autoSave.lastSaved}
            saveError={autoSave.saveError}
          />
        </div>

        {/* Success/Error Alerts */}
        {submitSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Form submitted successfully! Data has been saved.
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to submit form: {submitError}
            </AlertDescription>
          </Alert>
        )}

        {simulateError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error simulation is enabled. Form submission will fail.
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Form */}
        <BaseForm
          form={form}
          onSubmit={handleSubmit}
          submitText="Send Message"
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper
              form={form}
              name="name"
              label="Full Name"
              required
            >
              {field => (
                <FormInput {...field} placeholder="Enter your full name" />
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
          </div>

          <FormFieldWrapper form={form} name="subject" label="Subject" required>
            {field => (
              <FormInput {...field} placeholder="What is this about?" />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper
            form={form}
            name="message"
            label="Message"
            description="Please provide as much detail as possible"
            required
          >
            {field => (
              <FormTextarea
                {...field}
                placeholder="Type your message here..."
                rows={6}
              />
            )}
          </FormFieldWrapper>
        </BaseForm>
      </div>
    </FormErrorBoundary>
  );
}
