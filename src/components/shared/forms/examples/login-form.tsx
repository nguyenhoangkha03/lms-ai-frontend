'use client';

import React from 'react';
import { BaseForm } from '@/components/forms/base-form';
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper';
import { FormInput } from '@/components/ui/form-fields/form-input';
import { FormCheckbox } from '@/components/ui/form-fields/form-checkbox';
import { PasswordInput } from '@/components/ui/enhanced-input';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import {
  loginSchema,
  type LoginFormData,
} from '@/lib/validations/auth-schemas';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
  showSocialLogin?: boolean;
}

export function LoginForm({
  onSubmit,
  loading = false,
  showSocialLogin = true,
}: LoginFormProps) {
  const form = useFormWithSchema({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  return (
    <div className="space-y-6">
      <BaseForm
        form={form}
        onSubmit={onSubmit}
        loading={loading}
        submitText="Sign In"
        className="space-y-4"
      >
        <FormFieldWrapper form={form} name="email" label="Email" required>
          {field => (
            <FormInput
              {...field}
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
            />
          )}
        </FormFieldWrapper>

        <FormFieldWrapper form={form} name="password" label="Password" required>
          {field => (
            <PasswordInput
              {...field}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          )}
        </FormFieldWrapper>

        <div className="flex items-center justify-between">
          <FormFieldWrapper form={form} name="rememberMe">
            {field => (
              <FormCheckbox
                checked={field.value}
                onCheckedChange={field.onChange}
              >
                Remember me
              </FormCheckbox>
            )}
          </FormFieldWrapper>

          <Button variant="link" size="sm" asChild>
            <a href="/auth/forgot-password">Forgot password?</a>
          </Button>
        </div>
      </BaseForm>

      {showSocialLogin && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button">
              Google
            </Button>
            <Button variant="outline" type="button">
              GitHub
            </Button>
          </div>
        </>
      )}

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Button variant="link" size="sm" asChild>
          <a href="/auth/register">Sign up</a>
        </Button>
      </div>
    </div>
  );
}
