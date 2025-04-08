  // src/lib/utils.ts
  export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  
  export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }