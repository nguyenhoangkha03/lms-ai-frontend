import { z } from 'zod';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

export function createFormErrorHandler<T extends FieldValues>(
  form: UseFormReturn<T>,
  onError?: (error: Error) => void
) {
  return (error: unknown) => {
    console.error('Form submission error:', error);

    if (error instanceof z.ZodError) {
      const formattedErrors = error.format();
      Object.entries(formattedErrors).forEach(([field, errorObj]) => {
        if (
          field !== '_errors' &&
          Array.isArray(errorObj?._errors) &&
          errorObj._errors.length > 0
        ) {
          form.setError(field as FieldPath<T>, {
            type: 'manual',
            message: errorObj._errors[0],
          });
        }
      });
    } else if (error instanceof Error) {
      if (error.message.includes('email')) {
        form.setError('email' as FieldPath<T>, {
          type: 'manual',
          message: 'Email address is already in use',
        });
      } else if (error.message.includes('password')) {
        form.setError('password' as FieldPath<T>, {
          type: 'manual',
          message: 'Password is incorrect',
        });
      } else {
        form.setError('root', {
          type: 'manual',
          message: error.message || 'An unexpected error occurred',
        });
      }

      onError?.(error);
    }
  };
}

export function transformFormData<T extends Record<string, any>>(
  data: T,
  transformers: Partial<Record<keyof T, (value: any) => any>> = {}
): T {
  const transformed = { ...data };

  Object.entries(transformers).forEach(([key, transformer]) => {
    if (key in transformed && transformer) {
      transformed[key as keyof T] = transformer(transformed[key as keyof T]);
    }
  });

  // Remove empty strings and null values
  Object.keys(transformed).forEach(key => {
    const value = transformed[key as keyof T];
    if (value === '' || value === null) {
      delete transformed[key as keyof T];
    }
  });

  return transformed;
}

export function createFormSubmissionHandler<T extends FieldValues>({
  form,
  onSubmit,
  onSuccess,
  onError,
  transform,
  showToast = true,
}: {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<any>;
  onSuccess?: (result: any, data: T) => void;
  onError?: (error: Error) => void;
  transform?: (data: T) => T;
  showToast?: boolean;
}) {
  return async (data: T) => {
    try {
      const transformedData = transform ? transform(data) : data;
      const result = await onSubmit(transformedData);

      if (showToast) {
        // You can integrate with your toast system here
        console.log('Form submitted successfully');
      }

      onSuccess?.(result, transformedData);
    } catch (error) {
      const errorHandler = createFormErrorHandler(form, onError);
      errorHandler(error);

      if (showToast) {
        console.error('Form submission failed');
      }
    }
  };
}

export const formValidationUtils = {
  hasFieldError: <T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: FieldPath<T>
  ): boolean => {
    return Boolean(form.formState.errors[fieldName]);
  },

  getFieldError: <T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: FieldPath<T>
  ): string | undefined => {
    return form.formState.errors[fieldName]?.message as string | undefined;
  },

  isFieldDirty: <T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: FieldPath<T>
  ): boolean => {
    const dirtyFields = form.formState.dirtyFields as unknown as Record<
      string,
      boolean
    >;
    return Boolean(dirtyFields[fieldName as string]);
  },

  isFieldTouched: <T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldName: FieldPath<T>
  ): boolean => {
    const touchedFields = form.formState.touchedFields as unknown as Record<
      string,
      boolean
    >;
    return Boolean(touchedFields[fieldName as string]);
  },
};
