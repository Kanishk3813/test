// src/lib/types.ts
export interface User {
    id: string;
    email: string;
    name: string | null;
    photoURL: string | null;
    createdAt: string;
  }
  
  export interface Lesson {
    id?: string;
    title: string;
    description: string;
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
    targetAudience: string;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    createdAt?: string;
    module?: string;
    courseTopic?: string;
    updatedAt: string;
    status: 'draft' | 'published';
    author?: string;
  }

  export interface Module {
    id: string;
    title: string;
    description: string;
    lessons: string[]; 
    lessonCount?: number; 
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    createdAt: string;
    updatedAt: string;
    completionPercentage?: number; 
    status: 'active' | 'draft' | 'archived';
  }
  
  export interface Course {
    id: string;
    title: string;
    description: string;
    modules: Module[] | string[]; 
    author: string;
    targetAudience?: string;
    learningOutcomes?: string[];
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
    estimatedCompletionTime?: number; 
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'published';
    thumbnail?: string;
  }