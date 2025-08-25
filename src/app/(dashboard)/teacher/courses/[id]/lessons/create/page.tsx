'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Video,
  FileText,
  Upload,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function CreateLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'video',
    sectionId: '',
    duration: 0,
    isPreview: false,
    resources: [],
  });

  const handleSave = () => {
    // TODO: Implement lesson creation logic
    console.log('Creating lesson:', lessonData);
    router.push(`/teacher/courses/${courseId}/lessons`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/teacher/courses/${courseId}/lessons`)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Create New Lesson</h1>
                <p className="text-slate-600">Add a lesson to this course</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push(`/teacher/courses/${courseId}/lessons`)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-500 to-green-600">
                <Save className="mr-2 h-4 w-4" />
                Create Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={lessonData.title}
                    onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter lesson title..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={lessonData.description}
                    onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter lesson description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Lesson Type</Label>
                    <Select
                      value={lessonData.type}
                      onValueChange={(value) => setLessonData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={lessonData.duration}
                      onChange={(e) => setLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessonData.type === 'video' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Video className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">Upload Video</h3>
                    <p className="text-slate-500 mb-4">
                      Upload your lesson video or provide a video URL
                    </p>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Video File
                    </Button>
                  </div>
                )}

                {lessonData.type === 'text' && (
                  <div>
                    <Label htmlFor="content">Lesson Content</Label>
                    <Textarea
                      id="content"
                      value={lessonData.content}
                      onChange={(e) => setLessonData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your lesson content..."
                      rows={10}
                    />
                  </div>
                )}

                {lessonData.type === 'exercise' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">Exercise Content</h3>
                    <p className="text-slate-500 mb-4">
                      Upload exercise files or create interactive content
                    </p>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Settings */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle>Lesson Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="section">Course Section</Label>
                  <Select
                    value={lessonData.sectionId}
                    onValueChange={(value) => setLessonData(prev => ({ ...prev, sectionId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Introduction</SelectItem>
                      <SelectItem value="2">Getting Started</SelectItem>
                      <SelectItem value="3">Advanced Topics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="preview">Preview Lesson</Label>
                  <Switch
                    id="preview"
                    checked={lessonData.isPreview}
                    onCheckedChange={(checked) => setLessonData(prev => ({ ...prev, isPreview: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-500 mb-4">No resources added yet</p>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}