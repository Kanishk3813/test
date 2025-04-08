// src/app/components/lesson/LessonSection.tsx
import { ReactNode } from 'react';

interface LessonSectionProps {
  title: string;
  content: ReactNode;
}

export function LessonSection({ title, content }: LessonSectionProps) {
  return (
    <section className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {content}
    </section>
  );
}