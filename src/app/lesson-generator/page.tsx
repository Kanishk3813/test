// src/app/lesson-generator/page.tsx
'use client';

import { useState } from 'react';
import { LessonForm } from '../components/lesson/LessonForm';
import { LessonDisplay } from '../components/lesson/LessonDisplay';
import { Lesson } from '@/lib/types';

export default function LessonGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLesson = async (formData: {
    courseTopic: string;
    lessonTitle: string;
    targetAudience: string;
    difficultyLevel: string;
    additionalInstructions: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const lessonData = await response.json();
      setGeneratedLesson(lessonData);
    } catch (err) {
      console.error('Failed to generate lesson:', err);
      setError('Failed to generate lesson. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CourseGPT Lesson Generator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <LessonForm onSubmit={handleGenerateLesson} isLoading={isLoading} />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Generating lesson content...</p>
              </div>
            ) : generatedLesson ? (
              <LessonDisplay lesson={generatedLesson} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m0 16v1m-9-9h1m16 0h1m-5.172-6.828l-.707-.707M5.172 7.172l-.707-.707M19.535 16.828l-.707.707M5.172 16.828l-.707.707"></path>
                </svg>
                <h3 className="text-xl font-semibold mb-2">No Lesson Generated Yet</h3>
                <p>Fill out the form to generate your first AI-powered lesson</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}