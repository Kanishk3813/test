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
  setDoc,
  increment
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
 * @param userId The ID of the user who owns this lesson
 * @returns The ID of the saved lesson
 */
export async function saveLesson(lesson: Lesson, userId: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'lessons'), {
      ...lesson,
      userId: userId, // Associate the lesson with the user
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving lesson:', error);
    throw error;
  }
}

/**
 * Retrieve all lessons for a specific user from Firestore
 * @param userId The ID of the user whose lessons to fetch
 * @returns Array of lessons
 */
export async function getAllLessons(userId: string): Promise<Lesson[]> {
  try {
    const q = query(
      collection(db, 'lessons'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
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
 * Get lessons by module/course topic for a specific user
 * @param module The module/course topic to filter by
 * @param userId The ID of the user whose lessons to fetch
 * @returns Array of lessons in the specified module
 */
export async function getLessonsByModule(module: string, userId: string): Promise<Lesson[]> {
  try {
    const q = query(
      collection(db, 'lessons'),
      where('userId', '==', userId),
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
 * Get lessons by their IDs for a specific user
 * @param lessonIds Array of lesson IDs to fetch
 * @param userId The ID of the user whose lessons to fetch
 * @returns Array of lessons with the specified IDs
 */
export async function getLessonsByIds(lessonIds: string[], userId: string): Promise<Lesson[]> {
  try {
    if (!lessonIds || lessonIds.length === 0) {
      return [];
    }
    
    const lessons: Lesson[] = [];
    
    const allLessons = await getAllLessons(userId);
    
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
 * Get all unique modules from lessons for a specific user
 * @param userId The ID of the user whose modules to fetch
 * @returns Array of unique module names
 */
export async function getAllModules(userId: string): Promise<string[]> {
  try {
    const lessons = await getAllLessons(userId);
    
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
 * @param userId The ID of the user who owns this module
 * @returns The ID of the created module
 */
export async function createModule(module: Module, userId: string): Promise<string> {
  try {
    if (module.id) {
      const docRef = doc(db, 'modules', module.id);
      await setDoc(docRef, {
        ...module,
        userId: userId, // Associate the module with the user
        createdAt: module.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return module.id;
    } else {
      const docRef = await addDoc(collection(db, 'modules'), {
        ...module,
        userId: userId, // Associate the module with the user
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
 * Get a module by its ID, ensuring it belongs to the specified user
 * @param id The ID of the module to fetch
 * @param userId The ID of the user who should own this module
 * @returns The module object or null if not found
 */
export async function getModuleById(id: string, userId: string): Promise<Module | null> {
  try {
    const docRef = doc(db, 'modules', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const moduleData = docSnap.data() as Module;
      
      // Only return the module if it belongs to the user
      if (moduleData.userId === userId) {
        const { id: _, ...moduleDataWithoutId } = moduleData;
        return { id: docSnap.id, ...moduleDataWithoutId };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting module by ID:', error);
    throw error;
  }
}

/**
 * Get all modules for a specific user from Firestore
 * @param userId The ID of the user whose modules to fetch
 * @returns Array of modules
 */
export async function getAllModulesData(userId: string): Promise<Module[]> {
  try {
    const q = query(
      collection(db, 'modules'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
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
 * @param userId The ID of the user who should own this module
 */
export async function updateModule(module: Module, userId: string): Promise<void> {
  try {
    if (!module.id) {
      throw new Error('Cannot update module: No module ID provided');
    }
    
    // First verify the module belongs to the user
    const existingModule = await getModuleById(module.id, userId);
    if (!existingModule) {
      throw new Error('Cannot update module: Module not found or not owned by user');
    }
    
    const docRef = doc(db, 'modules', module.id);
    
    const moduleWithUpdatedTime = {
      ...module,
      userId: userId, // Ensure userId is maintained
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, moduleWithUpdatedTime);
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
}

/**
 * Delete a module, ensuring it belongs to the specified user
 * @param id The ID of the module to delete
 * @param userId The ID of the user who should own this module
 */
export async function deleteModule(id: string, userId: string): Promise<void> {
  try {
    // First verify the module belongs to the user
    const existingModule = await getModuleById(id, userId);
    if (!existingModule) {
      throw new Error('Cannot delete module: Module not found or not owned by user');
    }
    
    const docRef = doc(db, 'modules', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
}

/**
 * Get a lesson by its ID, ensuring it belongs to the specified user
 * @param id The ID of the lesson to fetch
 * @param userId The ID of the user who should own this lesson
 * @returns The lesson object or null if not found
 */
export async function getLessonById(id: string, userId: string): Promise<Lesson | null> {
  try {
    const cleanId = id.trim();
    console.log(`Attempting to fetch lesson with clean ID: ${cleanId}`);
    
    const docRef = doc(db, 'lessons', cleanId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const lessonData = docSnap.data() as Lesson;
      
      // Only return the lesson if it belongs to the user
      if (lessonData.userId === userId) {
        console.log(`Found lesson with ID: ${cleanId}`);
        return { id: docSnap.id, ...lessonData };
      }
    } 
    
    console.log(`No lesson found with ID: ${cleanId}`);
    
    if (cleanId.startsWith('lesson_')) {
      const idWithoutPrefix = cleanId.substring(7);
      console.log(`Trying without prefix: ${idWithoutPrefix}`);
      const altDocRef = doc(db, 'lessons', idWithoutPrefix);
      const altDocSnap = await getDoc(altDocRef);
      
      if (altDocSnap.exists()) {
        const lessonData = altDocSnap.data() as Lesson;
        
        // Only return the lesson if it belongs to the user
        if (lessonData.userId === userId) {
          console.log(`Found lesson with ID without prefix: ${idWithoutPrefix}`);
          return { id: altDocSnap.id, ...lessonData };
        }
      }
    }
    
    if (cleanId.includes('_')) {
      const firstPart = cleanId.split('_')[0];
      if (firstPart !== 'lesson') { 
        console.log(`Trying with first part: ${firstPart}`);
        const firstPartRef = doc(db, 'lessons', firstPart);
        const firstPartSnap = await getDoc(firstPartRef);
        
        if (firstPartSnap.exists()) {
          const lessonData = firstPartSnap.data() as Lesson;
          
          // Only return the lesson if it belongs to the user
          if (lessonData.userId === userId) {
            console.log(`Found lesson with first part ID: ${firstPart}`);
            return { id: firstPartSnap.id, ...lessonData };
          }
        }
      }
    }
    
    console.log("Trying to find lesson by querying all lessons");
    const q = query(
      collection(db, 'lessons'),
      where('userId', '==', userId) // Filter by user ID
    );
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
 * Update an existing lesson, ensuring it belongs to the specified user
 * @param id The ID of the lesson to update
 * @param lesson The updated lesson data
 * @param userId The ID of the user who should own this lesson
 */
export async function updateLesson(id: string, lesson: Lesson, userId: string): Promise<void> {
  try {
    const actualLesson = await getLessonById(id, userId);
    
    if (!actualLesson || !actualLesson.id) {
      throw new Error(`Cannot update lesson: No lesson found with ID ${id} for this user`);
    }
    
    const docRef = doc(db, 'lessons', actualLesson.id);
    
    const lessonWithUpdatedTime = {
      ...lesson,
      userId: userId, // Ensure userId is maintained
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

/**
 * Fetches all public lessons from all users
 * @returns {Promise<Lesson[]>} Array of public lessons
 */
export async function getAllPublicLessons(): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, 'lessons');
    
    // Query all lessons since we don't have publish controls yet
    const q = query(
      lessonsRef,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const lessons: Lesson[] = [];
    
    querySnapshot.forEach((doc) => {
      const lessonData = doc.data() as Lesson;
      
      // Include all lessons for now (we'll add filtering later)
      lessons.push({
        id: doc.id,
        ...lessonData,
        views: lessonData.views || 0,  // Default to 0 if views doesn't exist
      });
    });

    return lessons;
  } catch (error) {
    console.error('Error getting public lessons:', error);
    throw error;
  }
}

/**
 * Increments the view count for a lesson
 * @param {string} lessonId - The ID of the lesson to increment views for
 */
export async function incrementLessonViews(lessonId: string): Promise<void> {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await updateDoc(lessonRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing lesson views:', error);
    // Don't throw the error to prevent disrupting user experience
  }
}