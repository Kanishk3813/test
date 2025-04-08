// src/app/components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { currentUser, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleAuthClick = () => {
    if (currentUser) {
      // If user is logged in, show dropdown
      toggleDropdown();
    } else {
      // If user is not logged in, redirect to login page
      router.push('/auth/login');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CourseGPT
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/lesson-generator" className="text-gray-600 hover:text-blue-600 font-medium">
              Lesson Generator
            </Link>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
              Documentation
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none" 
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {currentUser.photoURL ? (
                    <Image 
                      src={currentUser.photoURL} 
                      alt="User profile" 
                      width={32} 
                      height={32} 
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {currentUser.name || currentUser.email?.split('@')[0]}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button 
                        onClick={() => {
                          signOut();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => router.push('/auth/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign in
              </button>
            )}
            
            <button className="bg-gray-100 rounded-full p-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}