"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../components/ui/Button";
import { getAllLessons } from "@/lib/firebase";
import { Lesson } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterBy, setFilterBy] = useState<string>("");

  useEffect(() => {
    async function fetchLessons() {
      try {
        if (!currentUser) {
          console.log("No user logged in");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const fetchedLessons = await getAllLessons(currentUser.id);
        console.log("Retrieved all lessons:", fetchedLessons);
        setLessons(fetchedLessons);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setIsLoading(false);
      }
    }

    fetchLessons();
  }, [currentUser]);

  const sortedLessons = [...lessons].sort((a, b) => {
    if (sortBy === "date") {
      // Default: most recent first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    } else if (sortBy === "module") {
      return (a.module || "").localeCompare(b.module || "");
    }
    return 0;
  });

  const filteredLessons = filterBy 
    ? sortedLessons.filter(lesson => 
        (lesson.title && lesson.title.toLowerCase().includes(filterBy.toLowerCase())) ||
        (lesson.description && lesson.description.toLowerCase().includes(filterBy.toLowerCase())) ||
        (lesson.module && lesson.module.toLowerCase().includes(filterBy.toLowerCase())) ||
        (lesson.courseTopic && lesson.courseTopic.toLowerCase().includes(filterBy.toLowerCase()))
      )
    : sortedLessons;

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-700">
            Please log in to view your lessons
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
          <h1 className="text-2xl font-bold mb-1">All Lessons</h1>
          <p className="text-gray-600">
            Manage and view all your created lessons
          </p>
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

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search lessons..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          />
          {filterBy && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setFilterBy("")}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </div>
        <div className="flex-shrink-0">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="module">Sort by Module</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredLessons.length > 0 ? (
            <>
              <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700 border-b border-gray-200 hidden md:grid">
                <div className="col-span-5">Lesson</div>
                <div className="col-span-2">Module</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 hover:bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                      </div>
                      <div className="md:col-span-2 flex items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {lesson.module || lesson.courseTopic || "Uncategorized"}
                        </span>
                      </div>
                      <div className="md:col-span-2 flex items-center text-sm text-gray-500">
                        {lesson.createdAt
                          ? new Date(lesson.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div className="md:col-span-3 flex justify-start md:justify-end items-center space-x-3">
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        <Link
                          href={`/lessons/${lesson.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this lesson?")) {
                              // Implement delete functionality here
                              console.log("Delete lesson:", lesson.id);
                            }
                          }}
                          className="text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {filterBy ? (
                <p>No lessons found matching your search. Please try different keywords.</p>
              ) : (
                <div>
                  <p className="mb-4">You haven't created any lessons yet.</p>
                  <Link href="/lesson-generator">
                    <Button>Create Your First Lesson</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}