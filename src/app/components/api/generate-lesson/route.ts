// src/app/api/generate-lesson/route.ts
import { NextResponse } from 'next/server';
import { generateLessonWithGroq } from '@/lib/groq';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate input
    if (!data.courseTopic) {
      return NextResponse.json({ error: 'Course topic is required' }, { status: 400 });
    }
    
    try {
      // Generate lesson using GROQ
      const lessonData = await generateLessonWithGroq(data);
      
      return NextResponse.json(lessonData);
    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      // Fall back to sample data generator if AI service fails
      return NextResponse.json({ 
        error: 'AI service error', 
        message: 'Failed to generate lesson with AI service',
        details: aiError instanceof Error ? aiError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating lesson:', error);
    return NextResponse.json({ error: 'Failed to generate lesson' }, { status: 500 });
  }
}