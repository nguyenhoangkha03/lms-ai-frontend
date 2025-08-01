'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Lightbulb,
  Target,
  Clock,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  X,
} from 'lucide-react';

import { QuestionFormData, QuestionOption } from '@/types/assessment';

interface QuestionEditorProps {
  question: QuestionFormData;
  onUpdate: (question: QuestionFormData) => void;
  onSave: () => void;
  errors: Record<string, string>;
}

const QUESTION_TYPES = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    icon: '📝',
    description: 'Single or multiple correct answers from a list of options',
    supportsOptions: true,
    supportsCorrectAnswer: true,
  },
  {
    value: 'true_false',
    label: 'True/False',
    icon: '✓',
    description: 'Binary choice between true and false',
    supportsOptions: false,
    supportsCorrectAnswer: true,
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    icon: '💬',
    description: 'Brief text response, typically one sentence',
    supportsOptions: false,
    supportsCorrectAnswer: true,
  },
  {
    value: 'essay',
    label: 'Essay',
    icon: '📄',
    description: 'Extended written response requiring detailed analysis',
    supportsOptions: false,
    supportsCorrectAnswer: false,
  },
  {
    value: 'fill_in_the_blank',
    label: 'Fill in the Blank',
    icon: '___',
    description: 'Complete missing words or phrases in text',
    supportsOptions: false,
    supportsCorrectAnswer: true,
  },
  {
    value: 'matching',
    label: 'Matching',
    icon: '🔗',
    description: 'Match items from two different lists',
    supportsOptions: true,
    supportsCorrectAnswer: true,
  },
  {
    value: 'ordering',
    label: 'Ordering',
    icon: '📊',
    description: 'Arrange items in correct sequence',
    supportsOptions: true,
    supportsCorrectAnswer: true,
  },
  {
    value: 'numeric',
    label: 'Numeric',
    icon: '🔢',
    description: 'Mathematical calculation with numeric answer',
    supportsOptions: false,
    supportsCorrectAnswer: true,
  },
  {
    value: 'code',
    label: 'Code',
    icon: '💻',
    description: 'Programming code snippet or algorithm',
    supportsOptions: false,
    supportsCorrectAnswer: true,
  },
];

