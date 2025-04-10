"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getAllLessons, getAllModulesData } from "@/lib/firebase";
import { Lesson, Module } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

export default function Dashboard() {
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        if (!currentUser) {
          console.log("No user logged in");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Pass the user ID to the Firebase functions
        const lessons = await getAllLessons(currentUser.id);
        console.log("Retrieved lessons:", lessons); 
        setRecentLessons(lessons);

        const moduleData = await getAllModulesData(currentUser.id);
        console.log("Retrieved modules:", moduleData);
        setModules(moduleData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-700">
            Please log in to view your dashboard
          </h2>
          <div className="mt-4">
            <Link href="/auth/login">
              <Button>Sign In</Button>
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
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600">Welcome, {currentUser.name || currentUser.email}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/lesson-generator">
            <Button>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Create New Lesson
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-1">Total Lessons</h3>
              <p className="text-3xl font-bold">{recentLessons.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-1">Total Modules</h3>
              <p className="text-3xl font-bold">{modules.length}</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-lg font-semibold mb-1">Completion Rate</h3>
              <p className="text-3xl font-bold">
                {modules.length > 0
                  ? Math.round(
                      modules.reduce(
                        (acc, module) =>
                          acc + (module.completionPercentage || 0),
                        0
                      ) / modules.length
                    )
                  : 0}
                %
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Lessons</h2>
                <Link
                  href="/lessons"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                {recentLessons.length > 0 ? (
                  recentLessons.slice(0, 5).map((lesson) => (
                    <div key={lesson.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {lesson.description}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {lesson.module ||
                                lesson.courseTopic ||
                                "Uncategorized"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          <span className="text-sm text-gray-500">
                            {lesson.createdAt
                              ? new Date(lesson.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <div className="mt-2">
                            <Link
                              href={`/lessons/${lesson.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                            <span className="mx-2 text-gray-300">|</span>
                            <Link
                              href={`/lessons/${lesson.id}/edit`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No lessons found. Create your first lesson!</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Course Modules</h2>
                <Link
                  href="/modules/create"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create Module
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                {modules.length > 0 ? (
                  modules.map((module) => (
                    <div key={module.id} className="p-4 hover:bg-gray-50">
                      <div>
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {module.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {module.lessons ? module.lessons.length : 0} lessons
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${module.completionPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">
                            {module.completionPercentage || 0}% complete
                          </span>
                          <Link
                            href={`/modules/${module.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No modules found. Create your first module!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}