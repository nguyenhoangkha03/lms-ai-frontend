'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Save } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { useCreateGradebookMutation } from '@/lib/redux/api/gradebook-api';

const gradebookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  courseId: z.string().min(1, 'Course is required'),
  gradingScale: z.object({
    type: z.enum(['letter', 'percentage', 'points']),
    ranges: z.array(
      z.object({
        grade: z.string(),
        minPercent: z.number(),
        maxPercent: z.number(),
      })
    ),
  }),
  passingThreshold: z.number().min(0).max(100),
  allowLateSubmissions: z.boolean(),
  latePenaltyPercentage: z.number().min(0).max(100),
});

type GradebookFormData = z.infer<typeof gradebookSchema>;

interface GradebookCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultGradingScales = {
  letter: [
    { grade: 'A', minPercent: 90, maxPercent: 100 },
    { grade: 'B', minPercent: 80, maxPercent: 89 },
    { grade: 'C', minPercent: 70, maxPercent: 79 },
    { grade: 'D', minPercent: 60, maxPercent: 69 },
    { grade: 'F', minPercent: 0, maxPercent: 59 },
  ],
  percentage: [
    { grade: '90-100%', minPercent: 90, maxPercent: 100 },
    { grade: '80-89%', minPercent: 80, maxPercent: 89 },
    { grade: '70-79%', minPercent: 70, maxPercent: 79 },
    { grade: '60-69%', minPercent: 60, maxPercent: 69 },
    { grade: '0-59%', minPercent: 0, maxPercent: 59 },
  ],
  points: [
    { grade: 'Excellent', minPercent: 90, maxPercent: 100 },
    { grade: 'Good', minPercent: 80, maxPercent: 89 },
    { grade: 'Satisfactory', minPercent: 70, maxPercent: 79 },
    { grade: 'Needs Improvement', minPercent: 60, maxPercent: 69 },
    { grade: 'Unsatisfactory', minPercent: 0, maxPercent: 59 },
  ],
};

export function GradebookCreationDialog({
  open,
  onClose,
  onSuccess,
}: GradebookCreationDialogProps) {
  const { toast } = useToast();
  const [createGradebook, { isLoading }] = useCreateGradebookMutation();

  const form = useForm<GradebookFormData>({
    resolver: zodResolver(gradebookSchema),
    defaultValues: {
      name: '',
      description: '',
      courseId: '',
      gradingScale: {
        type: 'letter',
        ranges: defaultGradingScales.letter,
      },
      passingThreshold: 70,
      allowLateSubmissions: true,
      latePenaltyPercentage: 10,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedScaleType = watch('gradingScale.type');
  const gradingRanges = watch('gradingScale.ranges');

  const handleScaleTypeChange = (type: 'letter' | 'percentage' | 'points') => {
    setValue('gradingScale.type', type);
    setValue('gradingScale.ranges', defaultGradingScales[type]);
  };

  const addGradingRange = () => {
    const newRange = {
      grade: '',
      minPercent: 0,
      maxPercent: 0,
    };
    setValue('gradingScale.ranges', [...(gradingRanges || []), newRange]);
  };

  const removeGradingRange = (index: number) => {
    const updatedRanges = gradingRanges?.filter((_, i) => i !== index);
    setValue('gradingScale.ranges', updatedRanges || []);
  };

  const updateGradingRange = (index: number, field: string, value: any) => {
    const updatedRanges = [...(gradingRanges || [])];
    updatedRanges[index] = { ...updatedRanges[index], [field]: value };
    setValue('gradingScale.ranges', updatedRanges);
  };

  const onSubmit = async (data: GradebookFormData) => {
    try {
      await createGradebook(data).unwrap();
      toast({
        title: 'Gradebook Created',
        description: 'New gradebook has been created successfully.',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create gradebook. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Gradebook</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Gradebook Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter gradebook name..."
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter gradebook description..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="courseId">Course</Label>
              <Select onValueChange={value => setValue('courseId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {/* Mock courses - in real implementation, this would come from API */}
                  <SelectItem value="course-1">Mathematics 101</SelectItem>
                  <SelectItem value="course-2">Physics 201</SelectItem>
                  <SelectItem value="course-3">Chemistry 101</SelectItem>
                </SelectContent>
              </Select>
              {errors.courseId && (
                <p className="text-sm text-red-500">
                  {errors.courseId.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Grading Scale */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Grading Scale</h3>

            <div>
              <Label>Scale Type</Label>
              <Select
                value={selectedScaleType}
                onValueChange={handleScaleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">
                    Letter Grades (A, B, C, D, F)
                  </SelectItem>
                  <SelectItem value="percentage">Percentage Ranges</SelectItem>
                  <SelectItem value="points">Point-based Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Grade Ranges</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGradingRange}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Range
                </Button>
              </div>

              {gradingRanges?.map((range, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Input
                    placeholder="Grade"
                    value={range.grade}
                    onChange={e =>
                      updateGradingRange(index, 'grade', e.target.value)
                    }
                    className="w-24"
                  />
                  <Input
                    type="number"
                    placeholder="Min %"
                    value={range.minPercent}
                    onChange={e =>
                      updateGradingRange(
                        index,
                        'minPercent',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    placeholder="Max %"
                    value={range.maxPercent}
                    onChange={e =>
                      updateGradingRange(
                        index,
                        'maxPercent',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGradingRange(index)}
                    disabled={gradingRanges.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Settings</h3>

            <div>
              <Label htmlFor="passingThreshold">Passing Threshold (%)</Label>
              <Input
                id="passingThreshold"
                type="number"
                min="0"
                max="100"
                {...register('passingThreshold', { valueAsNumber: true })}
              />
              {errors.passingThreshold && (
                <p className="text-sm text-red-500">
                  {errors.passingThreshold.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Late Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to submit work after the deadline
                </p>
              </div>
              <Switch
                checked={watch('allowLateSubmissions')}
                onCheckedChange={checked =>
                  setValue('allowLateSubmissions', checked)
                }
              />
            </div>

            {watch('allowLateSubmissions') && (
              <div>
                <Label htmlFor="latePenaltyPercentage">Late Penalty (%)</Label>
                <Input
                  id="latePenaltyPercentage"
                  type="number"
                  min="0"
                  max="100"
                  {...register('latePenaltyPercentage', {
                    valueAsNumber: true,
                  })}
                />
                {errors.latePenaltyPercentage && (
                  <p className="text-sm text-red-500">
                    {errors.latePenaltyPercentage.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Gradebook'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
