// // src/lib/moduleService.ts
// import { 
//     collection, 
//     addDoc, 
//     updateDoc, 
//     deleteDoc, 
//     doc, 
//     getDoc, 
//     getDocs, 
//     query, 
//     where, 
//     orderBy, 
//     serverTimestamp 
//   } from 'firebase/firestore';
//   import { db } from './firebase';
//   import { Module, Lesson } from './types';
  
//   // Module services
//   export const createModule = async (moduleData: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>): Promise<Module> => {
//     try {
//       const modulesCollection = collection(db, 'modules');
//       const now = new Date().toISOString();
      
//       const docRef = await addDoc(modulesCollection, {
//         ...moduleData,
//         lessons: [], // Start with empty lessons array
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       });
      
//       return {
//         id: docRef.id,
//         ...moduleData,
//         lessons: [],
//         createdAt: now,
//         updatedAt: now,
//       };
//     } catch (error) {
//       console.error('Error creating module:', error);
//       throw error;
//     }
//   };
  
//   export const getModule = async (moduleId: string): Promise<Module | null> => {
//     try {
//       const moduleRef = doc(db, 'modules', moduleId);
//       const moduleSnap = await getDoc(moduleRef);
      
//       if (!moduleSnap.exists()) {
//         return null;
//       }
      
//       const moduleData = moduleSnap.data() as Omit<Module, 'id'>;
      
//       // If lessons are IDs, fetch the lesson data
//       let lessons = moduleData.lessons;
//       if (lessons.length > 0 && typeof lessons[0] === 'string') {
//         // Fetch all lessons
//         const lessonPromises = (lessons as string[]).map(async (lessonId) => {
//           const lessonRef = doc(db, 'lessons', lessonId);
//           const lessonSnap = await getDoc(lessonRef);
//           if (lessonSnap.exists()) {
//             return { id: lessonId, ...lessonSnap.data() } as Lesson;
//           }
//           return null;
//         });
        
//         const fetchedLessons = await Promise.all(lessonPromises);
//         lessons = fetchedLessons.filter(lesson => lesson !== null);
//       }
      
//       return {
//         id: moduleId,
//         ...moduleData,
//         lessons,
//       } as Module;
//     } catch (error) {
//       console.error('Error getting module:', error);
//       throw error;
//     }
//   };
  
//   export const getUserModules = async (userId: string): Promise<Module[]> => {
//     try {
//       const modulesCollection = collection(db, 'modules');
//       const q = query(
//         modulesCollection,
//         where('author', '==', userId),
//         orderBy('createdAt', 'desc')
//       );
      
//       const querySnapshot = await getDocs(q);
//       const modules = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Module[];
      
//       return modules;
//     } catch (error) {
//       console.error('Error getting user modules:', error);
//       throw error;
//     }
//   };
  
//   export const updateModule = async (moduleId: string, moduleData: Partial<Module>): Promise<void> => {
//     try {
//       const moduleRef = doc(db, 'modules', moduleId);
//       await updateDoc(moduleRef, {
//         ...moduleData,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error('Error updating module:', error);
//       throw error;
//     }
//   };
  
//   export const deleteModule = async (moduleId: string): Promise<void> => {
//     try {
//       // First get the module to check for lessons
//       const module = await getModule(moduleId);
      
//       if (module && module.lessons.length > 0) {
//         // If there are lessons stored as strings (IDs)
//         if (typeof module.lessons[0] === 'string') {
//           // Delete each lesson
//           for (const lessonId of module.lessons as string[]) {
//             await deleteLesson(lessonId);
//           }
//         }
//       }
      
//       // Then delete the module
//       const moduleRef = doc(db, 'modules', moduleId);
//       await deleteDoc(moduleRef);
//     } catch (error) {
//       console.error('Error deleting module:', error);
//       throw error;
//     }
//   };
  
//   // Function to suggest sequence for lessons in a module
//   export const suggestLessonSequence = async (moduleId: string): Promise<Lesson[]> => {
//     try {
//       const module = await getModule(moduleId);
      
//       if (!module || !module.lessons || module.lessons.length === 0) {
//         return [];
//       }
      
//       let lessons: Lesson[];
      
//       // Convert string[] to Lesson[] if needed
//       if (typeof module.lessons[0] === 'string') {
//         const lessonPromises = (module.lessons as string[]).map(async (lessonId) => {
//           const lessonRef = doc(db, 'lessons', lessonId);
//           const lessonSnap = await getDoc(lessonRef);
          
//           if (lessonSnap.exists()) {
//             return { id: lessonId, ...lessonSnap.data() } as Lesson;
//           }
//           return null;
//         });
        
//         const fetchedLessons = await Promise.all(lessonPromises);
//         lessons = fetchedLessons.filter(lesson => lesson !== null) as Lesson[];
//       } else {
//         lessons = module.lessons as Lesson[];
//       }
      
