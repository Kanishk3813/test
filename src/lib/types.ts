// src/lib/types.ts
export interface User {
    id: string;
    email: string;
    name: string | null;
    photoURL: string | null;
    createdAt: string;
  }
  
  export interface Lesson {
    id: string;
    title: string;
    description: string;
    targetAudience: string;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    learningOutcomes: string[];
    keyConcepts: {
      term: string;
      definition: string;
    }[];
    content: string;
    activities: {
      title: string;
      instructions: string;
    }[];
    assessment: string;
    createdAt?: string;
    updatedAt?: string;
    order?: number;
    moduleId?: string;
    estimatedTime?: number; // in minutes
    prerequisites?: string[];
    author?: string;
    status?: 'draft' | 'published';
  }
  
  export interface Module {
    id: string;
    title: string;
    description: string;
    courseId?: string;
    lessons: Lesson[] | string[]; // can be array of lesson IDs or lesson objects
    prerequisites?: string[];
    learningOutcomes?: string[];
    estimatedCompletionTime?: number; // in minutes
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    order?: number;
    createdAt: string;
    updatedAt: string;
    author: string;
    status: 'draft' | 'published';
  }
  
  export interface Course {
    id: string;
    title: string;
    description: string;
    modules: Module[] | string[]; // can be array of module IDs or module objects
    author: string;
    targetAudience?: string;
    learningOutcomes?: string[];
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
    estimatedCompletionTime?: number; // in minutes
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'published';
    thumbnail?: string;
  }