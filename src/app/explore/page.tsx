// src/app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAllPublicLessons, incrementLessonViews } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function ExplorePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeDifficultyLevel, setActiveDifficultyLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchPublicLessons() {
      try {
        setIsLoading(true);
        const publicLessons = await getAllPublicLessons();
        setLessons(publicLessons);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching public lessons:", error);
        setIsLoading(false);
      }
    }
    
    fetchPublicLessons();
  }, []);

  const difficultyLevels = ['all', 'beginner', 'intermediate', 'advanced'];
  
  const categoriesSet = new Set<string>();
  lessons.forEach(lesson => {
    if (lesson.module) categoriesSet.add(lesson.module);
    if (lesson.courseTopic) categoriesSet.add(lesson.courseTopic);
  });
  const categories = ['all', ...Array.from(categoriesSet)];

  const filteredLessons = lessons.filter(lesson => {
    const matchesMainFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'popular' && (lesson.views || 0) > 10) || 
      (activeFilter === 'recent' && lesson.createdAt && 
        new Date(lesson.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesDifficulty =
      activeDifficultyLevel === 'all' ||
      (lesson.difficultyLevel && lesson.difficultyLevel.toLowerCase() === activeDifficultyLevel);
    
    const matchesCategory = 
      currentCategory === 'all' || 
      lesson.module === currentCategory || 
      lesson.courseTopic === currentCategory;
    
    const matchesSearch = 
      searchQuery === '' || 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (lesson.description && lesson.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesMainFilter && matchesDifficulty && matchesCategory && matchesSearch;
  });

  const handleLessonClick = (lessonId: string) => {
    if (lessonId) {
      incrementLessonViews(lessonId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Lessons</h1>
        <p className="text-gray-600">Discover lessons created by our community</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === 'popular' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveFilter('recent')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === 'recent' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recent
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                currentCategory === category
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-transparent'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty Level</h3>
        <div className="flex space-x-2">
          {difficultyLevels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveDifficultyLevel(level)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeDifficultyLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <Link 
                  href={`/lessons/${lesson.id}`} 
                  key={lesson.id}
                  onClick={() => lesson.id && handleLessonClick(lesson.id)}
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                    {/* Card Header with Gradient */}
                    <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lesson.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                          lesson.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lesson.difficultyLevel && lesson.difficultyLevel.charAt(0).toUpperCase() + lesson.difficultyLevel.slice(1)}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                        <h3 className="font-bold text-lg truncate">{lesson.title}</h3>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-4 flex-grow">
                      <p className="text-gray-600 text-sm line-clamp-2 h-10 mb-2">
                        {lesson.description || "No description available"}
                      </p>
                      
                      <div className="mt-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lesson.module || lesson.courseTopic || "Uncategorized"}
                        </span>
                      </div>
                      
                      {/* Learning outcomes preview */}
                      {lesson.learningOutcomes && lesson.learningOutcomes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Learning outcomes:</p>
                          <ul className="text-xs text-gray-600 pl-4 list-disc">
                            {lesson.learningOutcomes.slice(0, 2).map((outcome, idx) => (
                              <li key={idx} className="truncate">{outcome}</li>
                            ))}
                            {lesson.learningOutcomes.length > 2 && (
                              <li className="text-blue-600">+ {lesson.learningOutcomes.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {lesson.author?.charAt(0) || '?'}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium">{lesson.author || "Unknown Author"}</p>
                            <p className="text-xs text-gray-500">
                              {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : "Unknown date"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-xs text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            {lesson.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search criteria or check back later.
              </p>
              {currentUser && (
                <div className="mt-6">
                  <Link
                    href="/lesson-generator"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create a new lesson
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}