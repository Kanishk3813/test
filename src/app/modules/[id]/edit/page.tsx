"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { getModuleById, getAllLessons, updateModule, deleteModule } from "@/lib/firebase";
import { Module, Lesson } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function EditModule() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  
  const [module, setModule] = useState<Module | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Add authentication listener to get the user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setError("Please log in to edit modules");
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Don't fetch data if there's no user ID
      if (!userId) {
        return;
      }

      try {
        setIsLoading(true);
        const [moduleData, lessons] = await Promise.all([
          getModuleById(moduleId, userId),
          getAllLessons(userId)
        ]);
        
        if (!moduleData) {
          setError("Module not found");
          setIsLoading(false);
          return;
        }
        
        setModule(moduleData);
        setAllLessons(lessons);
        setSelectedLessons(moduleData.lessons || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching module data:", error);
        setError("Failed to load module data");
        setIsLoading(false);
      }
    }

    if (moduleId && userId) {
      fetchData();
    }
  }, [moduleId, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (module) {
      setModule({ ...module, [name]: value });
    }
  };

  const handleLessonToggle = (lessonId: string) => {
    setSelectedLessons((prev) => {
      if (prev.includes(lessonId)) {
        return prev.filter((id) => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };

  const handleSave = async () => {
    if (!module || !userId) return;
    
    try {
      setIsSaving(true);
      const updatedModule: Module = {
        ...module,
        lessons: selectedLessons,
        lessonCount: selectedLessons.length,
        updatedAt: new Date().toISOString()
      };
      
      await updateModule(updatedModule, userId);
      router.push(`/modules/${moduleId}`);
    } catch (error) {
      console.error("Error updating module:", error);
      setError("Failed to update module");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!module || !userId) return;
    
    try {
      setIsDeleting(true);
      await deleteModule(moduleId, userId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting module:", error);
      setError("Failed to delete module");
      setIsDeleting(false);
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

  if (error || !module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || "Module not found"}</p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-2">
            Dashboard
          </Link>
          <span className="text-gray-500 mx-2">/</span>
          <Link href={`/modules/${moduleId}`} className="text-blue-600 hover:text-blue-800 mr-2">
            {module.title}
          </Link>
          <span className="text-gray-500 mx-2">/</span>
          <h1 className="text-2xl font-bold">Edit</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Module Details</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={module.title}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={module.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={4}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Difficulty Level
              </label>
              <select
                name="difficultyLevel"
                value={module.difficultyLevel}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status
              </label>
              <select
                name="status"
                value={module.status}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Module Actions</h2>
            <div className="space-y-4">
              <Button 
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              
              <Button 
                className="w-full bg-gray-500 hover:bg-gray-600"
                onClick={() => router.push(`/modules/${moduleId}`)}
              >
                Cancel
              </Button>
              
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Module
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Lessons</h2>
          <p className="text-gray-600 mb-4">Select or deselect lessons to include in this module</p>
          
          {allLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allLessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className={`border rounded p-4 cursor-pointer ${
                    selectedLessons.includes(lesson.id || "") 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => lesson.id && handleLessonToggle(lesson.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 mr-3"
                      checked={selectedLessons.includes(lesson.id || "")}
                      onChange={() => {}}
                    />
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {lesson.difficultyLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No lessons found. Create some lessons first!</p>
              <Link href="/lesson-generator">
                <Button className="mt-4">Create Lesson</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Module</h3>
            <p className="mb-6">Are you sure you want to delete this module? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button 
                className="bg-gray-500 hover:bg-gray-600"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}