const DIFFICULTY_LEVELS = [
  {
    value: 'easy',
    label: 'Easy',
    color: 'green',
    description: 'Basic recall and understanding',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'yellow',
    description: 'Application and analysis',
  },
  {
    value: 'hard',
    label: 'Hard',
    color: 'orange',
    description: 'Complex problem solving',
  },
  {
    value: 'expert',
    label: 'Expert',
    color: 'red',
    description: 'Advanced synthesis and evaluation',
  },
];

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onSave,
  errors,
}) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Get current question type details
  const questionType = QUESTION_TYPES.find(
    type => type.value === question.questionType
  );
  const difficultyLevel = DIFFICULTY_LEVELS.find(
    level => level.value === question.difficulty
  );

  // Handle form updates
  const handleUpdate = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K]
  ) => {
    onUpdate({
      ...question,
      [field]: value,
    });
  };

  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    const typeInfo = QUESTION_TYPES.find(t => t.value === type);

    let updatedQuestion = {
      ...question,
      questionType: type,
    };

    // Reset options and correct answer based on question type
    if (typeInfo?.supportsOptions && type === 'multiple_choice') {
      updatedQuestion.options = [
        { id: '1', text: '', isCorrect: false, feedback: '', orderIndex: 0 },
        { id: '2', text: '', isCorrect: false, feedback: '', orderIndex: 1 },
        { id: '3', text: '', isCorrect: false, feedback: '', orderIndex: 2 },
        { id: '4', text: '', isCorrect: false, feedback: '', orderIndex: 3 },
      ];
      updatedQuestion.correctAnswer = '';
    } else if (type === 'true_false') {
      updatedQuestion.options = undefined;
      updatedQuestion.correctAnswer = 'true';
    } else {
      updatedQuestion.options = undefined;
      updatedQuestion.correctAnswer = '';
    }

    onUpdate(updatedQuestion);
  };

  // Handle options management
  const addOption = () => {
    if (!question.options) return;

    const newOption: QuestionOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
      feedback: '',
      orderIndex: question.options.length,
    };

    handleUpdate('options', [...question.options, newOption]);
  };

  const removeOption = (optionId: string) => {
    if (!question.options || question.options.length <= 2) {
      toast({
        title: 'Cannot Remove',
        description: 'At least 2 options are required.',
        variant: 'destructive',
      });
      return;
    }

    const updatedOptions = question.options.filter(opt => opt.id !== optionId);
    handleUpdate('options', updatedOptions);
  };

  const updateOption = (optionId: string, updates: Partial<QuestionOption>) => {
    if (!question.options) return;

    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    handleUpdate('options', updatedOptions);
  };

  const setCorrectOption = (optionId: string, isCorrect: boolean) => {
    if (!question.options) return;

    // For single-answer questions, uncheck others
    const updatedOptions = question.options.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId ? isCorrect : false,
    }));

    handleUpdate('options', updatedOptions);

    // Update correct answer
    const correctOption = updatedOptions.find(opt => opt.isCorrect);
    handleUpdate('correctAnswer', correctOption?.text || '');
  };

  // Handle tags
  const addTag = () => {
    if (!newTag.trim() || question.tags.includes(newTag.trim())) return;

    handleUpdate('tags', [...question.tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    handleUpdate(
      'tags',
      question.tags.filter(tag => tag !== tagToRemove)
    );
  };

  // Validation
  const validateQuestion = () => {
    const errors: string[] = [];

    if (!question.questionText.trim()) {
      errors.push('Question text is required');
    }

    if (question.points <= 0) {
      errors.push('Points must be greater than 0');
    }

    if (questionType?.supportsOptions && question.options) {
      if (question.options.length < 2) {
        errors.push('At least 2 options are required');
      }

      if (
        question.questionType === 'multiple_choice' &&
        !question.options.some(opt => opt.isCorrect)
      ) {
        errors.push('At least one correct answer must be selected');
      }

      if (question.options.some(opt => !opt.text.trim())) {
        errors.push('All options must have text');
      }
    }

    if (
      questionType?.supportsCorrectAnswer &&
      question.questionType !== 'essay' &&
      !question.correctAnswer
    ) {
      errors.push('Correct answer is required');
    }

    return errors;
  };

  const validationErrors = validateQuestion();
  const isValid = validationErrors.length === 0;

  return (
    <div className="space-y-6">
      {/* Question Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={question.questionType}
            onValueChange={handleQuestionTypeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {questionType && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center gap-2 text-blue-900">
                <span className="text-lg">{questionType.icon}</span>
                <div>
                  <h4 className="font-medium">{questionType.label}</h4>
                  <p className="text-sm text-blue-700">
                    {questionType.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Question Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label>Question Text *</Label>
            <Textarea
              value={question.questionText}
              onChange={e => handleUpdate('questionText', e.target.value)}
              placeholder={`Enter your ${questionType?.label.toLowerCase()} question...`}
              rows={4}
            />
            {errors.questionText && (
              <p className="text-sm text-red-600">{errors.questionText}</p>
            )}
          </div>

          {/* Question Settings Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Points */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Points *
              </Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={question.points}
                onChange={e =>
                  handleUpdate('points', parseFloat(e.target.value) || 1)
                }
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select
                value={question.difficulty}
                onValueChange={value => handleUpdate('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full bg-${level.color}-500`}
                        />
                        <span>{level.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Limit */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Limit (min)
              </Label>
              <Input
                type="number"
                min="1"
                value={question.timeLimit || ''}
                onChange={e =>
                  handleUpdate(
                    'timeLimit',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="Optional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options (for multiple choice, matching, etc.) */}
      {questionType?.supportsOptions && question.options && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Answer Options
              </CardTitle>
              <Button size="sm" onClick={addOption}>
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.options.map((option, index) => (
              <div
                key={option.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {question.questionType === 'multiple_choice' && (
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={checked =>
                        setCorrectOption(option.id, !!checked)
                      }
                    />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    value={option.text}
                    onChange={e =>
                      updateOption(option.id, { text: e.target.value })
                    }
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />

                  <Input
                    value={option.feedback || ''}
                    onChange={e =>
                      updateOption(option.id, { feedback: e.target.value })
                    }
                    placeholder="Feedback (optional)"
                    className="text-sm"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(option.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Correct Answer (for non-multiple choice) */}
      {questionType?.supportsCorrectAnswer &&
        question.questionType !== 'multiple_choice' &&
        question.questionType !== 'essay' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Correct Answer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.questionType === 'true_false' ? (
                <RadioGroup
                  value={question.correctAnswer.toString()}
                  onValueChange={value => handleUpdate('correctAnswer', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
              ) : question.questionType === 'numeric' ? (
                <Input
                  type="number"
                  value={question.correctAnswer}
                  onChange={e => handleUpdate('correctAnswer', e.target.value)}
                  placeholder="Enter the correct numeric answer"
                />
              ) : (
                <Textarea
                  value={question.correctAnswer}
                  onChange={e => handleUpdate('correctAnswer', e.target.value)}
                  placeholder="Enter the correct answer or acceptable answers"
                  rows={3}
                />
              )}
            </CardContent>
          </Card>
        )}

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Additional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Explanation */}
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea
              value={question.explanation || ''}
              onChange={e => handleUpdate('explanation', e.target.value)}
              placeholder="Explain why this is the correct answer (shown after submission)"
              rows={3}
            />
          </div>

          {/* Hint */}
          <div className="space-y-2">
            <Label>Hint</Label>
            <Textarea
              value={question.hint || ''}
              onChange={e => handleUpdate('hint', e.target.value)}
              placeholder="Provide a helpful hint for students (optional)"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>

            <div className="flex flex-wrap gap-2">
              {question.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button onClick={addTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <h4 className="mb-2 font-medium text-red-900">
                  Please fix the following errors:
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>

        <Button
          onClick={onSave}
          disabled={!isValid}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Question
        </Button>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Eye className="h-5 w-5" />
              Question Preview
            </CardTitle>
            <CardDescription className="text-blue-700">
              How this question will appear to students
            </CardDescription>
          </CardHeader>
          <CardContent className="rounded-lg border bg-white">
            <div className="space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{questionType?.label}</Badge>
                  <Badge variant="outline">{question.points} pts</Badge>
                  {difficultyLevel && (
                    <Badge
                      variant="outline"
                      className={`text-${difficultyLevel.color}-600`}
                    >
                      {difficultyLevel.label}
                    </Badge>
                  )}
                </div>
                {question.timeLimit && (
                  <Badge variant="outline" className="text-orange-600">
                    <Clock className="mr-1 h-3 w-3" />
                    {question.timeLimit} min
                  </Badge>
                )}
              </div>

              {/* Question Text */}
              <div className="text-lg font-medium">
                {question.questionText || 'Enter your question text...'}
              </div>

              {/* Answer Options */}
              {question.questionType === 'multiple_choice' &&
                question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-3 rounded border p-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 text-sm">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span
                          className={
                            option.isCorrect ? 'font-medium text-green-700' : ''
                          }
                        >
                          {option.text ||
                            `Option ${String.fromCharCode(65 + index)}`}
                        </span>
                        {option.isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {/* True/False */}
              {question.questionType === 'true_false' && (
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 rounded border p-2 ${question.correctAnswer === 'true' ? 'border-green-200 bg-green-50' : ''}`}
                  >
                    <div className="h-4 w-4 rounded-full border-2 border-gray-400"></div>
                    <span>True</span>
                    {question.correctAnswer === 'true' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 rounded border p-2 ${question.correctAnswer === 'false' ? 'border-green-200 bg-green-50' : ''}`}
                  >
                    <div className="h-4 w-4 rounded-full border-2 border-gray-400"></div>
                    <span>False</span>
                    {question.correctAnswer === 'false' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              )}

              {/* Other question types */}
              {!['multiple_choice', 'true_false', 'essay'].includes(
                question.questionType
              ) && (
                <div className="rounded border bg-gray-50 p-3">
                  <Label className="text-sm text-muted-foreground">
                    Answer Input Area
                  </Label>
                  {question.questionType === 'short_answer' && (
                    <Input
                      placeholder="Student will type their answer here..."
                      disabled
                    />
                  )}
                  {question.questionType === 'numeric' && (
                    <Input
                      type="number"
                      placeholder="Numeric answer..."
                      disabled
                    />
                  )}
                  {question.questionType === 'fill_in_the_blank' && (
                    <div className="text-sm text-muted-foreground">
                      Blanks will appear as input fields in the question text
                    </div>
                  )}
                </div>
              )}

              {/* Essay */}
              {question.questionType === 'essay' && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Essay Response Area
                  </Label>
                  <Textarea
                    placeholder="Student will write their essay response here..."
                    rows={6}
                    disabled
                  />
                </div>
              )}

              {/* Hint */}
              {question.hint && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium text-blue-900">
                        Hint
                      </Label>
                      <p className="mt-1 text-sm text-blue-700">
                        {question.hint}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Explanation (shown after answer) */}
              {question.explanation && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-green-900">
                        Explanation
                      </Label>
                      <p className="mt-1 text-sm text-green-700">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
