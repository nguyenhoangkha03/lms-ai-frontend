'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Upload,
  Sparkles,
  AlertCircle,
  Clock,
  FileText,
  Video,
  Settings,
  DollarSign,
  Target,
  Save,
  PlayCircle,
  Image,
  Globe,
  Users,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  price: number;
  currency: string;
  thumbnail: File | null;
  sections: CourseSection[];
  settings: {
    allowComments: boolean;
    allowQA: boolean;
    certificateEnabled: boolean;
    downloadableResources: boolean;
  };
}

interface CourseSection {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  videoFile?: File;
  content?: string;
}

const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'Course Information',
    description: 'Basic details about your course',
    icon: <FileText className="h-5 w-5" />,
    estimatedTime: 10,
  },
  {
    id: 'curriculum',
    title: 'Course Structure',
    description: 'Create sections and lessons',
    icon: <BookOpen className="h-5 w-5" />,
    estimatedTime: 30,
  },
  {
    id: 'content',
    title: 'Upload Content',
    description: 'Add videos and materials',
    icon: <Video className="h-5 w-5" />,
    estimatedTime: 45,
  },
  {
    id: 'pricing',
    title: 'Pricing & Settings',
    description: 'Set price and course settings',
    icon: <DollarSign className="h-5 w-5" />,
    estimatedTime: 15,
  },
  {
    id: 'review',
    title: 'Review & Publish',
    description: 'Final review before publishing',
    icon: <Target className="h-5 w-5" />,
    estimatedTime: 10,
  },
];

const CATEGORIES = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Photography',
  'Music',
  'Health & Fitness',
  'Language',
  'Personal Development',
];

const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
];

