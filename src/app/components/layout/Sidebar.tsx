// src/app/components/layout/Sidebar.tsx (continued)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Lesson Generator', href: '/lesson-generator', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Module Builder', href: '/module-builder', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={`flex items-center p-2 rounded-lg ${
                  pathname === item.href 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg 
                  className={`w-5 h-5 ${
                    pathname === item.href ? 'text-blue-700' : 'text-gray-500'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="pt-5 mt-5 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">
            Recent Lessons
          </h3>
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100">
                Introduction to JavaScript
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100">
                Data Structures Basics
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100">
                CSS Grid Layout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
