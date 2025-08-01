import { AssessmentBuilder } from '@/components/teacher/assessment/AssessmentBuilder';

export default function CreateAssessmentPage({
  searchParams,
}: {
  searchParams: { courseId?: string; lessonId?: string };
}) {
  return (
    <div className="container mx-auto py-6">
      <AssessmentBuilder
        mode="create"
        courseId={searchParams.courseId}
        lessonId={searchParams.lessonId}
      />
    </div>
  );
}
