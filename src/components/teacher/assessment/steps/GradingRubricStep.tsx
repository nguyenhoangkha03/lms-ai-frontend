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
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  BarChart3,
  Target,
  AlertCircle,
  Info,
  Lightbulb,
} from 'lucide-react';

import {
  useGetGradingRubricsQuery,
  useCreateGradingRubricMutation,
  useUpdateGradingRubricMutation,
} from '@/lib/redux/api/teacher-assessment-api';

import {
  GradingRubric,
  RubricCriterion,
  RubricLevel,
} from '@/types/assessment';

interface GradingRubricStepProps {
  rubric?: GradingRubric;
  assessmentType: string;
  gradingMethod: string;
  onUpdate: (rubric?: GradingRubric) => void;
  errors: Record<string, string>;
}

const RUBRIC_TYPES = [
  {
    value: 'holistic',
    label: 'Holistic',
    description: 'Single overall score based on general impression',
    icon: '🎯',
    bestFor: [
      'Quick grading',
      'Overall quality assessment',
      'Simple assignments',
    ],
  },
  {
    value: 'analytic',
    label: 'Analytic',
    description: 'Multiple criteria scored separately',
    icon: '📊',
    bestFor: ['Detailed feedback', 'Complex assignments', 'Skill development'],
  },
  {
    value: 'single_point',
    label: 'Single Point',
    description: 'One standard with notes for above/below',
    icon: '📝',
    bestFor: [
      'Standards-based grading',
      'Clear expectations',
      'Growth tracking',
    ],
  },
];

