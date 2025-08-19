'use client';

import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormDebugProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  show?: boolean;
}

export function FormDebug<T extends FieldValues>({
  form,
  show = process.env.NODE_ENV === 'development',
}: FormDebugProps<T>) {
  if (!show) return null;

  const {
    formState: {
      errors,
      touchedFields,
      dirtyFields,
      isValid,
      isSubmitting,
      isSubmitted,
      isDirty,
    },
    watch,
    getValues,
  } = form;

  const formData = watch();

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Form Debug
          <div className="flex gap-2">
            <Badge variant={isValid ? 'secondary' : 'destructive'}>
              {isValid ? 'Valid' : 'Invalid'}
            </Badge>
            <Badge variant={isDirty ? 'default' : 'secondary'}>
              {isDirty ? 'Dirty' : 'Clean'}
            </Badge>
            <Badge variant={isSubmitting ? 'default' : 'secondary'}>
              {isSubmitting ? 'Submitting' : 'Ready'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Current Values</h4>
              <ScrollArea className="h-64 w-full rounded border p-4">
                <pre className="text-xs">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">
                Errors ({Object.keys(errors).length})
              </h4>
              <ScrollArea className="h-64 w-full rounded border p-4">
                <pre className="text-xs">{JSON.stringify(errors, null, 2)}</pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="state" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Touched Fields</h4>
                <ScrollArea className="h-32 w-full rounded border p-4">
                  <pre className="text-xs">
                    {JSON.stringify(touchedFields, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Dirty Fields</h4>
                <ScrollArea className="h-32 w-full rounded border p-4">
                  <pre className="text-xs">
                    {JSON.stringify(dirtyFields, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Valid:</span>{' '}
                {isValid ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Submitted:</span>{' '}
                {isSubmitted ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Submitting:</span>{' '}
                {isSubmitting ? 'Yes' : 'No'}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.reset()}
              >
                Reset Form
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
                onClick={() => form.trigger()}
              >
                Validate All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => console.log('Form values:', getValues())}
              >
                Log Values
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue('email' as any, 'test@example.com' as any);
                  form.setValue('name' as any, 'Test User' as any);
                }}
              >
                Fill Test Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
