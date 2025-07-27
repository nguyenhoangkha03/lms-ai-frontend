'use client';

import React from 'react';
import { FormProvider } from '@/components/forms/form-provider';
import { LoginForm } from '@/components/forms/examples/login-form';
import { CourseCreationForm } from '@/components/forms/examples/course-creation-form';
import { ErrorHandlingDemo } from '@/components/forms/examples/error-handling-demo';
import { ValidationShowcase } from '@/components/forms/examples/validation-showcase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FormsExamplePage() {
  return (
    <FormProvider
      config={{
        showValidationErrors: true,
        autoSave: true,
        persistForm: true,
      }}
    >
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Form System Examples</h1>
            <p className="text-muted-foreground">
              Comprehensive examples showcasing the form system capabilities
              including validation, error handling, multi-step forms, and
              auto-save functionality.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="login">Login Form</TabsTrigger>
              <TabsTrigger value="multi-step">Multi-step Form</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="error-handling">Error Handling</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Login Form Example</CardTitle>
                  <CardDescription>
                    Simple login form with email/password validation and social
                    login options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mx-auto max-w-md">
                    <LoginForm
                      onSubmit={async data => {
                        console.log('Login data:', data);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                      }}
                      showSocialLogin={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="multi-step" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-step Course Creation Form</CardTitle>
                  <CardDescription>
                    Complex multi-step form with validation, file uploads, and
                    progress tracking.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CourseCreationForm
                    onComplete={async data => {
                      console.log('Course creation data:', data);
                      await new Promise(resolve => setTimeout(resolve, 2000));
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Showcase</CardTitle>
                  <CardDescription>
                    Comprehensive form demonstrating various field types and
                    validation rules.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ValidationShowcase />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="error-handling" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Error Handling & Auto-save Demo</CardTitle>
                  <CardDescription>
                    Form with error simulation, auto-save functionality, and
                    persistence.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorHandlingDemo />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FormProvider>
  );
}
