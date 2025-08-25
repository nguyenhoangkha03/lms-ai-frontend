'use client';

import { AssessmentBuilder } from '@/components/teacher/assessment/AssessmentBuilder';
import { useParams } from 'next/navigation';

export default function CreateAssessmentPage() {
  const params = useParams();
  const courseId = params.id as string;
  return (
    <div className="container mx-auto py-6">
      <AssessmentBuilder
        mode="create"
        courseId={courseId}
        // lessonId={searchParams.lessonId}
      />
    </div>
  );
}
