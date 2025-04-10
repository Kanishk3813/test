// src/app/components/lesson/LessonSection.tsx
'use client';

interface LessonSectionProps {
  title: string;
  content: React.ReactNode;
}

export function LessonSection({ title, content }: LessonSectionProps) {
  return (
    <div className="lesson-section">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="ml-1">{content}</div>
    </div>
  );
}