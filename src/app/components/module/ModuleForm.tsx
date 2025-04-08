// src/app/components/module/ModuleForm.tsx
"use client"
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createModule } from '@/lib/moduleService';
import { Module } from '@/lib/types';

interface ModuleFormProps {
  onModuleCreated?: (module: Module) => void;
  courseId?: string;
}

export default function ModuleForm({ onModuleCreated, courseId }: ModuleFormProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(60); // Default 60 minutes
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to create modules');
      return;
    }
    
    setLoading(true);
    
    try {
      const moduleData: any = {
        title,
        description,
        difficultyLevel,
        learningOutcomes: learningOutcomes.split('\n').filter(outcome => outcome.trim() !== ''),
        estimatedCompletionTime: estimatedTime,
        author: currentUser.id,
        status: 'draft' as const,
        order: 0,
        lessons: []
      };
      
      // Only add courseId to moduleData if it's defined
      if (courseId) {
        moduleData.courseId = courseId;
      }
      
      const module = await createModule(moduleData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDifficultyLevel('intermediate');
      setLearningOutcomes('');
      setEstimatedTime(60);
      
      if (onModuleCreated) {
        onModuleCreated(module);
      }
      
      alert('Module created successfully!');
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Failed to create module. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Module</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Module Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty Level
          </label>
          <select
            id="difficultyLevel"
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="learningOutcomes" className="block text-sm font-medium text-gray-700 mb-1">
            Learning Outcomes (one per line)
          </label>
          <textarea
            id="learningOutcomes"
            value={learningOutcomes}
            onChange={(e) => setLearningOutcomes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="After completing this module, students will be able to..."
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Completion Time (minutes)
          </label>
          <input
            type="number"
            id="estimatedTime"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Module'
          )}
        </button>
      </form>
    </div>
  );
}