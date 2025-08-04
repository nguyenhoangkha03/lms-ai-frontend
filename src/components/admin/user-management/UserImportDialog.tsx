'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface UserImportDialogProps {
  onClose: () => void;
  onImport: (
    formData: FormData
  ) => Promise<{ imported: number; failed: number; errors: string[] }>;
}

interface ImportPreview {
  headers: string[];
  rows: string[][];
  validRows: number;
  invalidRows: number;
  errors: string[];
}

const UserImportDialog: React.FC<UserImportDialogProps> = ({
  onClose,
  onImport,
}) => {
  const { toast } = useToast();

  // State management
  const [step, setStep] = useState<
    'upload' | 'preview' | 'mapping' | 'importing' | 'complete'
  >('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(
    null
  );
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    sendWelcomeEmail: false,
    setDefaultPassword: true,
    requireEmailVerification: true,
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Required fields for user import
  const requiredFields = [
    { key: 'email', label: 'Email Address', required: true },
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'userType', label: 'User Type', required: true },
  ];

  const optionalFields = [
    { key: 'username', label: 'Username' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'organization', label: 'Organization' },
    { key: 'department', label: 'Department' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
  ];

  // File upload handler
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: 'File too large',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      parseCSVFile(file);
    },
    []
  );

  // Parse CSV file
  const parseCSVFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error(
          'CSV file must contain at least a header row and one data row'
        );
      }

      const headers = lines[0]
        .split(',')
        .map(h => h.trim().replace(/['"]/g, ''));
      const rows = lines
        .slice(1)
        .map(line =>
          line.split(',').map(cell => cell.trim().replace(/['"]/g, ''))
        );

      // Validate data
      const errors: string[] = [];
      let validRows = 0;
      let invalidRows = 0;

      rows.forEach((row, index) => {
        if (row.length !== headers.length) {
          errors.push(`Row ${index + 2}: Column count mismatch`);
          invalidRows++;
        } else if (row.every(cell => !cell.trim())) {
          errors.push(`Row ${index + 2}: Empty row`);
          invalidRows++;
        } else {
          validRows++;
        }
      });

      setImportPreview({
        headers,
        rows: rows.slice(0, 10), // Show only first 10 rows for preview
        validRows,
        invalidRows,
        errors: errors.slice(0, 20), // Show only first 20 errors
      });

      setStep('preview');
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description:
          error instanceof Error ? error.message : 'Failed to parse CSV file',
        variant: 'destructive',
      });
    }
  };

  // Handle field mapping
  const handleFieldMapping = (csvField: string, systemField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvField]: systemField,
    }));
  };

  // Validate mapping
  const validateMapping = () => {
    const mappedSystemFields = Object.values(fieldMapping);
    const missingRequired = requiredFields.filter(
      field => field.required && !mappedSystemFields.includes(field.key)
    );

    return missingRequired;
  };

  // Execute import
  const executeImport = async () => {
    if (!selectedFile || !importPreview) return;

    setStep('importing');
    setImportProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fieldMapping', JSON.stringify(fieldMapping));
      formData.append('options', JSON.stringify(importOptions));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await onImport(formData);

      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);
      setStep('complete');

      toast({
        title: 'Import completed',
        description: `Successfully imported ${result.imported} users`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description:
          error instanceof Error ? error.message : 'Failed to import users',
        variant: 'destructive',
      });
      setStep('preview');
    }
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const headers = [
      'email',
      'firstName',
      'lastName',
      'userType',
      'phone',
      'organization',
    ];
    const sampleData = [
      [
        'john.doe@example.com',
        'John',
        'Doe',
        'student',
        '+1234567890',
        'Example Corp',
      ],
      [
        'jane.smith@example.com',
        'Jane',
        'Smith',
        'teacher',
        '+0987654321',
        'Example University',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
          <DialogDescription>
            Import users from a CSV file with field mapping and validation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={step} className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="upload" disabled={step !== 'upload'}>
                Upload
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={step !== 'preview'}>
                Preview
              </TabsTrigger>
              <TabsTrigger value="mapping" disabled={step !== 'mapping'}>
                Mapping
              </TabsTrigger>
              <TabsTrigger value="importing" disabled={step !== 'importing'}>
                Import
              </TabsTrigger>
              <TabsTrigger value="complete" disabled={step !== 'complete'}>
                Complete
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="upload" className="h-full space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <CardDescription>
                      Select a CSV file containing user data to import
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                      <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <div className="text-lg font-medium">
                          Choose a CSV file to upload
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Maximum file size: 10MB
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label htmlFor="csv-upload">
                        <Button variant="outline" className="mt-4" asChild>
                          <span>Select File</span>
                        </Button>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Need a template?
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSampleCSV}
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Download Sample CSV
                      </Button>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Required fields:</strong> Email, First Name,
                        Last Name, User Type
                        <br />
                        <strong>User types:</strong> student, teacher, admin
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="preview"
                className="h-full space-y-4 overflow-hidden"
              >
                {importPreview && (
                  <div className="flex h-full flex-col space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {importPreview.validRows}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Valid Rows
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-red-600">
                            {importPreview.invalidRows}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Invalid Rows
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold">
                            {importPreview.headers.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Columns
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="flex-1 overflow-hidden">
                      <CardHeader>
                        <CardTitle>Data Preview</CardTitle>
                        <CardDescription>
                          First 10 rows of your CSV file
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-64">
                          <div className="p-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    {importPreview.headers.map(
                                      (header, index) => (
                                        <th
                                          key={index}
                                          className="p-2 text-left font-medium"
                                        >
                                          {header}
                                        </th>
                                      )
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {importPreview.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-b">
                                      {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="p-2">
                                          {cell || (
                                            <span className="text-muted-foreground">
                                              -
                                            </span>
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {importPreview.errors.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            Validation Errors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {importPreview.errors.map((error, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-destructive"
                                >
                                  {error}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="mapping"
                className="h-full space-y-4 overflow-hidden"
              >
                <div className="flex h-full flex-col space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Field Mapping</CardTitle>
                      <CardDescription>
                        Map CSV columns to system fields
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-3 font-medium text-destructive">
                            Required Fields
                          </h4>
                          <div className="space-y-3">
                            {requiredFields.map(field => (
                              <div
                                key={field.key}
                                className="flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium">
                                    {field.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {field.key}
                                  </div>
                                </div>
                                <select
                                  className="rounded border px-3 py-1 text-sm"
                                  value={
                                    Object.entries(fieldMapping).find(
                                      ([_, value]) => value === field.key
                                    )?.[0] || ''
                                  }
                                  onChange={e => {
                                    // Remove previous mapping for this system field
                                    const newMapping = { ...fieldMapping };
                                    Object.keys(newMapping).forEach(key => {
                                      if (newMapping[key] === field.key) {
                                        delete newMapping[key];
                                      }
                                    });
                                    // Add new mapping
                                    if (e.target.value) {
                                      newMapping[e.target.value] = field.key;
                                    }
                                    setFieldMapping(newMapping);
                                  }}
                                >
                                  <option value="">Select column...</option>
                                  {importPreview?.headers.map(header => (
                                    <option key={header} value={header}>
                                      {header}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="mb-3 font-medium">Optional Fields</h4>
                          <div className="space-y-3">
                            {optionalFields.map(field => (
                              <div
                                key={field.key}
                                className="flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium">
                                    {field.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {field.key}
                                  </div>
                                </div>
                                <select
                                  className="rounded border px-3 py-1 text-sm"
                                  value={
                                    Object.entries(fieldMapping).find(
                                      ([_, value]) => value === field.key
                                    )?.[0] || ''
                                  }
                                  onChange={e => {
                                    const newMapping = { ...fieldMapping };
                                    Object.keys(newMapping).forEach(key => {
                                      if (newMapping[key] === field.key) {
                                        delete newMapping[key];
                                      }
                                    });
                                    if (e.target.value) {
                                      newMapping[e.target.value] = field.key;
                                    }
                                    setFieldMapping(newMapping);
                                  }}
                                >
                                  <option value="">Skip this field</option>
                                  {importPreview?.headers.map(header => (
                                    <option key={header} value={header}>
                                      {header}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Import Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="skipDuplicates"
                            checked={importOptions.skipDuplicates}
                            onCheckedChange={checked =>
                              setImportOptions(prev => ({
                                ...prev,
                                skipDuplicates: !!checked,
                              }))
                            }
                          />
                          <label htmlFor="skipDuplicates" className="text-sm">
                            Skip duplicate email addresses
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sendWelcomeEmail"
                            checked={importOptions.sendWelcomeEmail}
                            onCheckedChange={checked =>
                              setImportOptions(prev => ({
                                ...prev,
                                sendWelcomeEmail: !!checked,
                              }))
                            }
                          />
                          <label htmlFor="sendWelcomeEmail" className="text-sm">
                            Send welcome email to new users
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="setDefaultPassword"
                            checked={importOptions.setDefaultPassword}
                            onCheckedChange={checked =>
                              setImportOptions(prev => ({
                                ...prev,
                                setDefaultPassword: !!checked,
                              }))
                            }
                          />
                          <label
                            htmlFor="setDefaultPassword"
                            className="text-sm"
                          >
                            Set default password (users will be prompted to
                            change)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="requireEmailVerification"
                            checked={importOptions.requireEmailVerification}
                            onCheckedChange={checked =>
                              setImportOptions(prev => ({
                                ...prev,
                                requireEmailVerification: !!checked,
                              }))
                            }
                          />
                          <label
                            htmlFor="requireEmailVerification"
                            className="text-sm"
                          >
                            Require email verification
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="importing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Importing Users</CardTitle>
                    <CardDescription>
                      Please wait while we import your users...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="space-y-4 text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                        <div className="text-lg font-medium">
                          Processing import...
                        </div>
                        <div className="w-64">
                          <Progress value={importProgress} />
                          <div className="mt-1 text-sm text-muted-foreground">
                            {importProgress}% complete
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complete" className="space-y-4">
                {importResult && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Import Complete
                        </CardTitle>
                        <CardDescription>
                          Your user import has been completed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              {importResult.imported}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Users Imported
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">
                              {importResult.failed}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Failed Imports
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {importResult.errors.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            Import Errors
                          </CardTitle>
                          <CardDescription>
                            The following errors occurred during import
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {importResult.errors.map((error, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-destructive"
                                >
                                  {error}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <div>
              {step !== 'upload' && step !== 'complete' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === 'preview') setStep('upload');
                    if (step === 'mapping') setStep('preview');
                  }}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                {step === 'complete' ? 'Close' : 'Cancel'}
              </Button>

              {step === 'preview' && (
                <Button
                  onClick={() => setStep('mapping')}
                  disabled={importPreview?.validRows === 0}
                >
                  Continue to Mapping
                </Button>
              )}

              {step === 'mapping' && (
                <Button
                  onClick={() => setStep('importing')}
                  disabled={validateMapping().length > 0}
                >
                  Start Import
                </Button>
              )}

              {step === 'importing' && (
                <Button onClick={executeImport}>Execute Import</Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { UserImportDialog };
