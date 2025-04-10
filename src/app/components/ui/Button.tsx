// src/app/components/ui/Button.tsx
'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'default', children, className, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  };
  
  const sizeStyles = "h-10 py-2 px-4 text-sm";
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizeStyles} ${className || ''}`;
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
} 