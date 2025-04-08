// src/app/components/module/ModuleDetail.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { getModule, suggestLessonSequence, reorderLessons, deleteLesson } from '@/lib/moduleService';
import { Module, Lesson } from '@/lib/types';
import Link from 'next/link';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ModuleDetailProps {
  moduleId: string;
}

// Draggable Lesson Item Component
interface LessonItemProps {
  lesson: Lesson;
  index: number;
  moveLesson: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (lessonId: string) => void;
}

type DragItem = {
    type: string;
    id: string;
    index: number;
  };

  const LessonItem: React.FC<LessonItemProps> = ({ lesson, index, moveLesson, onDelete }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    
    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | null }>({
      accept: 'lesson',
      collect: (monitor) => ({
        handlerId: monitor.getHandlerId() as string | null,
      }),
      hover: (item: DragItem, monitor) => {
        if (!ref.current) return;
        
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
  
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        
        if (!clientOffset) return;
        
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
  
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
  
        moveLesson(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
  
    const [{ isDragging }, drag] = useDrag({
        type: 'lesson',
        item: () => ({
          type: 'lesson',
          id: lesson.id,
          index,
        }),
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      });
  
    drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 cursor-move border border-gray-200 hover:border-blue-300 transition-colors ${isDragging ? 'opacity-40' : ''}`}
      data-handler-id={handlerId}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{lesson.title}</h4>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {lesson.difficultyLevel}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {lesson.estimatedTime ? `${lesson.estimatedTime} min` : 'Duration not set'}
        </span>
        
        <div className="flex space-x-2">
          <Link
            href={`/lessons/${lesson.id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lesson.id);
            }}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ModuleDetail({ moduleId }: ModuleDetailProps) {
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const moduleData = await getModule(moduleId);
        setModule(moduleData);
        
        if (moduleData) {
          // Extract or fetch lessons
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            if (typeof moduleData.lessons[0] === 'string') {
              // Lessons are already fetched in getModule
              setLessons([]);
            } else {
              setLessons(moduleData.lessons as Lesson[]);
            }
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching module:', err);
        setError('Failed to load module details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchModule();
  }, [moduleId]);
  
  const suggestSequence = async () => {
    try {
      const suggestedOrder = await suggestLessonSequence(moduleId);
      setLessons(suggestedOrder);
      
      // Save the new order to the database
      if (suggestedOrder.length > 0) {
        await reorderLessons(moduleId, suggestedOrder.map(lesson => lesson.id));
      }
      
      alert('Lessons have been reordered based on suggested sequence!');
    } catch (err) {
      console.error('Error suggesting sequence:', err);
      alert('Failed to suggest sequence. Please try again.');
    }
  };
  
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      alert('Lesson deleted successfully!');
    } catch (err) {
      console.error('Error deleting lesson:', err);
      alert('Failed to delete lesson. Please try again.');
    }
  };
  
  const moveLesson = async (dragIndex: number, hoverIndex: number) => {
    const draggedLesson = lessons[dragIndex];
    if (!draggedLesson) return;
    
    // Update the local state for immediate UI feedback
    const updatedLessons = [...lessons];
    updatedLessons.splice(dragIndex, 1);
    updatedLessons.splice(hoverIndex, 0, draggedLesson);
    
    setLessons(updatedLessons);
    
    // Persist the new order to the database
    try {
      await reorderLessons(moduleId, updatedLessons.map(lesson => lesson.id));
    } catch (err) {
      console.error('Error updating lesson order:', err);
      // Revert back to original order in case of error
      setLessons(lessons);
      alert('Failed to update lesson order. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (error || !module) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error || 'Module not found'}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{module.title}</h1>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {module.difficultyLevel}
          </span>
        </div>
        
        <p className="text-gray-600 mb-6">{module.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Learning Outcomes</h3>
            {module.learningOutcomes && module.learningOutcomes.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {module.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="text-gray-600">{outcome}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No learning outcomes defined</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Module Details</h3>
            <div className="text-sm space-y-2">
              <p className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Estimated time: {module.estimatedCompletionTime || 0} minutes</span>
              </p>
              <p className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span>Lessons: {lessons.length}</span>
              </p>
              <p className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Last updated: {new Date(module.updatedAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/modules/${moduleId}/edit`}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Edit Module
          </Link>
          <Link
            href={`/modules/${moduleId}/lesson/create`}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200"
          >
            Add Lesson
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Lessons</h2>
          <button
            onClick={suggestSequence}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            Suggest Sequence
          </button>
        </div>
        
        {lessons.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new lesson.</p>
            <div className="mt-6">
              <Link
                href={`/modules/${moduleId}/lesson/create`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create Lesson
              </Link>
            </div>
          </div>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  moveLesson={moveLesson}
                  onDelete={handleDeleteLesson}
                />
              ))}
            </div>
          </DndProvider>
        )}
      </div>
    </div>
  );
}