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
  getDoc,
  where,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { 
  getStorage 
} from 'firebase/storage';
import { Lesson, Module } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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
 * Get lessons by their IDs
 * @param lessonIds Array of lesson IDs to fetch
 * @returns Array of lessons with the specified IDs
 */
export async function getLessonsByIds(lessonIds: string[]): Promise<Lesson[]> {
  try {
    if (!lessonIds || lessonIds.length === 0) {
      return [];
    }
    
    const lessons: Lesson[] = [];
    
    const allLessons = await getAllLessons();
    
    const filteredLessons = allLessons.filter(lesson => 
      lesson.id && lessonIds.includes(lesson.id)
    );
    
    const orderedLessons = lessonIds.map(id => 
      filteredLessons.find(lesson => lesson.id === id)
    ).filter(lesson => lesson !== undefined) as Lesson[];
    
    return orderedLessons;
  } catch (error) {
    console.error('Error getting lessons by IDs:', error);
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
 * Create a new module in Firestore
 * @param module The module object to create
 * @returns The ID of the created module
 */
export async function createModule(module: Module): Promise<string> {
  try {
    if (module.id) {
      const docRef = doc(db, 'modules', module.id);
      await setDoc(docRef, {
        ...module,
        createdAt: module.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return module.id;
    } else {
      const docRef = await addDoc(collection(db, 'modules'), {
        ...module,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
}

/**
 * Get a module by its ID
 * @param id The ID of the module to fetch
 * @returns The module object or null if not found
 */
export async function getModuleById(id: string): Promise<Module | null> {
  try {
    const docRef = doc(db, 'modules', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Module;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting module by ID:', error);
    throw error;
  }
}

/**
 * Get all modules from Firestore
 * @returns Array of modules
 */
export async function getAllModulesData(): Promise<Module[]> {
  try {
    const q = query(collection(db, 'modules'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const modules: Module[] = [];
    querySnapshot.forEach((doc) => {
      modules.push({ id: doc.id, ...doc.data() } as Module);
    });
    
    return modules;
  } catch (error) {
    console.error('Error getting all modules:', error);
    throw error;
  }
}

/**
 * Update an existing module
 * @param module The module object with updated data
 */
export async function updateModule(module: Module): Promise<void> {
  try {
    if (!module.id) {
      throw new Error('Cannot update module: No module ID provided');
    }
    
    const docRef = doc(db, 'modules', module.id);
    
    const moduleWithUpdatedTime = {
      ...module,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, moduleWithUpdatedTime);
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
}

/**
 * Delete a module
 * @param id The ID of the module to delete
 */
export async function deleteModule(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'modules', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting module:', error);
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
    const cleanId = id.trim();
    console.log(`Attempting to fetch lesson with clean ID: ${cleanId}`);
    
    const docRef = doc(db, 'lessons', cleanId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Found lesson with ID: ${cleanId}`);
      return { id: docSnap.id, ...docSnap.data() } as Lesson;
    } 
    
    console.log(`No lesson found with ID: ${cleanId}`);
    
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
    
    console.log("Trying to find lesson by querying all lessons");
    const q = query(collection(db, 'lessons'));
    const querySnapshot = await getDocs(q);
    
    let foundLesson: Lesson | null = null;
    
    querySnapshot.forEach((doc) => {
      const lessonData = doc.data() as Lesson;
      const docId = doc.id;
      
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
    const actualLesson = await getLessonById(id);
    
    if (!actualLesson || !actualLesson.id) {
      throw new Error(`Cannot update lesson: No lesson found with ID ${id}`);
    }
    
    const docRef = doc(db, 'lessons', actualLesson.id);
    
    const lessonWithUpdatedTime = {
      ...lesson,
      updatedAt: new Date().toISOString()
    };
    
    const { id: _, ...lessonData } = lessonWithUpdatedTime;
    
    await updateDoc(docRef, lessonData);
    console.log(`Successfully updated lesson with ID: ${actualLesson.id}`);
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
}