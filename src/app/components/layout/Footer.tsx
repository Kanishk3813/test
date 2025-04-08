// src/app/components/layout/Footer.tsx
export function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <span className="text-sm text-gray-500">
                © 2025 CourseGPT. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Help</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }