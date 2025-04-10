// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  getDocs, 
  query, 
  orderBy, 
  getDoc
} from 'firebase/firestore';
import { 
  getStorage 
} from 'firebase/storage';
import { Lesson } from './types';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

/**
 * Save a lesson to Firestore
 * @param lesson The lesson object to save
 * @returns The ID of the saved lesson
 */
export async function saveLesson(lesson: Lesson): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'lessons'), {
      ...lesson,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving lesson:', error);
    throw error;
  }
}

/**
 * Retrieve all lessons from Firestore
 * @returns Array of lessons
 */
export async function getAllLessons(): Promise<Lesson[]> {
  try {
    const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const lessons: Lesson[] = [];
    querySnapshot.forEach((doc) => {
      lessons.push({ id: doc.id, ...doc.data() } as Lesson);
    });
    
    return lessons;
  } catch (error) {
    console.error('Error getting lessons:', error);
    throw error;
  }
}

/**
 * Get lessons by module/course topic
 * @param module The module/course topic to filter by
 * @returns Array of lessons in the specified module
 */
export async function getLessonsByModule(module: string): Promise<Lesson[]> {
  try {
    const q = query(
      collection(db, 'lessons'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const lessons: Lesson[] = [];
    querySnapshot.forEach((doc) => {
      const lessonData = doc.data() as Lesson;
      if (lessonData.module === module || lessonData.courseTopic === module) {
        lessons.push({ id: doc.id, ...lessonData });
      }
    });
    
    return lessons;
  } catch (error) {
    console.error('Error getting lessons by module:', error);
    throw error;
  }
}

/**
 * Get all unique modules from lessons
 * @returns Array of unique module names
 */
export async function getAllModules(): Promise<string[]> {
  try {
    const lessons = await getAllLessons();
    
    const modules = new Set<string>();
    lessons.forEach((lesson) => {
      if (lesson.module) {
        modules.add(lesson.module);
      } else if (lesson.courseTopic) {
        modules.add(lesson.courseTopic);
      }
    });
    
    return Array.from(modules);
  } catch (error) {
    console.error('Error getting all modules:', error);
    throw error;
  }
}

/**
 * Get a lesson by its ID
 * @param id The ID of the lesson to fetch
 * @returns The lesson object or null if not found
 */
export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    // Ensure we have a clean ID
    const cleanId = id.trim();
    console.log(`Attempting to fetch lesson with clean ID: ${cleanId}`);
    
    // Try the original ID first
    const docRef = doc(db, 'lessons', cleanId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Found lesson with ID: ${cleanId}`);
      return { id: docSnap.id, ...docSnap.data() } as Lesson;
    } 
    
    console.log(`No lesson found with ID: ${cleanId}`);
    
    // Try various ID formats in case dashboard is using a different format than the editor
    // Remove any "lesson_" prefix if it exists
    if (cleanId.startsWith('lesson_')) {
      const idWithoutPrefix = cleanId.substring(7);
      console.log(`Trying without prefix: ${idWithoutPrefix}`);
      const altDocRef = doc(db, 'lessons', idWithoutPrefix);
      const altDocSnap = await getDoc(altDocRef);
      
      if (altDocSnap.exists()) {
        console.log(`Found lesson with ID without prefix: ${idWithoutPrefix}`);
        return { id: altDocSnap.id, ...altDocSnap.data() } as Lesson;
      }
    }
    
    // Check if there's an underscore and try just the first part
    if (cleanId.includes('_')) {
      const firstPart = cleanId.split('_')[0];
      if (firstPart !== 'lesson') { 
        console.log(`Trying with first part: ${firstPart}`);
        const firstPartRef = doc(db, 'lessons', firstPart);
        const firstPartSnap = await getDoc(firstPartRef);
        
        if (firstPartSnap.exists()) {
          console.log(`Found lesson with first part ID: ${firstPart}`);
          return { id: firstPartSnap.id, ...firstPartSnap.data() } as Lesson;
        }
      }
    }
    
    // If none of the above worked, try one more approach - query all lessons and find by ID
    // This is a fallback in case the issue is with how IDs are stored vs how they're being passed
    console.log("Trying to find lesson by querying all lessons");
    const q = query(collection(db, 'lessons'));
    const querySnapshot = await getDocs(q);
    
    let foundLesson: Lesson | null = null;
    
    querySnapshot.forEach((doc) => {
      const lessonData = doc.data() as Lesson;
      const docId = doc.id;
      
      // Check for various ID formats and matches
      if (
        docId === cleanId || 
        docId === cleanId.replace('lesson_', '') ||
        (lessonData.id && lessonData.id === cleanId) ||
        (lessonData.id && lessonData.id.replace('lesson_', '') === cleanId)
      ) {
        console.log(`Found lesson by querying all: ${docId}`);
        foundLesson = { id: docId, ...lessonData };
      }
    });
    
    if (foundLesson) {
      return foundLesson;
    }
    
    console.log(`No lesson found with any ID variation for: ${id}`);
    return null;
  } catch (error) {
    console.error('Error getting lesson by ID:', error);
    throw error;
  }
}

/**
 * Update an existing lesson
 * @param id The ID of the lesson to update
 * @param lesson The updated lesson data
 */
export async function updateLesson(id: string, lesson: Lesson): Promise<void> {
  try {
    const docRef = doc(db, 'lessons', id);
    
    const lessonWithUpdatedTime = {
      ...lesson,
      updatedAt: new Date().toISOString()
    };
    
    const { id: _, ...lessonData } = lessonWithUpdatedTime;
    
    await updateDoc(docRef, lessonData);
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
}