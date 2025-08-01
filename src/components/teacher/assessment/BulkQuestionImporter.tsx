'use client';

import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  FileCode,
  Copy,
  RefreshCw,
} from 'lucide-react';

import { Question } from '@/types/assessment';

interface BulkQuestionImporterProps {
  onImport: (questions: Question[]) => void;
  assessmentType: string;
}

const IMPORT_FORMATS = [
  {
    id: 'csv',
    name: 'CSV Format',
    description: 'Comma-separated values with predefined columns',
    icon: FileSpreadsheet,
    example: `"Question Text","Type","Difficulty","Points","Option A","Option B","Option C","Option D","Correct Answer","Explanation"
"What is 2+2?","multiple_choice","easy","1","3","4","5","6","4","Basic arithmetic operation"
"The Earth is flat","true_false","easy","1","","","","","false","The Earth is approximately spherical"`,
  },
  {
    id: 'json',
    name: 'JSON Format',
    description: 'Structured JSON format for complex questions',
    icon: FileCode,
    example: `[
  {
    "questionText": "What is the capital of France?",
    "questionType": "multiple_choice",
    "difficulty": "easy",
    "points": 1,
    "options": [
      {"text": "London", "isCorrect": false},
      {"text": "Paris", "isCorrect": true},
      {"text": "Berlin", "isCorrect": false},
      {"text": "Rome", "isCorrect": false}
    ],
    "explanation": "Paris is the capital and largest city of France."
  }
]`,
  },
  {
    id: 'text',
    name: 'Plain Text',
    description: 'Simple text format with structured syntax',
    icon: FileText,
    example: `Q: What is 2+2?
TYPE: multiple_choice
DIFFICULTY: easy
POINTS: 1
A) 3
B) 4 [CORRECT]
C) 5
D) 6
EXPLANATION: Basic arithmetic operation

Q: The Earth is flat
TYPE: true_false
DIFFICULTY: easy
POINTS: 1
ANSWER: false
EXPLANATION: The Earth is approximately spherical`,
  },
];