const RUBRIC_TEMPLATES = [
  {
    id: 'essay_writing',
    name: 'Essay Writing',
    type: 'analytic',
    criteria: [
      {
        name: 'Content & Ideas',
        description: 'Quality and relevance of ideas, arguments, and evidence',
        weight: 40,
        levels: [
          {
            name: 'Excellent',
            points: 4,
            description:
              'Ideas are original, well-developed, and strongly supported',
          },
          {
            name: 'Good',
            points: 3,
            description: 'Ideas are clear and adequately supported',
          },
          {
            name: 'Satisfactory',
            points: 2,
            description: 'Ideas are present but need more development',
          },
          {
            name: 'Needs Improvement',
            points: 1,
            description: 'Ideas are unclear or poorly supported',
          },
        ],
      },
      {
        name: 'Organization',
        description: 'Structure, flow, and logical arrangement of ideas',
        weight: 30,
        levels: [
          {
            name: 'Excellent',
            points: 4,
            description: 'Clear structure with smooth transitions',
          },
          {
            name: 'Good',
            points: 3,
            description: 'Generally well-organized with minor issues',
          },
          {
            name: 'Satisfactory',
            points: 2,
            description: 'Basic organization present',
          },
          {
            name: 'Needs Improvement',
            points: 1,
            description: 'Lacks clear organization',
          },
        ],
      },
      {
        name: 'Grammar & Style',
        description: 'Language use, grammar, and writing mechanics',
        weight: 30,
        levels: [
          {
            name: 'Excellent',
            points: 4,
            description: 'Error-free with varied sentence structure',
          },
          {
            name: 'Good',
            points: 3,
            description: "Minor errors that don't impede understanding",
          },
          {
            name: 'Satisfactory',
            points: 2,
            description: 'Some errors but generally readable',
          },
          {
            name: 'Needs Improvement',
            points: 1,
            description: 'Frequent errors impede understanding',
          },
        ],
      },
    ],
  },
  {
    id: 'presentation',
    name: 'Presentation',
    type: 'analytic',
    criteria: [
      {
        name: 'Content Knowledge',
        description: 'Understanding and accuracy of presented material',
        weight: 35,
        levels: [
          {
            name: 'Expert',
            points: 4,
            description: 'Demonstrates deep understanding with expert insights',
          },
          {
            name: 'Proficient',
            points: 3,
            description: 'Shows solid understanding of key concepts',
          },
          {
            name: 'Developing',
            points: 2,
            description: 'Basic understanding with some gaps',
          },
          {
            name: 'Beginning',
            points: 1,
            description: 'Limited understanding evident',
          },
        ],
      },
      {
        name: 'Delivery',
        description: 'Speaking skills, confidence, and audience engagement',
        weight: 35,
        levels: [
          {
            name: 'Excellent',
            points: 4,
            description: 'Confident, engaging, and clear delivery',
          },
          {
            name: 'Good',
            points: 3,
            description: 'Generally clear with good confidence',
          },
          {
            name: 'Satisfactory',
            points: 2,
            description: 'Adequate delivery with some hesitation',
          },
          {
            name: 'Needs Work',
            points: 1,
            description: 'Unclear or nervous delivery',
          },
        ],
      },
      {
        name: 'Visual Aids',
        description:
          'Quality and effectiveness of slides, charts, or other materials',
        weight: 30,
        levels: [
          {
            name: 'Excellent',
            points: 4,
            description: 'Professional, relevant, and enhance understanding',
          },
          {
            name: 'Good',
            points: 3,
            description: 'Clear and generally supportive of content',
          },
          {
            name: 'Satisfactory',
            points: 2,
            description: 'Basic visuals with some relevance',
          },
          {
            name: 'Needs Work',
            points: 1,
            description: 'Poor quality or irrelevant visuals',
          },
        ],
      },
    ],
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving',
    type: 'analytic',
    criteria: [
      {
        name: 'Problem Understanding',
        description:
          'Correctly identifies and understands the problem requirements',
        weight: 25,
        levels: [
          {
            name: 'Complete',
            points: 4,
            description: 'Fully understands all aspects of the problem',
          },
          {
            name: 'Mostly Complete',
            points: 3,
            description: 'Understands most key aspects',
          },
          {
            name: 'Partial',
            points: 2,
            description: 'Basic understanding with some confusion',
          },
          {
            name: 'Incomplete',
            points: 1,
            description: 'Misunderstands or ignores key aspects',
          },
        ],
      },
      {
        name: 'Solution Strategy',
        description: 'Develops appropriate approach and methodology',
        weight: 30,
        levels: [
          {
            name: 'Optimal',
            points: 4,
            description: 'Efficient and well-reasoned approach',
          },
          {
            name: 'Effective',
            points: 3,
            description: 'Good approach with minor inefficiencies',
          },
          {
            name: 'Workable',
            points: 2,
            description: 'Basic approach that can work',
          },
          {
            name: 'Flawed',
            points: 1,
            description: 'Poor or inappropriate approach',
          },
        ],
      },
      {
        name: 'Implementation',
        description: 'Executes solution with accuracy and completeness',
        weight: 30,
        levels: [
          {
            name: 'Excellent',
            points: 4,
            description: 'Accurate implementation with attention to detail',
          },
          {
            name: 'Good',
            points: 3,
            description: 'Generally accurate with minor errors',
          },
          {
            name: 'Acceptable',
            points: 2,
            description: 'Mostly correct but some significant errors',
          },
          {
            name: 'Poor',
            points: 1,
            description: 'Many errors or incomplete implementation',
          },
        ],
      },
      {
        name: 'Explanation',
        description: 'Clearly explains reasoning and process',
        weight: 15,
        levels: [
          {
            name: 'Clear',
            points: 4,
            description: 'Thorough and easy to follow explanation',
          },
          {
            name: 'Adequate',
            points: 3,
            description: 'Generally clear with minor gaps',
          },
          {
            name: 'Basic',
            points: 2,
            description: 'Some explanation but lacks detail',
          },
          {
            name: 'Unclear',
            points: 1,
            description: 'Little or confusing explanation',
          },
        ],
      },
    ],
  },
];

