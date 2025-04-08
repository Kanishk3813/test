// src/app/components/lesson/LessonForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface LessonFormProps {
  onSubmit: (formData: {
    courseTopic: string;
    lessonTitle: string;
    targetAudience: string;
    difficultyLevel: string;
    additionalInstructions: string;
  }) => void;
  isLoading: boolean;
}

export function LessonForm({ onSubmit, isLoading }: LessonFormProps) {
  const [formData, setFormData] = useState({
    courseTopic: '',
    lessonTitle: '',
    targetAudience: '',
    difficultyLevel: 'intermediate',
    additionalInstructions: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">Create New Lesson</h2>
      
      <div className="mb-6">
        <label htmlFor="courseTopic" className="block mb-2 text-sm font-medium text-gray-700">
          Course Topic <span className="text-red-500">*</span>
        </label>
        <Input
          id="courseTopic"
          name="courseTopic"
          type="text"
          placeholder="E.g., Introduction to Data Science"
          value={formData.courseTopic}
          onChange={handleChange}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          The main subject of your course
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="lessonTitle" className="block mb-2 text-sm font-medium text-gray-700">
          Lesson Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="lessonTitle"
          name="lessonTitle"
          type="text"
          placeholder="E.g., Understanding Data Visualization"
          value={formData.lessonTitle}
          onChange={handleChange}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          The specific topic for this lesson
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="targetAudience" className="block mb-2 text-sm font-medium text-gray-700">
          Target Audience <span className="text-red-500">*</span>
        </label>
        <Input
          id="targetAudience"
          name="targetAudience"
          type="text"
          placeholder="E.g., Undergraduate computer science students"
          value={formData.targetAudience}
          onChange={handleChange}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Who will be taking this course
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="difficultyLevel" className="block mb-2 text-sm font-medium text-gray-700">
          Difficulty Level <span className="text-red-500">*</span>
        </label>
        <select
          id="difficultyLevel"
          name="difficultyLevel"
          value={formData.difficultyLevel}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label htmlFor="additionalInstructions" className="block mb-2 text-sm font-medium text-gray-700">
          Additional Instructions
        </label>
        <Textarea
          id="additionalInstructions"
          name="additionalInstructions"
          placeholder="Add any specific requirements or focus areas for this lesson"
          value={formData.additionalInstructions}
          onChange={handleChange}
          rows={4}
        />
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Lesson'}
      </Button>
    </form>
  );
}