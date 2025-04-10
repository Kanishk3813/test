
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { getModuleById, getLessonsByIds } from "@/lib/firebase";
import { Module, Lesson } from "@/lib/types";
import { auth } from "@/lib/firebase"; // Import auth to get the current user
import { useAuthState } from "react-firebase-hooks/auth"; // You'll need to install this package

export default function ModuleDetails() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  
  const [user] = useAuthState(auth); // Get the current user
  const [module, setModule] = useState<Module | null>(null);
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if user is authenticated
        if (!user || !user.uid) {
          setError("You must be logged in to view this module");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const moduleData = await getModuleById(moduleId, user.uid);
        
        if (!moduleData) {
          setError("Module not found");
          setIsLoading(false);
          return;
        }
        
        setModule(moduleData);
        
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          const lessons = await getLessonsByIds(moduleData.lessons, user.uid);
          setModuleLessons(lessons);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching module data:", error);
        setError("Failed to load module data");
        setIsLoading(false);
      }
    }

    if (moduleId) {
      fetchData();
    }
  }, [moduleId, user]);

  const handleEditModule = () => {
    router.push(`/modules/${moduleId}/edit`);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-2">
              Dashboard
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <h1 className="text-2xl font-bold">{module.title}</h1>
          </div>
          <p className="text-gray-600 mt-1">{module.description}</p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button 
            onClick={handleEditModule}
            className="mr-2"
          >
            Edit Module
          </Button>
          <Link href={`/modules/${moduleId}/add-lessons`}>
            <Button className="bg-green-500 hover:bg-green-600">
              Add Lessons
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold mb-1">Lessons</h3>
          <p className="text-3xl font-bold">{moduleLessons.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold mb-1">Difficulty</h3>
          <p className="text-3xl font-bold capitalize">{module.difficultyLevel}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-1">Completion</h3>
          <p className="text-3xl font-bold">{module.completionPercentage || 0}%</p>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Module Lessons</h2>
        
        {moduleLessons.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {moduleLessons.map((lesson, index) => (
                <div key={lesson.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full mr-4 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{lesson.description}</p>
                    </div>
                    <div className="flex items-center ml-4">
                      <Link href={`/lessons/${lesson.id}`}>
                        <Button className="bg-gray-100 text-gray-800 hover:bg-gray-200 mr-2">
                          View
                        </Button>
                      </Link>
                      <Link href={`/lessons/${lesson.id}/edit`}>
                        <Button className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No lessons have been added to this module yet.</p>
            <Link href={`/modules/${moduleId}/add-lessons`} className="mt-4 inline-block">
              <Button className="bg-blue-500 hover:bg-blue-600 mt-4">
                Add Lessons
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}