export const BulkQuestionImporter: React.FC<BulkQuestionImporterProps> = ({
  onImport,
  assessmentType,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFormat, setSelectedFormat] = useState('text');
  const [importText, setImportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Get current format details
  const currentFormat = IMPORT_FORMATS.find(f => f.id === selectedFormat);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setImportText(content);

      // Auto-detect format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        setSelectedFormat('csv');
      } else if (extension === 'json') {
        setSelectedFormat('json');
      } else {
        setSelectedFormat('text');
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV format
  const parseCSV = (text: string): Question[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2)
      throw new Error('CSV must have at least header and one data row');

    const headers = lines[0]
      .split(',')
      .map(h => h.replace(/"/g, '').trim().toLowerCase());
    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const question: Question = {
        id: `import-${Date.now()}-${i}`,
        assessmentId: '',
        questionText: row['question text'] || row['question'],
        questionType: (row['type'] || 'multiple_choice') as any,
        difficulty: (row['difficulty'] || 'medium') as any,
        points: parseFloat(row['points']) || 1,
        orderIndex: i - 1,
        explanation: row['explanation'],
        hint: row['hint'],
        options: [],
        correctAnswer: row['correct answer'] || row['answer'],
        tags: row['tags'] ? row['tags'].split(';') : [],
        attachments: [],
        analytics: {
          attempts: 0,
          correctAnswers: 0,
          averageScore: 0,
          averageTimeSpent: 0,
          difficultyIndex: 0,
          discriminationIndex: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'bulk-import',
        updatedBy: 'bulk-import',
      };

      // Parse options for multiple choice
      if (question.questionType === 'multiple_choice') {
        const options: any[] = [];
        ['option a', 'option b', 'option c', 'option d', 'option e'].forEach(
          (optKey, index) => {
            const optText = row[optKey];
            if (optText) {
              options.push({
                id: `opt-${index}`,
                text: optText,
                isCorrect: optText === question.correctAnswer,
                feedback: '',
                orderIndex: index,
              });
            }
          }
        );
        question.options = options;
      }

      questions.push(question);
    }

    return questions;
  };

  // Parse JSON format
  const parseJSON = (text: string): Question[] => {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of questions');
    }

    return data.map((item, index) => ({
      id: `import-${Date.now()}-${index}`,
      assessmentId: '',
      questionText: item.questionText || '',
      questionType: item.questionType || 'multiple_choice',
      difficulty: item.difficulty || 'medium',
      points: item.points || 1,
      orderIndex: index,
      explanation: item.explanation,
      hint: item.hint,
      options: item.options || [],
      correctAnswer: item.correctAnswer || '',
      tags: item.tags || [],
      attachments: [],
      analytics: {
        attempts: 0,
        correctAnswers: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        difficultyIndex: 0,
        discriminationIndex: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'bulk-import',
      updatedBy: 'bulk-import',
    }));
  };

  // Parse plain text format
  const parseText = (text: string): Question[] => {
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim());
    const questions: Question[] = [];

    blocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim());
      const question: Partial<Question> = {
        id: `import-${Date.now()}-${index}`,
        assessmentId: '',
        orderIndex: index,
        questionType: 'multiple_choice',
        difficulty: 'medium',
        points: 1,
        options: [],
        tags: [],
        attachments: [],
        analytics: {
          attempts: 0,
          correctAnswers: 0,
          averageScore: 0,
          averageTimeSpent: 0,
          difficultyIndex: 0,
          discriminationIndex: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'bulk-import',
        updatedBy: 'bulk-import',
      };

      const options: any[] = [];
      let correctAnswer = '';

      lines.forEach(line => {
        if (line.startsWith('Q:')) {
          question.questionText = line.substring(2).trim();
        } else if (line.startsWith('TYPE:')) {
          question.questionType = line.substring(5).trim() as any;
        } else if (line.startsWith('DIFFICULTY:')) {
          question.difficulty = line.substring(11).trim() as any;
        } else if (line.startsWith('POINTS:')) {
          question.points = parseInt(line.substring(7).trim()) || 1;
        } else if (line.startsWith('EXPLANATION:')) {
          question.explanation = line.substring(12).trim();
        } else if (line.startsWith('HINT:')) {
          question.hint = line.substring(5).trim();
        } else if (line.startsWith('ANSWER:')) {
          correctAnswer = line.substring(7).trim();
        } else if (line.match(/^[A-E]\)/)) {
          const isCorrect = line.includes('[CORRECT]');
          const text = line.substring(2).replace('[CORRECT]', '').trim();
          options.push({
            id: `opt-${options.length}`,
            text,
            isCorrect,
            feedback: '',
            orderIndex: options.length,
          });
          if (isCorrect) {
            correctAnswer = text;
          }
        }
      });

      question.options = options;
      question.correctAnswer = correctAnswer;

      if (question.questionText) {
        questions.push(question as Question);
      }
    });

    return questions;
  };

  // Process import
  const processImport = async () => {
    if (!importText.trim()) {
      toast({
        title: 'No Content',
        description: 'Please enter content to import or upload a file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);
    setErrors([]);

    try {
      // Simulate processing steps
      const steps = [
        'Validating format...',
        'Parsing questions...',
        'Validating question data...',
        'Processing options...',
        'Finalizing import...',
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProcessProgress(((i + 1) / steps.length) * 100);
      }

      let questions: Question[] = [];

      // Parse based on selected format
      switch (selectedFormat) {
        case 'csv':
          questions = parseCSV(importText);
          break;
        case 'json':
          questions = parseJSON(importText);
          break;
        case 'text':
          questions = parseText(importText);
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Validate questions
      const validationErrors: string[] = [];
      questions.forEach((q, index) => {
        if (!q.questionText) {
          validationErrors.push(`Question ${index + 1}: Missing question text`);
        }
        if (q.points <= 0) {
          validationErrors.push(
            `Question ${index + 1}: Points must be greater than 0`
          );
        }
        if (
          q.questionType === 'multiple_choice' &&
          (!q.options || q.options.length < 2)
        ) {
          validationErrors.push(
            `Question ${index + 1}: Multiple choice needs at least 2 options`
          );
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        toast({
          title: 'Validation Errors',
          description: `Found ${validationErrors.length} validation errors. Please fix them before importing.`,
          variant: 'destructive',
        });
      } else {
        setParsedQuestions(questions);
        setShowPreview(true);
        toast({
          title: 'Import Successful',
          description: `Successfully parsed ${questions.length} questions.`,
        });
      }
    } catch (error: any) {
      setErrors([error.message]);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to parse the import content.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
    }
  };

  // Confirm import
  const confirmImport = () => {
    onImport(parsedQuestions);
    setParsedQuestions([]);
    setImportText('');
    setShowPreview(false);
    toast({
      title: 'Questions Imported',
      description: `${parsedQuestions.length} questions have been added to your assessment.`,
    });
  };

  // Download template
  const downloadTemplate = (format: string) => {
    const formatData = IMPORT_FORMATS.find(f => f.id === format);
    if (!formatData) return;

    const blob = new Blob([formatData.example], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question_template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Format
          </CardTitle>
          <CardDescription>
            Choose the format of your question data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFormat} onValueChange={setSelectedFormat}>
            <TabsList className="grid w-full grid-cols-3">
              {IMPORT_FORMATS.map(format => {
                const IconComponent = format.icon;
                return (
                  <TabsTrigger
                    key={format.id}
                    value={format.id}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    {format.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {IMPORT_FORMATS.map(format => (
              <TabsContent key={format.id} value={format.id} className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{format.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(format.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <Label className="mb-2 block text-sm font-medium">
                      Example Format:
                    </Label>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded border bg-white p-3 text-xs">
                      {format.example}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Import Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Questions
          </CardTitle>
          <CardDescription>
            Upload a file or paste your question data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <span className="text-sm text-muted-foreground">
              Supported: .txt, .csv, .json
            </span>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            — OR —
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label>Paste Questions Data</Label>
            <Textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`Paste your ${currentFormat?.name.toLowerCase()} data here...`}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={processImport}
              disabled={!importText.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Process Import
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setImportText('');
                setParsedQuestions([]);
                setErrors([]);
                setShowPreview(false);
              }}
            >
              Clear
            </Button>

            <Button
              variant="outline"
              onClick={() => setImportText(currentFormat?.example || '')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Use Example
            </Button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={processProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Processing questions... {Math.round(processProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h4 className="mb-2 font-medium text-red-900">Import Errors</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {showPreview && parsedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Import Preview
                </CardTitle>
                <CardDescription>
                  Review {parsedQuestions.length} questions before importing
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmImport}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Import {parsedQuestions.length} Questions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {parsedQuestions.map((question, index) => (
                <div key={question.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Badge variant="secondary">{question.questionType}</Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                      <Badge variant="outline">{question.points} pts</Badge>
                    </div>
                  </div>

                  <p className="mb-2 font-medium">{question.questionText}</p>

                  {question.options && question.options.length > 0 && (
                    <div className="space-y-1 text-sm">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2 ${option.isCorrect ? 'font-medium text-green-700' : ''}`}
                        >
                          <span>{String.fromCharCode(65 + optIndex)})</span>
                          <span>{option.text}</span>
                          {option.isCorrect && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.questionType !== 'multiple_choice' &&
                    question.correctAnswer && (
                      <div className="mt-2 text-sm text-green-700">
                        <strong>Answer:</strong> {question.correctAnswer}
                      </div>
                    )}

                  {question.explanation && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
