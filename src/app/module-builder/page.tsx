"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getAllLessons } from "@/lib/firebase";
import { Lesson, Module } from "@/lib/types";
import { createModule } from "@/lib/firebase";

export default function ModuleBuilder() {
  const router = useRouter();
  const [module, setModule] = useState<Partial<Module>>({
    title: "",
    description: "",
    lessons: [],
    difficultyLevel: "intermediate",
    status: "active",
  });
  
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchLessons() {
      try {
        setIsLoading(true);
        const lessons = await getAllLessons();
        setAllLessons(lessons);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setErrorMessage("Failed to load lessons");
        setIsLoading(false);
      }
    }

    fetchLessons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setModule((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!module.title || !module.description || selectedLessons.length === 0) {
      setErrorMessage("Please fill in all required fields and select at least one lesson");
      return;
    }

    try {
      setIsLoading(true);
      const moduleId = module.title.replace(/\s+/g, "-").toLowerCase();
      const now = new Date().toISOString();
      
      const newModule: Module = {
        id: moduleId,
        title: module.title,
        description: module.description,
        lessons: selectedLessons,
        lessonCount: selectedLessons.length,
        difficultyLevel: module.difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
        createdAt: now,
        updatedAt: now,
        status: module.status as 'active' | 'draft' | 'archived',
      };

      await createModule(newModule);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating module:", error);
      setErrorMessage("Failed to create module");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Create New Module</h1>
        <p className="text-gray-600">Organize your lessons into a cohesive learning module</p>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Module Details</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={module.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter module title"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={module.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={4}
                  placeholder="Enter module description"
                  required
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Module"}
                </Button>
                <Button 
                  type="button"
                  className="w-full bg-gray-500 hover:bg-gray-600"
                  onClick={() => router.push("/dashboard")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Lessons</h2>
            <p className="text-gray-600 mb-4">Choose lessons to include in this module</p>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : allLessons.length > 0 ? (
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
                          {lesson.module && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {lesson.module}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No lessons found. Create some lessons first!</p>
              </div>
            )}
          </Card>
        </div>
      </form>
    </div>
  );
}