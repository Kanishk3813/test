// src/app/components/lesson/LessonDisplay.tsx
'use client';

import { Lesson } from '@/lib/types';
import { LessonSection } from './LessonSection';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface LessonDisplayProps {
  lesson: Lesson;
}

export function LessonDisplay({ lesson }: LessonDisplayProps) {
  const [activeTab, setActiveTab] = useState<string>('preview');
  
  const handleDownload = () => {
    // Create a formatted lesson text
    const lessonText = `# ${lesson.title}

## Description
${lesson.description}

## Learning Outcomes
${lesson.learningOutcomes.map(outcome => `- ${outcome}`).join('\n')}

## Key Concepts
${lesson.keyConcepts.map(concept => `- ${concept.term}: ${concept.definition}`).join('\n')}

## Content
${lesson.content}

## Activities
${lesson.activities.map(activity => `### ${activity.title}\n${activity.instructions}`).join('\n\n')}

## Assessment
${lesson.assessment}
`;

    // Create blob and download link
    const blob = new Blob([lessonText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lesson-display">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Generated Lesson</h2>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-md p-1 flex mb-6">
        <button 
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'preview' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button 
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'structure' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('structure')}
        >
          Lesson Structure
        </button>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-gray-700">{lesson.description}</p>
          </div>

          <LessonSection 
            title="Learning Outcomes" 
            content={
              <ul className="list-disc pl-5 space-y-1">
                {lesson.learningOutcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            }
          />

          <LessonSection 
            title="Key Concepts" 
            content={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.keyConcepts.map((concept, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-1">{concept.term}</h4>
                    <p className="text-sm text-gray-700">{concept.definition}</p>
                  </div>
                ))}
              </div>
            }
          />

          <LessonSection 
            title="Content" 
            content={
              <div className="prose max-w-none">
                {lesson.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            }
          />

          <LessonSection 
            title="Activities" 
            content={
              <div className="space-y-6">
                {lesson.activities.map((activity, index) => (
                  <div key={index} className="bg-green-50 p-5 rounded-md">
                    <h4 className="text-lg font-semibold mb-2">{activity.title}</h4>
                    <div className="prose max-w-none text-gray-700">
                      {activity.instructions.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="mb-2">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          />

          <LessonSection 
            title="Assessment" 
            content={
              <div className="bg-purple-50 p-5 rounded-md">
                <div className="prose max-w-none">
                  {lesson.assessment.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-gray-200 p-4">
            <h3 className="font-medium mb-2">Lesson Structure Overview</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                <span>Title &amp; Description</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                <span>Learning Outcomes ({lesson.learningOutcomes.length})</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
                <span>Key Concepts ({lesson.keyConcepts.length})</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                <span>Content ({lesson.content.split('\n\n').length} paragraphs)</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                <span>Activities ({lesson.activities.length})</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-pink-500 mr-2"></span>
                <span>Assessment</span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="font-medium mb-2">Target Audience</h3>
              <p className="text-gray-700">{lesson.targetAudience}</p>
            </div>
            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="font-medium mb-2">Difficulty Level</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ 
                      width: lesson.difficultyLevel === 'beginner' ? '33%' : 
                             lesson.difficultyLevel === 'intermediate' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium capitalize">{lesson.difficultyLevel}</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border border-gray-200 p-4">
            <h3 className="font-medium mb-2">Content Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(lesson.keyConcepts.map(c => c.term))].map((term, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}