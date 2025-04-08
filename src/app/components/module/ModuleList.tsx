// src/app/components/module/ModuleList.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getUserModules, deleteModule } from '@/lib/moduleService';
import { Module } from '@/lib/types';
import Link from 'next/link';

export default function ModuleList() {
  const { currentUser } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userModules = await getUserModules(currentUser.id);
        setModules(userModules);
        setError(null);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError('Failed to load modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [currentUser]);

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all lessons within the module.')) {
      return;
    }

    try {
      await deleteModule(moduleId);
      setModules(modules.filter(module => module.id !== moduleId));
      alert('Module deleted successfully!');
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module. Please try again.');
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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-4">No modules yet</h3>
        <p className="text-gray-500 mb-6">Create your first module to start organizing your course content.</p>
        <Link 
          href="/modules/create" 
          className="inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
        >
          Create Module
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Modules</h2>
        <Link 
          href="/modules/create" 
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
        >
          Create Module
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{module.title}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {module.difficultyLevel}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>
              
              <div className="flex items-center mb-4 text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{module.estimatedCompletionTime || 0} minutes</span>
                
                <svg className="w-4 h-4 ml-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span>{Array.isArray(module.lessons) ? module.lessons.length : 0} lessons</span>
              </div>
              
              <div className="flex space-x-2">
                <Link 
                  href={`/modules/${module.id}`}
                  className="flex-1 py-2 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition duration-200"
                >
                  View Module
                </Link>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="py-2 px-3 text-sm bg-red-100 hover:bg-red-200 text-red-600 font-medium rounded-md transition duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}