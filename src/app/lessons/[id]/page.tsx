// src/app/lessons/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllLessons, getLessonById } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import { LessonDisplay } from '@/app/components/lesson/LessonDisplay';
import Link from 'next/link';

export default function LessonViewPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      if (!id || typeof id !== 'string') {
        setError('Invalid lesson ID');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching lesson with ID:', id);
        
        let lessonData = await getLessonById(id);
        
        if (!lessonData) {
          if (id.includes('_')) {
            const baseId = id.split('_')[0];
            console.log('Trying with base ID:', baseId);
            lessonData = await getLessonById(baseId);
          }
          
          if (!lessonData) {
            console.log('Trying to find lesson by scanning all lessons');
            const allLessons = await getAllLessons();
            
            const foundLesson = allLessons.find(lesson => {
              return lesson.id && 
                (lesson.id.includes(id) || 
                 id.includes(lesson.id) ||
                 (id.startsWith('lesson_') && lesson.id === id.substring(7)));
            });
            
            if (foundLesson) {
              console.log('Found lesson by alternative matching:', foundLesson.id);
              lessonData = foundLesson;
            }
          }
        }
        
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
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
              Return to Dashboard
            </Link>
            <button 
              onClick={() => router.refresh()}
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                router.back();
              }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <Link 
          href={`/lessons/${lesson.id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit Lesson
        </Link>
      </div>
      
      <LessonDisplay lesson={lesson} viewOnly={true} />
    </div>
  );
}