// src/app/lessons/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById, updateLesson } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { auth } from '../../../../lib/firebase';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'explanation' | 'exercise' | 'conclusion' | 'other';
}

export default function EditLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState<boolean>(false);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);
  const [regenerationPrompt, setRegenerationPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'content' | 'outcomes' | 'concepts' | 'activities' | 'assessment'>('content');

  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  
  const [keyConcepts, setKeyConcepts] = useState<{term: string; definition: string}[]>([]);
  
  const [activities, setActivities] = useState<{title: string; instructions: string}[]>([]);

  useEffect(() => {
    async function fetchLesson() {
      if (!id || typeof id !== 'string') {
        setError('Invalid lesson ID');
        setIsLoading(false);
        return;
      }
      
      const currentUser = auth.currentUser;
      
      if (!currentUser || !currentUser.uid) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching lesson with ID:", id);
        const lessonData = await getLessonById(id, currentUser.uid);
        console.log("Lesson data received:", lessonData);
        
        if (lessonData) {
          setLesson(lessonData);
          
          setLearningOutcomes(lessonData.learningOutcomes || []);
          
          setKeyConcepts(lessonData.keyConcepts || []);
          
          setActivities(lessonData.activities || []);
          
          if (lessonData.content) {
            const contentParts = lessonData.content.split('\n\n');
            const sections: ContentSection[] = [];
            
            if (contentParts.length > 0) {
              sections.push({
                id: 'intro',
                title: 'Introduction',
                content: contentParts[0],
                type: 'introduction'
              });
              
              for (let i = 1; i < contentParts.length - 1; i++) {
                sections.push({
                  id: `section-${i}`,
                  title: `Section ${i}`,
                  content: contentParts[i],
                  type: i % 3 === 0 ? 'exercise' : 'explanation'
                });
              }
              
              if (contentParts.length > 1) {
                sections.push({
                  id: 'conclusion',
                  title: 'Conclusion',
                  content: contentParts[contentParts.length - 1],
                  type: 'conclusion'
                });
              }
            } else {
              sections.push({
                id: 'intro',
                title: 'Introduction',
                content: lessonData.content,
                type: 'introduction'
              });
            }
            
            setContentSections(sections);
          } else {
            setContentSections([
              {
                id: 'intro',
                title: 'Introduction',
                content: '',
                type: 'introduction'
              },
              {
                id: 'content',
                title: 'Main Content',
                content: '',
                type: 'explanation'
              },
              {
                id: 'conclusion',
                title: 'Conclusion',
                content: '',
                type: 'conclusion'
              }
            ]);
          }
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

  const handleSectionChange = (sectionId: string, field: 'title' | 'content' | 'type', value: string) => {
    setContentSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const handleAddSection = (type: 'introduction' | 'explanation' | 'exercise' | 'conclusion' | 'other') => {
    const newId = `section-${Date.now()}`;
    const typeNames = {
      introduction: 'Introduction',
      explanation: 'Explanation',
      exercise: 'Exercise',
      conclusion: 'Conclusion',
      other: 'Section'
    };
    
    setContentSections(prevSections => [
      ...prevSections, 
      {
        id: newId,
        title: `New ${typeNames[type]}`,
        content: '',
        type
      }
    ]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setContentSections(prevSections => prevSections.filter(section => section.id !== sectionId));
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setContentSections(prevSections => {
      const index = prevSections.findIndex(section => section.id === sectionId);
      if (index === -1) return prevSections;
      
      const newSections = [...prevSections];
      
      if (direction === 'up' && index > 0) {
        [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      
      return newSections;
    });
  };

  const regenerateSection = async (sectionId: string) => {
    setRegeneratingSectionId(sectionId);
    setShowReplaceModal(true);
  };

  const handleRegenerateConfirm = async () => {
    if (!regeneratingSectionId) return;
    
    const sectionIndex = contentSections.findIndex(s => s.id === regeneratingSectionId);
    if (sectionIndex !== -1) {
      const section = contentSections[sectionIndex];
      
      const regeneratedContent = regenerationPrompt ? 
        `Regenerated content based on prompt: "${regenerationPrompt}".\n\n${section.content}` : 
        `Improved version of: ${section.content}`;
      
      setContentSections(prevSections => 
        prevSections.map(s => 
          s.id === regeneratingSectionId ? { ...s, content: regeneratedContent } : s
        )
      );
    }
    
    setShowReplaceModal(false);
    setRegeneratingSectionId(null);
    setRegenerationPrompt('');
  };

  const addLearningOutcome = () => {
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const updateLearningOutcome = (index: number, value: string) => {
    const newOutcomes = [...learningOutcomes];
    newOutcomes[index] = value;
    setLearningOutcomes(newOutcomes);
  };

  const removeLearningOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const addKeyConcept = () => {
    setKeyConcepts([...keyConcepts, { term: '', definition: '' }]);
  };

  const updateKeyConcept = (index: number, field: 'term' | 'definition', value: string) => {
    const newConcepts = [...keyConcepts];
    newConcepts[index] = { ...newConcepts[index], [field]: value };
    setKeyConcepts(newConcepts);
  };

  const removeKeyConcept = (index: number) => {
    setKeyConcepts(keyConcepts.filter((_, i) => i !== index));
  };

  const addActivity = () => {
    setActivities([...activities, { title: '', instructions: '' }]);
  };

  const updateActivity = (index: number, field: 'title' | 'instructions', value: string) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setActivities(newActivities);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!lesson) {
      setError('Invalid lesson data');
      return;
    }
  
    // Get the current user
    const currentUser = auth.currentUser;
    
    if (!currentUser || !currentUser.uid) {
      setError('User not authenticated');
      return;
    }
  
    try {
      setIsSaving(true);
      
      const lessonId = lesson.id; 
      
      if (!lessonId) {
        throw new Error('Cannot update lesson: Missing lesson ID');
      }
      
      const combinedContent = contentSections.map(section => section.content).join('\n\n');
      
      const updatedLesson: Lesson = {
        ...lesson,
        content: combinedContent,
        learningOutcomes: learningOutcomes,
        keyConcepts: keyConcepts,
        activities: activities,
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Updating lesson with ID: ${lessonId}`);
      await updateLesson(lessonId, updatedLesson, currentUser.uid);
      
      alert('Lesson updated successfully!');
      router.push(`/lessons/${lessonId}`);
    } catch (err) {
      console.error('Error updating lesson:', err);
      setError(`Failed to update lesson: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Lesson: {lesson.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/lessons/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {/* Basic lesson info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lesson.title || ''}
              onChange={(e) => setLesson({...lesson, title: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <input
              type="text"
              id="targetAudience"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lesson.targetAudience || ''}
              onChange={(e) => setLesson({...lesson, targetAudience: e.target.value})}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lesson.description || ''}
            onChange={(e) => setLesson({...lesson, description: e.target.value})}
            rows={3}
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">
              Module/Course Topic
            </label>
            <input
              type="text"
              id="module"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lesson.module || lesson.courseTopic || ''}
              onChange={(e) => setLesson({...lesson, module: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lesson.difficultyLevel || 'intermediate'}
              onChange={(e) => setLesson({...lesson, difficultyLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced'})}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lesson.status || 'draft'}
              onChange={(e) => setLesson({...lesson, status: e.target.value as 'draft' | 'published'})}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('content')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('outcomes')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outcomes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Learning Outcomes
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'concepts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Key Concepts
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assessment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assessment
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Content Editor</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddSection('introduction')}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
              >
                + Introduction
              </button>
              <button
                onClick={() => handleAddSection('explanation')}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
              >
                + Explanation
              </button>
              <button
                onClick={() => handleAddSection('exercise')}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
              >
                + Exercise
              </button>
              <button
                onClick={() => handleAddSection('conclusion')}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
              >
                + Conclusion
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {contentSections.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-md mr-2">
                      {section.type}
                    </div>
                    <input
                      type="text"
                      className="font-medium text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      value={section.title}
                      onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-gray-400 hover:text-blue-600" 
                      onClick={() => handleMoveSection(section.id, 'up')}
                      disabled={index === 0}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-blue-600" 
                      onClick={() => handleMoveSection(section.id, 'down')}
                      disabled={index === contentSections.length - 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-green-600" 
                      onClick={() => regenerateSection(section.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-600" 
                      onClick={() => handleRemoveSection(section.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <select
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={section.type}
                    onChange={(e) => handleSectionChange(section.id, 'type', e.target.value as any)}
                  >
                    <option value="introduction">Introduction</option>
                    <option value="explanation">Explanation</option>
                    <option value="exercise">Exercise</option>
                    <option value="conclusion">Conclusion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Rich Text Editor */}
                <div className="bg-gray-50 rounded-md p-2 mb-2">
                  <div className="flex space-x-2 border-b border-gray-200 pb-2 mb-2">
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">B</button>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded italic">I</button>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded underline">U</button>
                    <span className="border-r border-gray-300"></span>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">H1</button>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">H2</button>
                    <span className="border-r border-gray-300"></span>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">• List</button>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">1. List</button>
                    <span className="border-r border-gray-300"></span>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">Link</button>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">Image</button>
                    <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">Code</button>
                  </div>
                  
                  <textarea
                    className="w-full min-h-[200px] p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={section.content}
                    onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Learning Outcomes Tab */}
      {activeTab === 'outcomes' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Learning Outcomes</h2>
            <button
              onClick={addLearningOutcome}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
            >
              + Add Outcome
            </button>
          </div>
          
          {learningOutcomes.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No learning outcomes defined yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-blue-50 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={outcome}
                    onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    placeholder="By the end of this lesson, students will be able to..."
                  />
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => removeLearningOutcome(index)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Key Concepts Tab */}
      {activeTab === 'concepts' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Key Concepts</h2>
            <button
              onClick={addKeyConcept}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
            >
              + Add Concept
            </button>
          </div>
          
          {keyConcepts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No key concepts defined yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keyConcepts.map((concept, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Concept {index + 1}</h3>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeKeyConcept(index)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Term
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={concept.term}
                        onChange={(e) => updateKeyConcept(index, 'term', e.target.value)}
                        placeholder="Enter term"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Definition
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={concept.definition}
                        onChange={(e) => updateKeyConcept(index, 'definition', e.target.value)}
                        placeholder="Enter definition"
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Activities</h2>
            <button
              onClick={addActivity}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
            >
              + Add Activity
            </button>
          </div>
          
          {activities.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No activities defined yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Activity {index + 1}</h3>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeActivity(index)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={activity.title}
                      onChange={(e) => updateActivity(index, 'title', e.target.value)}
                      placeholder="Enter activity title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="flex space-x-2 border-b border-gray-200 pb-2 mb-2">
                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">B</button>
                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded italic">I</button>
                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">• List</button>
                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">1. List</button>
                      </div>
                      
                      <textarea
                        className="w-full min-h-[150px] p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={activity.instructions}
                        onChange={(e) => updateActivity(index, 'instructions', e.target.value)}
                        placeholder="Provide detailed instructions for this activity..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Assessment Tab */}
      {activeTab === 'assessment' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Assessment</h2>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
                onClick={() => {
                  // Implement AI assessment generation here
                  alert('AI assessment generation would be triggered here');
                }}
              >
                Generate Assessment
              </button>
              <select
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quiz">Multiple Choice Quiz</option>
                <option value="shortAnswer">Short Answer Questions</option>
                <option value="project">Project-Based Assessment</option>
                <option value="discussion">Discussion Questions</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="bg-gray-50 rounded-md p-2">
              <div className="flex space-x-2 border-b border-gray-200 pb-2 mb-2">
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">B</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded italic">I</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded underline">U</button>
                <span className="border-r border-gray-300"></span>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">H1</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">H2</button>
                <span className="border-r border-gray-300"></span>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">• List</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">1. List</button>
                <span className="border-r border-gray-300"></span>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">Image</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded">Code</button>
              </div>
              
              <textarea
                className="w-full min-h-[300px] p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lesson.assessment || ''}
                onChange={(e) => setLesson({...lesson, assessment: e.target.value})}
                placeholder="Create assessment questions, quizzes, or activities to evaluate student understanding..."
              ></textarea>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Assessment Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1 pl-5 list-disc">
              <li>Align assessment questions with your learning outcomes</li>
              <li>Include a mix of question types to test different cognitive levels</li>
              <li>Provide clear instructions and scoring criteria</li>
              <li>For multiple choice questions, include 4-5 plausible options</li>
              <li>Consider adding a self-reflection component</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Bottom save buttons */}
      <div className="flex justify-end mt-6 space-x-2">
        <Button variant="outline" onClick={() => router.push(`/lessons/${id}`)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      {/* Regeneration Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Regenerate Content</h3>
            <p className="mb-4 text-gray-600">
              Provide specific instructions for how you'd like this section regenerated:
            </p>
            
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              value={regenerationPrompt}
              onChange={(e) => setRegenerationPrompt(e.target.value)}
              placeholder="Make it more engaging, simplify the language, add more examples, etc."
              rows={4}
            ></textarea>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowReplaceModal(false);
                  setRegeneratingSectionId(null);
                  setRegenerationPrompt('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleRegenerateConfirm}
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}