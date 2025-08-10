import { AssessmentBuilder } from '@/components/teacher/assessment/AssessmentBuilder';

interface DuplicateAssessmentPageProps {
  params: {
    id: string;
  };
}

export default function DuplicateAssessmentPage({
  params,
}: DuplicateAssessmentPageProps) {
  return (
    <div className="container mx-auto py-6">
      <AssessmentBuilder mode="duplicate" assessmentId={params.id} />
    </div>
  );
}