export default function ModernCourseCreationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    subcategory: '',
    level: 'beginner',
    language: 'vi',
    price: 0,
    currency: 'VND',
    thumbnail: null,
    sections: [],
    settings: {
      allowComments: true,
      allowQA: true,
      certificateEnabled: true,
      downloadableResources: true,
    },
  });

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Simulate auto-save
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastAutoSave(new Date());
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Info
        return !!(formData.title && formData.description && formData.category);
      case 1: // Curriculum
        return formData.sections.length > 0;
      case 2: // Content
        return true; // Can be skipped for now
      case 3: // Pricing
        return formData.price >= 0;
      case 4: // Review
        return false; // Never completed until published
      default:
        return false;
    }
  };

  const progressPercentage = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const currentStepData = WIZARD_STEPS[currentStep];

  const handlePublish = () => {
    toast({
      title: 'Success!',
      description: 'Course published successfully',
    });
    router.push('/teacher/courses');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <motion.div
            key="basic-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Enter course title..."
                className="mt-2 bg-white/80 backdrop-blur-sm border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="subtitle" className="text-lg font-semibold">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => updateFormData({ subtitle: e.target.value })}
                placeholder="Short description of your course..."
                className="mt-2 bg-white/80 backdrop-blur-sm border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">Course Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Detailed description of what students will learn..."
                rows={6}
                className="mt-2 bg-white/80 backdrop-blur-sm border-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-lg font-semibold">Category</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData({ category: value })}>
                  <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level" className="text-lg font-semibold">Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => updateFormData({ level: value })}>
                  <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="language" className="text-lg font-semibold">Language</Label>
              <Select value={formData.language} onValueChange={(value) => updateFormData({ language: value })}>
                <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-semibold">Course Thumbnail</Label>
              <div className="mt-2 border-2 border-dashed border-white/30 rounded-xl p-8 text-center bg-white/40 backdrop-blur-sm">
                <Image className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600 mb-4">Upload course thumbnail image</p>
                <Button variant="outline" className="bg-white/80">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 1: // Curriculum
        return (
          <motion.div
            key="curriculum"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Build Your Course Curriculum</h3>
              <p className="text-slate-500 mb-6">
                Create sections and lessons to organize your course content
              </p>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-600">
                <PlayCircle className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </div>
          </motion.div>
        );

      case 2: // Content
        return (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <Video className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Upload Course Content</h3>
              <p className="text-slate-500 mb-6">
                Add videos, documents, and other learning materials
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Button variant="outline" className="bg-white/80">
                  <Video className="h-4 w-4 mr-2" />
                  Upload Videos
                </Button>
                <Button variant="outline" className="bg-white/80">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Documents
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 3: // Pricing
        return (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="price" className="text-lg font-semibold">Course Price</Label>
              <div className="mt-2 flex space-x-2">
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                  placeholder="0"
                  className="bg-white/80 backdrop-blur-sm border-white/20"
                />
                <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
                  <SelectTrigger className="w-24 bg-white/80 backdrop-blur-sm border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-slate-500 mt-1">Set to 0 for free course</p>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Course Settings</Label>
              
              <div className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="comments">Allow Comments</Label>
                    <p className="text-sm text-slate-500">Students can comment on lessons</p>
                  </div>
                  <Switch
                    id="comments"
                    checked={formData.settings.allowComments}
                    onCheckedChange={(checked) => updateFormData({ 
                      settings: { ...formData.settings, allowComments: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="qa">Q&A Section</Label>
                    <p className="text-sm text-slate-500">Enable question and answer section</p>
                  </div>
                  <Switch
                    id="qa"
                    checked={formData.settings.allowQA}
                    onCheckedChange={(checked) => updateFormData({ 
                      settings: { ...formData.settings, allowQA: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="certificate">Certificate</Label>
                    <p className="text-sm text-slate-500">Award certificate upon completion</p>
                  </div>
                  <Switch
                    id="certificate"
                    checked={formData.settings.certificateEnabled}
                    onCheckedChange={(checked) => updateFormData({ 
                      settings: { ...formData.settings, certificateEnabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="resources">Downloadable Resources</Label>
                    <p className="text-sm text-slate-500">Allow students to download resources</p>
                  </div>
                  <Switch
                    id="resources"
                    checked={formData.settings.downloadableResources}
                    onCheckedChange={(checked) => updateFormData({ 
                      settings: { ...formData.settings, downloadableResources: checked }
                    })}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4: // Review
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Award className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Publish!</h3>
              <p className="text-slate-500 mb-6">
                Review your course details before publishing
              </p>
            </div>

            <Card className="bg-white/60 backdrop-blur-lg border-white/30">
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Title:</strong> {formData.title || 'Untitled Course'}
                </div>
                <div>
                  <strong>Category:</strong> {formData.category || 'Not selected'}
                </div>
                <div>
                  <strong>Level:</strong> {formData.level}
                </div>
                <div>
                  <strong>Price:</strong> {formData.price === 0 ? 'Free' : `${formData.price} ${formData.currency}`}
                </div>
                <div>
                  <strong>Language:</strong> {LANGUAGES.find(l => l.code === formData.language)?.name}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={handlePublish}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg px-8"
              >
                <Check className="h-5 w-5 mr-2" />
                Publish Course
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-slate-600 hover:text-slate-900 hover:bg-white/60 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Courses
              </Button>
              
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
              
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Create New Course
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Step {currentStep + 1} of {WIZARD_STEPS.length}: {currentStepData.title}
                    </p>
                    {isAutoSaving && (
                      <div className="flex items-center space-x-1 text-xs text-emerald-600">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Auto-saving...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {lastAutoSave && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20">
                  <Clock className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-slate-600">Saved {lastAutoSave.toLocaleTimeString()}</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`bg-white/60 backdrop-blur-sm border-white/20 transition-all duration-200 ${
                  showAIAssistant 
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-200 text-purple-700' 
                    : 'hover:bg-white/80'
                }`}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI Assistant
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </Button>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700">
                  Progress: {Math.round(progressPercentage)}%
                </span>
                <Badge variant="secondary" className="bg-white/60 text-slate-600">
                  {WIZARD_STEPS.filter((_, index) => isStepCompleted(index)).length} of {WIZARD_STEPS.length} completed
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>~{currentStepData.estimatedTime} min for this step</span>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-white/40 backdrop-blur-sm border border-white/20" 
              />
              <div 
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Step Navigation */}
          <div className="col-span-3">
            <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg">Course Creation Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {WIZARD_STEPS.map((step, index) => (
                  <motion.button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                        : isStepCompleted(index)
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'hover:bg-white/60 text-slate-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        index === currentStep
                          ? 'bg-white/20'
                          : isStepCompleted(index)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isStepCompleted(index) ? <Check className="h-4 w-4" /> : step.icon}
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className={`text-xs ${index === currentStep ? 'text-white/80' : 'text-slate-500'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            <Card className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl min-h-96">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                    <p className="text-slate-600">{currentStepData.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep === WIZARD_STEPS.length - 1 ? (
                    <Button
                      onClick={handlePublish}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Publish Course
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                    >
                      Next Step
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="col-span-3"
            >
              <Card className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-lg border-purple-200/30 shadow-xl sticky top-32">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg text-purple-700">AI Course Assistant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-purple-600">
                    💡 <strong>Tip for this step:</strong>
                    <p className="mt-1 text-purple-700">
                      {currentStep === 0 && "Use clear, engaging titles that describe what students will learn. Include keywords that your target audience would search for."}
                      {currentStep === 1 && "Break your course into logical sections. Each section should cover a specific topic or skill."}
                      {currentStep === 2 && "High-quality video content is key. Ensure good audio quality and clear visuals."}
                      {currentStep === 3 && "Research competitor pricing. Consider offering early-bird discounts to attract initial students."}
                      {currentStep === 4 && "Double-check all information before publishing. You can always update content later."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Suggested improvements:</p>
                    <div className="space-y-1">
                      {formData.title && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          ✓ Title added
                        </Badge>
                      )}
                      {formData.description && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          ✓ Description added
                        </Badge>
                      )}
                      {!formData.category && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                          Select a category
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Suggestions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}