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
  };

  const handleSubmit = () => {
    onSubmit(currentAnswer);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = () => {
    switch (question.type) {
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

  const renderMultipleChoice = () => (
    <RadioGroup
      value={currentAnswer}
      onValueChange={handleAnswerChange}
      className="space-y-3"
    >
      {question.options?.map(option => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id} id={option.id} />
          <Label
            htmlFor={option.id}
            className="flex-1 cursor-pointer rounded border p-3 transition-colors hover:bg-gray-50"
          >
            {option.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

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
          className="flex-1 cursor-pointer rounded border p-3 transition-colors hover:bg-gray-50"
        >
          True
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="false" id="false" />
        <Label
          htmlFor="false"
          className="flex-1 cursor-pointer rounded border p-3 transition-colors hover:bg-gray-50"
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
      className="w-full"
      disabled={isSecureMode && isAnswered}
    />
  );

  const renderEssay = () => (
    <Textarea
      value={currentAnswer}
      onChange={e => handleAnswerChange(e.target.value)}
      placeholder="Write your essay here..."
      className="min-h-40 w-full resize-none"
      disabled={isSecureMode && isAnswered}
    />
  );

  const renderNumeric = () => (
    <Input
      type="number"
      value={currentAnswer}
      onChange={e => handleAnswerChange(e.target.value)}
      placeholder="Enter numeric answer..."
      className="w-full"
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
        className="min-h-60 w-full resize-none font-mono text-sm"
        disabled={isSecureMode && isAnswered}
      />
    </div>
  );

  const renderFillInTheBlank = () => {
    const parts = question.content.split('_____');
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
                  className="mx-2 inline-block w-32"
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
    switch (question.type) {
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
    <div className={cn('space-y-6', className)}>
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-blue-400">{getQuestionIcon()}</div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-white">
                  {showQuestionNumbers && (
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Question {questionNumber}
                    </Badge>
                  )}
                  <span className="text-lg">{question.title}</span>
                  {question.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </CardTitle>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>Points: {question.points}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      Difficulty: {'★'.repeat(question.difficultyLevel)}
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
                <div className="text-gray-400">Time Spent</div>
                <div className="font-mono text-white">
                  {formatTime(timeSpent)}
                </div>
              </div>
              {isAnswered && <CheckCircle className="h-5 w-5 text-green-400" />}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Content */}
          <div className="prose prose-sm max-w-none text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: question.content }} />
          </div>

          {/* Attachments */}
          {question.attachments && question.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-white">Attachments:</h4>
              <div className="flex flex-wrap gap-2">
                {question.attachments.map(attachment => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {attachment.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Answer Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-white">Your Answer:</h4>
            <div className="rounded-lg bg-gray-900 p-4">{renderQuestion()}</div>
          </div>

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>

              {showHint && (
                <Alert className="border-yellow-600 bg-yellow-900/20">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    <strong>Hint:</strong> {question.hints[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
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
              {question.hints && question.hints.length > 1 && showHint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Cycle through hints
                    const currentHintIndex = question.hints!.findIndex(
                      hint => hint === question.hints![0]
                    );
                    // Implementation for cycling hints
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Next Hint
                </Button>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!currentAnswer || (isSecureMode && isAnswered)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAnswered ? 'Update Answer' : 'Submit Answer'}
              </Button>
            </div>
          </div>

          {/* Answer Status */}
          {isAnswered && (
            <Alert className="border-green-600 bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Answer submitted successfully.
                {isSecureMode && ' Changes are not allowed in secure mode.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Question Metadata */}
          {question.metadata && (
            <div className="border-t border-gray-700 pt-4 text-xs text-gray-500">
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