//       // Simple sequencing algorithm:
//       // 1. Put beginner lessons first
//       // 2. Then intermediate
//       // 3. Then advanced
//       // 4. Within each level, maintain original order or use alphabetical if order not defined
      
//       return lessons.sort((a, b) => {
//         // First compare difficulty levels
//         const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
//         const diffComparison = difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
        
//         if (diffComparison !== 0) {
//           return diffComparison;
//         }
        
//         // If difficulties are the same, use order if available
//         if (a.order !== undefined && b.order !== undefined) {
//           return a.order - b.order;
//         }
        
//         // Otherwise use alphabetical order
//         return a.title.localeCompare(b.title);
//       });
//     } catch (error) {
//       console.error('Error suggesting lesson sequence:', error);
//       throw error;
//     }
//   };
  
//   // Lesson services
//   export const addLessonToModule = async (moduleId: string, lessonData: Lesson): Promise<string> => {
//     try {
//       // First save the lesson
//       const lessonsCollection = collection(db, 'lessons');
//       const now = new Date().toISOString();
      
//       // Add moduleId to the lesson
//       const lessonWithModule = {
//         ...lessonData,
//         moduleId,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       };
      
//       const lessonRef = await addDoc(lessonsCollection, lessonWithModule);
//       const lessonId = lessonRef.id;
      
//       // Then update the module to include this lesson
//       const moduleRef = doc(db, 'modules', moduleId);
//       const moduleSnap = await getDoc(moduleRef);
      
//       if (moduleSnap.exists()) {
//         const moduleData = moduleSnap.data();
//         const lessons = moduleData.lessons || [];
        
//         await updateDoc(moduleRef, {
//           lessons: [...lessons, lessonId],
//           updatedAt: serverTimestamp(),
//         });
//       }
      
//       return lessonId;
//     } catch (error) {
//       console.error('Error adding lesson to module:', error);
//       throw error;
//     }
//   };
  
//   export const getLesson = async (lessonId: string): Promise<Lesson | null> => {
//     try {
//       const lessonRef = doc(db, 'lessons', lessonId);
//       const lessonSnap = await getDoc(lessonRef);
      
//       if (!lessonSnap.exists()) {
//         return null;
//       }
      
//       return {
//         id: lessonId,
//         ...lessonSnap.data(),
//       } as Lesson;
//     } catch (error) {
//       console.error('Error getting lesson:', error);
//       throw error;
//     }
//   };
  
//   export const updateLesson = async (lessonId: string, lessonData: Partial<Lesson>): Promise<void> => {
//     try {
//       const lessonRef = doc(db, 'lessons', lessonId);
//       await updateDoc(lessonRef, {
//         ...lessonData,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error('Error updating lesson:', error);
//       throw error;
//     }
//   };
  
//   export const deleteLesson = async (lessonId: string): Promise<void> => {
//     try {
//       // First get the lesson to find its module
//       const lesson = await getLesson(lessonId);
      
//       if (lesson && lesson.moduleId) {
//         // Update the module to remove this lesson
//         const moduleRef = doc(db, 'modules', lesson.moduleId);
//         const moduleSnap = await getDoc(moduleRef);
        
//         if (moduleSnap.exists()) {
//           const moduleData = moduleSnap.data();
//           const lessons = moduleData.lessons || [];
          
//           // Filter out the lesson to be deleted
//           const updatedLessons = lessons.filter((id: string) => id !== lessonId);
          
//           await updateDoc(moduleRef, {
//             lessons: updatedLessons,
//             updatedAt: serverTimestamp(),
//           });
//         }
//       }
      
//       // Then delete the lesson
//       const lessonRef = doc(db, 'lessons', lessonId);
//       await deleteDoc(lessonRef);
//     } catch (error) {
//       console.error('Error deleting lesson:', error);
//       throw error;
//     }
//   };
  
//   // Function to reorder lessons within a module
//   export const reorderLessons = async (moduleId: string, lessonOrder: string[]): Promise<void> => {
//     try {
//       const moduleRef = doc(db, 'modules', moduleId);
      
//       await updateDoc(moduleRef, {
//         lessons: lessonOrder,
//         updatedAt: serverTimestamp(),
//       });
      
//       // Update the order field of each lesson
//       for (let i = 0; i < lessonOrder.length; i++) {
//         const lessonId = lessonOrder[i];
//         const lessonRef = doc(db, 'lessons', lessonId);
        
//         await updateDoc(lessonRef, {
//           order: i,
//           updatedAt: serverTimestamp(),
//         });
//       }
//     } catch (error) {
//       console.error('Error reordering lessons:', error);
//       throw error;
//     }
//   };