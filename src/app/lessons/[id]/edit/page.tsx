// src/app/lessons/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById, updateLesson } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';

export default function EditLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      if (!id || typeof id !== 'string') {
        setError('Invalid lesson ID');
        setIsLoading(false);
        return;
      }

      try {
        const lessonData = await getLessonById(id);
        if (lessonData) {
          setLesson(lessonData);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLesson();
  }, [id]);

  const handleSave = async (updatedLesson: Lesson) => {
    if (!id || typeof id !== 'string') {
      setError('Invalid lesson ID');
      return;
    }

    try {
      setIsSaving(true);
      await updateLesson(id, updatedLesson);
      alert('Lesson updated successfully!');
      router.push(`/lessons/${id}`);
    } catch (err) {
      console.error('Error updating lesson:', err);
      setError('Failed to update lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">{error || 'Lesson not found'}</h2>
          <p className="mb-4">The lesson you're looking for could not be found or there was an error loading it.</p>
          <Link href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/lessons/${id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Lesson
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Edit Lesson: {lesson.title}</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6 mb-6">
        <p>Editor functionality would be implemented here. This would be a form that allows editing all lesson properties.</p>
      </div>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push(`/lessons/${id}`)}>
          Cancel
        </Button>
        <Button onClick={() => handleSave(lesson)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}