// src/lib/types.ts
export interface User {
    id: string;
    email: string;
    name: string | null;
    photoURL: string | null;
    createdAt: string;
  }
  
// src/lib/types.ts - Updated Lesson interface
export interface Lesson {
  customId: string;
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
  author?: string;  // We'll use this for creator display
  userId: string;
  isPublic?: boolean; // New field to determine if the lesson is publicly accessible
  views?: number;    // New field to track lesson popularity
  tags?: string[];   // Optional tags for categorization
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
    userId: string;
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