export const GradingRubricStep: React.FC<GradingRubricStepProps> = ({
  rubric,
  assessmentType,
  gradingMethod,
  onUpdate,
  errors,
}) => {
  const { toast } = useToast();

  // State management
  const [currentRubric, setCurrentRubric] = useState<GradingRubric | undefined>(
    rubric
  );
  const [isCreatingNew, setIsCreatingNew] = useState(!rubric);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedRubricType, setSelectedRubricType] = useState<string>(
    rubric?.type || 'analytic'
  );
  const [previewMode, setPreviewMode] = useState(false);

  // API hooks
  //   const { data: existingRubrics, isLoading: isLoadingRubrics } =
  //     useGetGradingRubricsQuery({
  //       isTemplate: true,
  //       page: 1,
  //       limit: 20,
  //     });

  const [createRubric, { isLoading: isCreating }] =
    useCreateGradingRubricMutation();
  const [updateRubric, { isLoading: isUpdating }] =
    useUpdateGradingRubricMutation();

  // Handle rubric updates
  const handleRubricUpdate = (updates: Partial<GradingRubric>) => {
    const updatedRubric = currentRubric
      ? { ...currentRubric, ...updates }
      : undefined;
    setCurrentRubric(updatedRubric);
    onUpdate(updatedRubric);
  };

  // Apply template
  const applyTemplate = (template: (typeof RUBRIC_TEMPLATES)[0]) => {
    const newRubric: GradingRubric = {
      id: `temp-${Date.now()}`,
      title: `${template.name} Rubric`,
      description: `Auto-generated ${template.name.toLowerCase()} rubric`,
      type: template.type as any,
      isTemplate: false,
      isActive: true,
      criteria: template.criteria.map((criterion, index) => ({
        id: `criterion-${index}`,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight,
        levels: criterion.levels.map((level, levelIndex) => ({
          id: `level-${index}-${levelIndex}`,
          name: level.name,
          description: level.description,
          points: level.points,
          order: levelIndex,
        })),
      })),
      maxScore: template.criteria.reduce(
        (sum, c) => sum + Math.max(...c.levels.map(l => l.points)),
        0
      ),
      version: 1,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    setCurrentRubric(newRubric);
    onUpdate(newRubric);
    setSelectedTemplate(template.id);
    setIsCreatingNew(false);
  };

  // Create new rubric from scratch
  const createNewRubric = () => {
    const newRubric: GradingRubric = {
      id: `temp-${Date.now()}`,
      title: 'New Rubric',
      description: '',
      type: selectedRubricType as any,
      isTemplate: false,
      isActive: true,
      criteria: [
        {
          id: 'criterion-1',
          name: 'Criterion 1',
          description: '',
          weight: 100,
          levels: [
            {
              id: 'level-1-1',
              name: 'Excellent',
              description: '',
              points: 4,
              order: 0,
            },
            {
              id: 'level-1-2',
              name: 'Good',
              description: '',
              points: 3,
              order: 1,
            },
            {
              id: 'level-1-3',
              name: 'Satisfactory',
              description: '',
              points: 2,
              order: 2,
            },
            {
              id: 'level-1-4',
              name: 'Needs Improvement',
              description: '',
              points: 1,
              order: 3,
            },
          ],
        },
      ],
      maxScore: 4,
      version: 1,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    setCurrentRubric(newRubric);
    onUpdate(newRubric);
    setIsCreatingNew(false);
  };

  // Add criterion
  const addCriterion = () => {
    if (!currentRubric) return;

    const newCriterion: RubricCriterion = {
      id: `criterion-${Date.now()}`,
      name: `Criterion ${currentRubric.criteria.length + 1}`,
      description: '',
      weight: 100 / (currentRubric.criteria.length + 1),
      levels: [
        {
          id: `level-${Date.now()}-1`,
          name: 'Excellent',
          description: '',
          points: 4,
          order: 0,
        },
        {
          id: `level-${Date.now()}-2`,
          name: 'Good',
          description: '',
          points: 3,
          order: 1,
        },
        {
          id: `level-${Date.now()}-3`,
          name: 'Satisfactory',
          description: '',
          points: 2,
          order: 2,
        },
        {
          id: `level-${Date.now()}-4`,
          name: 'Needs Improvement',
          description: '',
          points: 1,
          order: 3,
        },
      ],
    };

    // Rebalance weights
    const newCriteria = [...currentRubric.criteria, newCriterion];
    const equalWeight = 100 / newCriteria.length;
    const balancedCriteria = newCriteria.map(c => ({
      ...c,
      weight: equalWeight,
    }));

    handleRubricUpdate({
      criteria: balancedCriteria,
      maxScore:
        Math.max(...balancedCriteria[0].levels.map(l => l.points)) *
        balancedCriteria.length,
    });
  };

  // Remove criterion
  const removeCriterion = (criterionId: string) => {
    if (!currentRubric) return;

    const newCriteria = currentRubric.criteria.filter(
      c => c.id !== criterionId
    );

    if (newCriteria.length === 0) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one criterion is required.',
        variant: 'destructive',
      });
      return;
    }

    // Rebalance weights
    const equalWeight = 100 / newCriteria.length;
    const balancedCriteria = newCriteria.map(c => ({
      ...c,
      weight: equalWeight,
    }));

    handleRubricUpdate({
      criteria: balancedCriteria,
      maxScore:
        balancedCriteria.length > 0
          ? Math.max(...balancedCriteria[0].levels.map(l => l.points)) *
            balancedCriteria.length
          : 0,
    });
  };

  // Update criterion
  const updateCriterion = (
    criterionId: string,
    updates: Partial<RubricCriterion>
  ) => {
    if (!currentRubric) return;

    const updatedCriteria = currentRubric.criteria.map(c =>
      c.id === criterionId ? { ...c, ...updates } : c
    );

    handleRubricUpdate({ criteria: updatedCriteria });
  };

  // Update level
  const updateLevel = (
    criterionId: string,
    levelId: string,
    updates: Partial<RubricLevel>
  ) => {
    if (!currentRubric) return;

    const updatedCriteria = currentRubric.criteria.map(c => {
      if (c.id === criterionId) {
        const updatedLevels = c.levels.map(l =>
          l.id === levelId ? { ...l, ...updates } : l
        );
        return { ...c, levels: updatedLevels };
      }
      return c;
    });

    handleRubricUpdate({ criteria: updatedCriteria });
  };

  // Save rubric
  const saveRubric = async () => {
    if (!currentRubric) return;

    try {
      if (currentRubric.id.startsWith('temp-')) {
        // Create new rubric
        const result = await createRubric({
          ...currentRubric,
          id: undefined as any,
        }).unwrap();

        const savedRubric = { ...currentRubric, id: result.id };
        setCurrentRubric(savedRubric);
        onUpdate(savedRubric);
      } else {
        // Update existing rubric
        await updateRubric({
          id: currentRubric.id,
          data: currentRubric,
        }).unwrap();
      }

      toast({
        title: 'Rubric Saved',
        description: 'Your grading rubric has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description:
          error.message || 'Failed to save rubric. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Skip rubric creation
  const skipRubric = () => {
    setCurrentRubric(undefined);
    onUpdate(undefined);
  };

  // Check if rubric is required for grading method
  const isRubricRequired =
    gradingMethod === 'manual' || gradingMethod === 'hybrid';
  const isRubricRecommended =
    assessmentType === 'assignment' || assessmentType === 'project';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grading Rubric</h3>
          <p className="text-sm text-muted-foreground">
            {isRubricRequired
              ? 'A rubric is required for manual grading'
              : 'Define criteria and standards for consistent grading'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRubric && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveRubric}
                disabled={isCreating || isUpdating}
              >
                <Save className="mr-2 h-4 w-4" />
                {isCreating || isUpdating ? 'Saving...' : 'Save Rubric'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Recommendation Banner */}
      {(isRubricRequired || isRubricRecommended) && !currentRubric && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                {isRubricRequired ? (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="mb-2 font-medium text-amber-900">
                  {isRubricRequired ? 'Rubric Required' : 'Rubric Recommended'}
                </h4>
                <p className="mb-3 text-sm text-amber-700">
                  {isRubricRequired
                    ? `Your grading method (${gradingMethod}) requires a rubric for consistent evaluation.`
                    : `${assessmentType} assessments benefit from clear grading criteria and rubrics.`}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={createNewRubric}>
                    Create New Rubric
                  </Button>
                  {!isRubricRequired && (
                    <Button variant="outline" size="sm" onClick={skipRubric}>
                      Skip for Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rubric Creation/Selection */}
      {isCreatingNew && !currentRubric && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Grading Rubric
            </CardTitle>
            <CardDescription>
              Choose a template or create a custom rubric from scratch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rubric Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Rubric Type</Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {RUBRIC_TYPES.map(type => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRubricType === type.value 
                        ? 'bg-primary/5 ring-2 ring-primary' 
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedRubricType(type.value);
                      if (currentRubric) {
                        handleRubricUpdate({ type: type.value as any });
                      }
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="space-y-3">
                        <div className="text-2xl">{type.icon}</div>
                        <div>
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Best for:</Label>
                          {type.bestFor.map((use, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="mr-1 text-xs"
                            >
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Template Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Quick Start Templates
              </Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {RUBRIC_TEMPLATES.map(template => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id
                        ? 'bg-primary/5 ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => applyTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {template.type}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs">
                          <Label>Criteria ({template.criteria.length}):</Label>
                          {template.criteria
                            .slice(0, 3)
                            .map((criterion, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span>{criterion.name}</span>
                                <span>{criterion.weight}%</span>
                              </div>
                            ))}
                          {template.criteria.length > 3 && (
                            <div className="text-muted-foreground">
                              +{template.criteria.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={createNewRubric} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Rubric
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rubric Editor */}
      {currentRubric && !previewMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Rubric
                </CardTitle>
                <CardDescription>
                  Configure criteria, levels, and scoring
                </CardDescription>
              </div>
              <Badge variant="outline">
                {currentRubric.type} • {currentRubric.criteria.length} criteria
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Rubric Title</Label>
                <Input
                  value={currentRubric.title}
                  onChange={e => handleRubricUpdate({ title: e.target.value })}
                  placeholder="Enter rubric title"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={currentRubric.type}
                  onValueChange={value =>
                    handleRubricUpdate({ type: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RUBRIC_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={currentRubric.description}
                onChange={e =>
                  handleRubricUpdate({ description: e.target.value })
                }
                placeholder="Describe the purpose and use of this rubric"
                rows={2}
              />
            </div>

            <Separator />

            {/* Criteria Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Criteria ({currentRubric.criteria.length})
                </Label>
                <Button size="sm" onClick={addCriterion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Criterion
                </Button>
              </div>

              <div className="space-y-6">
                {currentRubric.criteria.map((criterion, criterionIndex) => (
                  <Card
                    key={criterion.id}
                    className="border-l-4 border-l-primary"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Criterion Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label className="text-sm">
                                  Criterion Name
                                </Label>
                                <Input
                                  value={criterion.name}
                                  onChange={e =>
                                    updateCriterion(criterion.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Enter criterion name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Weight (%)</Label>
                                <div className="flex items-center gap-2">
                                  <Slider
                                    value={[criterion.weight]}
                                    onValueChange={value =>
                                      updateCriterion(criterion.id, {
                                        weight: value[0],
                                      })
                                    }
                                    max={100}
                                    min={0}
                                    step={5}
                                    className="flex-1"
                                  />
                                  <span className="w-12 text-sm font-medium">
                                    {criterion.weight}%
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Max Points</Label>
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  <span className="font-medium">
                                    {Math.max(
                                      ...criterion.levels.map(l => l.points)
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Description</Label>
                              <Textarea
                                value={criterion.description}
                                onChange={e =>
                                  updateCriterion(criterion.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Describe what this criterion evaluates"
                                rows={2}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriterion(criterion.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Performance Levels */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            Performance Levels
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            {criterion.levels
                              .sort((a, b) => b.points - a.points)
                              .map((level, levelIndex) => (
                                <div
                                  key={level.id}
                                  className="flex items-center gap-4 rounded-lg border p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-white ${
                                        level.points === 4
                                          ? 'bg-green-500'
                                          : level.points === 3
                                            ? 'bg-blue-500'
                                            : level.points === 2
                                              ? 'bg-yellow-500'
                                              : 'bg-red-500'
                                      }`}
                                    >
                                      {level.points}
                                    </div>
                                    <div className="w-20">
                                      <Input
                                        value={level.name}
                                        onChange={e =>
                                          updateLevel(criterion.id, level.id, {
                                            name: e.target.value,
                                          })
                                        }
                                        placeholder="Level name"
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <Textarea
                                      value={level.description}
                                      onChange={e =>
                                        updateLevel(criterion.id, level.id, {
                                          description: e.target.value,
                                        })
                                      }
                                      placeholder="Describe this performance level"
                                      rows={2}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rubric Preview */}
      {currentRubric && previewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Rubric Preview
            </CardTitle>
            <CardDescription>
              How this rubric will appear during grading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Rubric Header */}
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold">{currentRubric.title}</h3>
                <p className="text-muted-foreground">
                  {currentRubric.description}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <Badge variant="outline">{currentRubric.type} Rubric</Badge>
                  <span>Max Score: {currentRubric.maxScore}</span>
                  <span>{currentRubric.criteria.length} Criteria</span>
                </div>
              </div>

              {/* Criteria Grid */}
              <div className="space-y-6">
                {currentRubric.criteria.map(criterion => (
                  <div
                    key={criterion.id}
                    className="overflow-hidden rounded-lg border"
                  >
                    <div className="border-b bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{criterion.name}</h4>
                        <Badge variant="outline">{criterion.weight}%</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {criterion.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 divide-x md:grid-cols-4">
                      {criterion.levels
                        .sort((a, b) => b.points - a.points)
                        .map(level => (
                          <div key={level.id} className="p-4">
                            <div className="mb-3 text-center">
                              <div
                                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full font-medium text-white ${
                                  level.points === 4
                                    ? 'bg-green-500'
                                    : level.points === 3
                                      ? 'bg-blue-500'
                                      : level.points === 2
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                }`}
                              >
                                {level.points}
                              </div>
                              <h5 className="mt-2 font-medium">{level.name}</h5>
                            </div>
                            <p className="text-sm text-gray-600">
                              {level.description}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rubric Statistics */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {currentRubric.maxScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Points
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {currentRubric.criteria.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Criteria</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {currentRubric.criteria.reduce(
                      (sum, c) => sum + c.levels.length,
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Levels
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {currentRubric.criteria.reduce(
                      (sum, c) => sum + c.weight,
                      0
                    )}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Weight
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Rubric State */}
      {!currentRubric && !isCreatingNew && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Rubric Configured</h3>
            <p className="mb-6 text-muted-foreground">
              {gradingMethod === 'automatic'
                ? 'This assessment uses automatic grading. A rubric is optional but can help provide consistent feedback.'
                : 'Create a rubric to ensure consistent and fair grading of student submissions.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setIsCreatingNew(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Rubric
              </Button>
              {gradingMethod === 'automatic' && (
                <Button variant="outline" onClick={() => onUpdate(undefined)}>
                  Continue Without Rubric
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rubric Summary Card */}
      {currentRubric && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rubric Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Overall Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Overall Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{currentRubric.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Score:</span>
                    <span className="font-medium">
                      {currentRubric.maxScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Criteria:</span>
                    <span className="font-medium">
                      {currentRubric.criteria.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Weight:</span>
                    <span className="font-medium">
                      {Math.round(
                        currentRubric.criteria.reduce(
                          (sum, c) => sum + c.weight,
                          0
                        )
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Criteria Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Criteria Weights</h4>
                <div className="space-y-2">
                  {currentRubric.criteria.map(criterion => (
                    <div
                      key={criterion.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="mr-2 truncate text-muted-foreground">
                        {criterion.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${criterion.weight}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-medium">
                          {Math.round(criterion.weight)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Levels */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Performance Levels</h4>
                <div className="space-y-2">
                  {currentRubric.criteria.length > 0 &&
                    currentRubric.criteria[0].levels
                      .sort((a, b) => b.points - a.points)
                      .map(level => (
                        <div
                          key={level.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white ${
                              level.points === 4
                                ? 'bg-green-500'
                                : level.points === 3
                                  ? 'bg-blue-500'
                                  : level.points === 2
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                            }`}
                          >
                            {level.points}
                          </div>
                          <span className="flex-1">{level.name}</span>
                        </div>
                      ))}
                </div>
              </div>
            </div>

            {/* Validation Warnings */}
            <div className="mt-6 space-y-2">
              {Math.round(
                currentRubric.criteria.reduce((sum, c) => sum + c.weight, 0)
              ) !== 100 && (
                <div className="flex items-center gap-2 rounded bg-amber-50 p-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Warning: Criteria weights don't add up to 100%</span>
                </div>
              )}

              {currentRubric.criteria.some(c => !c.description.trim()) && (
                <div className="flex items-center gap-2 rounded bg-blue-50 p-2 text-sm text-blue-600">
                  <Info className="h-4 w-4" />
                  <span>
                    Tip: Add descriptions to criteria for better clarity
                  </span>
                </div>
              )}

              {currentRubric.criteria.some(c =>
                c.levels.some(l => !l.description.trim())
              ) && (
                <div className="flex items-center gap-2 rounded bg-blue-50 p-2 text-sm text-blue-600">
                  <Info className="h-4 w-4" />
                  <span>
                    Tip: Add descriptions to performance levels for consistency
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Step 5 of 5: Grading Rubric
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${currentRubric ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={currentRubric ? 'text-green-700' : 'text-gray-500'}
                >
                  {currentRubric ? 'Rubric Configured' : 'No Rubric'}
                </span>
              </div>
              {currentRubric && (
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      Math.round(
                        currentRubric.criteria.reduce(
                          (sum, c) => sum + c.weight,
                          0
                        )
                      ) === 100
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <span
                    className={
                      Math.round(
                        currentRubric.criteria.reduce(
                          (sum, c) => sum + c.weight,
                          0
                        )
                      ) === 100
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }
                  >
                    Weights{' '}
                    {Math.round(
                      currentRubric.criteria.reduce(
                        (sum, c) => sum + c.weight,
                        0
                      )
                    ) === 100
                      ? 'Balanced'
                      : 'Unbalanced'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {Object.keys(errors).some(key => key.startsWith('rubric')) && (
        <div className="space-y-2">
          {Object.entries(errors)
            .filter(([key]) => key.startsWith('rubric'))
            .map(([key, error]) => (
              <div
                key={key}
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
