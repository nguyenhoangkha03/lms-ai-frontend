'use client';

import { useState, useEffect, useRef } from 'react';
import { Question } from '@/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  HelpCircle,
  Lightbulb,
  FileText,
  Code,
  Calculator,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
  answer?: any;
  onAnswerChange: (answer: any) => void;
  onSubmit: (answer: any) => void;
  showQuestionNumbers: boolean;
  isSecureMode: boolean;
  className?: string;
}

export function QuestionRenderer({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  onSubmit,
  showQuestionNumbers,
  isSecureMode,
  className,
}: QuestionRendererProps) {
  const [currentAnswer, setCurrentAnswer] = useState(answer || '');
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    setCurrentAnswer(answer || '');
    setIsAnswered(!!answer);
  }, [answer]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAnswerChange = (newAnswer: any) => {
    setCurrentAnswer(newAnswer);
    onAnswerChange(newAnswer);
    setIsAnswered(!!newAnswer);

    // Auto-save answer when changed
    if (newAnswer) {
      onSubmit(newAnswer);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = () => {
    switch (question.questionType) {
      case 'multiple_choice':
        return <CheckCircle className="h-5 w-5" />;
      case 'true_false':
        return <CheckCircle className="h-5 w-5" />;
      case 'short_answer':
        return <FileText className="h-5 w-5" />;
      case 'essay':
        return <FileText className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      case 'numeric':
        return <Calculator className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const renderMultipleChoice = () => {
    // Parse options if it's a JSON string
    const options =
      typeof question.options === 'string'
        ? JSON.parse(question.options)
        : question.options || [];

    return (
      <RadioGroup
        value={currentAnswer}
        onValueChange={handleAnswerChange}
        className="space-y-3"
      >
        {options.map((option: any) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label
              htmlFor={option.id}
              className="flex-1 cursor-pointer rounded border border-gray-300 bg-white p-3 text-gray-900 transition-colors hover:bg-gray-100"
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderTrueFalse = () => (
    <RadioGroup
      value={currentAnswer}
      onValueChange={handleAnswerChange}
      className="space-y-3"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="true" id="true" />
        <Label
          htmlFor="true"
          className="flex-1 cursor-pointer rounded border border-gray-300 bg-white p-3 text-gray-900 transition-colors hover:bg-gray-100"
        >
          True
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="false" id="false" />
        <Label
          htmlFor="false"
          className="flex-1 cursor-pointer rounded border border-gray-300 bg-white p-3 text-gray-900 transition-colors hover:bg-gray-100"
        >
          False
        </Label>
      </div>
    </RadioGroup>
  );

  const renderShortAnswer = () => (
    <Input
      value={currentAnswer}
      onChange={e => handleAnswerChange(e.target.value)}
      placeholder="Enter your answer..."
      className="w-full border-gray-300 bg-white text-gray-900"
      disabled={isSecureMode && isAnswered}
    />
  );

  const renderEssay = () => (
    <Textarea
      value={currentAnswer}
      onChange={e => handleAnswerChange(e.target.value)}
      placeholder="Write your essay here..."
      className="min-h-40 w-full resize-none border-gray-300 bg-white text-gray-900"
      disabled={isSecureMode && isAnswered}
    />
  );

  const renderNumeric = () => (
    <Input
      type="number"
      value={currentAnswer}
      onChange={e => handleAnswerChange(e.target.value)}
      placeholder="Enter numeric answer..."
      className="w-full border-gray-300 bg-white text-gray-900"
      disabled={isSecureMode && isAnswered}
    />
  );

  const renderCode = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Code className="h-4 w-4" />
        <span>Language: JavaScript</span>
      </div>
      <Textarea
        value={currentAnswer}
        onChange={e => handleAnswerChange(e.target.value)}
        placeholder="// Write your code here..."
        className="min-h-60 w-full resize-none border-gray-300 bg-white font-mono text-sm text-gray-900"
        disabled={isSecureMode && isAnswered}
      />
    </div>
  );

  const renderFillInTheBlank = () => {
    const content = question.questionText || question.content;
    const parts = content.split('_____');
    const blanks = parts.length - 1;
    const answers = Array.isArray(currentAnswer)
      ? currentAnswer
      : new Array(blanks).fill('');

    const handleBlankChange = (index: number, value: string) => {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      handleAnswerChange(newAnswers);
    };

    return (
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && (
                <Input
                  value={answers[index] || ''}
                  onChange={e => handleBlankChange(index, e.target.value)}
                  className="mx-2 inline-block w-32 border-gray-300 bg-white text-gray-900"
                  placeholder="Answer"
                  disabled={isSecureMode && isAnswered}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderMatching = () => (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Matching questions are not yet implemented in this demo.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderQuestion = () => {
    switch (question.questionType) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'true_false':
        return renderTrueFalse();
      case 'short_answer':
        return renderShortAnswer();
      case 'essay':
        return renderEssay();
      case 'numeric':
        return renderNumeric();
      case 'code':
        return renderCode();
      case 'fill_in_the_blank':
        return renderFillInTheBlank();
      case 'matching':
        return renderMatching();
      default:
        return <div>Question type not supported</div>;
    }
  };

  return (
    <div className={cn('space-y-6 pb-8', className)}>
      <Card className="border-gray-300 bg-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-blue-400">{getQuestionIcon()}</div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  {showQuestionNumbers && (
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Question {questionNumber}
                    </Badge>
                  )}
                  <span className="text-lg">
                    {question.title || question.questionText}
                  </span>
                  {question.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </CardTitle>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>Points: {question.points}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      Difficulty:{' '}
                      {'★'.repeat(
                        question.difficultyLevel ||
                          (question.difficulty === 'easy'
                            ? 1
                            : question.difficulty === 'medium'
                              ? 2
                              : question.difficulty === 'hard'
                                ? 3
                                : 4)
                      )}
                    </span>
                  </div>
                  {question.timeLimit && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Time Limit: {question.timeLimit}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right text-sm">
                <div className="text-gray-600">Time Spent</div>
                <div className="font-mono text-gray-900">
                  {formatTime(timeSpent)}
                </div>
              </div>
              {isAnswered && <CheckCircle className="h-5 w-5 text-green-400" />}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Content */}
          <div className="prose prose-sm max-w-none text-gray-800">
            <div
              dangerouslySetInnerHTML={{
                __html: question.questionText || question.content,
              }}
            />
          </div>

          {/* Attachments */}
          {(() => {
            const attachments =
              typeof question.attachments === 'string'
                ? JSON.parse(question.attachments)
                : question.attachments || [];
            return (
              attachments &&
              Array.isArray(attachments) &&
              attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Attachments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment: any) => (
                      <Button
                        key={attachment.id}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="border-gray-300 text-gray-900 hover:bg-gray-100"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {attachment.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )
            );
          })()}

          {/* Answer Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Your Answer:</h4>
            <div className="rounded-lg bg-gray-50 p-4">{renderQuestion()}</div>
          </div>

          {/* Hints */}
          {question.hint && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>

              {showHint && (
                <Alert className="border-yellow-400 bg-yellow-50">
                  <Lightbulb className="h-4 w-4 text-yellow-700" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Hint:</strong> {question.hint}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {question.timeLimit && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Time remaining:{' '}
                    {Math.max(0, question.timeLimit - timeSpent)}s
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {currentAnswer && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Answer saved automatically</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Metadata */}
          {question.metadata && (
            <div className="border-t border-gray-200 pt-4 text-xs text-gray-600">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {question.metadata.topic && (
                  <div>
                    <span className="font-medium">Topic:</span>{' '}
                    {question.metadata.topic}
                  </div>
                )}
                {question.metadata.learningObjective && (
                  <div>
                    <span className="font-medium">Objective:</span>{' '}
                    {question.metadata.learningObjective}
                  </div>
                )}
                {question.metadata.bloomsTaxonomy && (
                  <div>
                    <span className="font-medium">Bloom's Level:</span>{' '}
                    {question.metadata.bloomsTaxonomy}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
