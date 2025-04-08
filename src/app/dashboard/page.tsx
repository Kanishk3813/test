// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  // Sample data for demonstration
  const [recentLessons] = useState([
    {
      id: '1',
      title: 'Introduction to JavaScript',
      description: 'A beginner-friendly introduction to JavaScript programming language',
      createdAt: '2025-03-28T10:30:00Z',
      module: 'Web Development Fundamentals'
    },
    {
      id: '2',
      title: 'Data Structures Basics',
      description: 'Learn about arrays, linked lists, stacks, and queues',
      createdAt: '2025-04-01T14:45:00Z',
      module: 'Computer Science 101'
    },
    {
      id: '3',
      title: 'CSS Grid Layout',
      description: 'Master advanced layout techniques with CSS Grid',
      createdAt: '2025-04-05T09:15:00Z',
      module: 'Web Development Fundamentals'
    }
  ]);

  const [modules] = useState([
    {
      id: '1',
      title: 'Web Development Fundamentals',
      lessonCount: 8,
      completionPercentage: 75
    },
    {
      id: '2',
      title: 'Computer Science 101',
      lessonCount: 12,
      completionPercentage: 25
    },
    {
      id: '3',
      title: 'Data Science Essentials',
      lessonCount: 6,
      completionPercentage: 0
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600">Manage your courses and lessons</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/lesson-generator">
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New Lesson
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold mb-1">Total Lessons</h3>
          <p className="text-3xl font-bold">{recentLessons.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold mb-1">Total Modules</h3>
          <p className="text-3xl font-bold">{modules.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-1">Completion Rate</h3>
          <p className="text-3xl font-bold">
            {Math.round(
              modules.reduce((acc, module) => acc + module.completionPercentage, 0) / modules.length
            )}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Lessons</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </a>
          </div>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {lesson.module}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-sm text-gray-500">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                    <div className="mt-2">
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        Edit
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Course Modules</h2>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Create Module
            </a>
          </div>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {modules.map((module) => (
              <div key={module.id} className="p-4 hover:bg-gray-50">
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <span className="text-sm text-gray-500">{module.lessonCount} lessons</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${module.completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{module.completionPercentage}% complete</span>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}