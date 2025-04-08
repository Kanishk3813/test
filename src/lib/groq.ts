// src/lib/groq.ts
import { Lesson } from './types';

export async function generateLessonWithGroq(data: {
  courseTopic: string;
  lessonTitle: string;
  targetAudience: string;
  difficultyLevel: string;
  additionalInstructions: string;
}): Promise<Lesson> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ API key is not configured');
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator specializing in creating well-structured, engaging lessons. 
            You will create a comprehensive lesson based on the provided information.
            Format your response as a valid JSON object without any additional text, markdown, or explanations.`
          },
          {
            role: 'user',
            content: `Create a detailed lesson on "${data.courseTopic}" 
            with the title "${data.lessonTitle || `Understanding ${data.courseTopic}`}".
            The lesson is intended for ${data.targetAudience || 'undergraduate students'} 
            and should be at a ${data.difficultyLevel || 'intermediate'} difficulty level.
            Additional instructions: ${data.additionalInstructions || 'Make it engaging and practical'}.
            
            The response should be a JSON object with the following structure:
            {
              "title": "Lesson title",
              "description": "A concise but comprehensive description of the lesson",
              "targetAudience": "The intended audience",
              "difficultyLevel": "beginner/intermediate/advanced",
              "learningOutcomes": ["Outcome 1", "Outcome 2", ...],
              "keyConcepts": [
                {
                  "term": "Concept name",
                  "definition": "Definition of the concept"
                },
                ...
              ],
              "content": "The main body of the lesson, with paragraphs separated by newlines",
              "activities": [
                {
                  "title": "Activity title",
                  "instructions": "Detailed instructions for the activity"
                },
                ...
              ],
              "assessment": "Description of how learning will be assessed, with numbered items"
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const result = await response.json();
    let lessonData: Lesson;

    try {
      // Extract the JSON from the AI response
      const jsonContent = result.choices[0].message.content;
      lessonData = JSON.parse(jsonContent);
      
      // Ensure the lesson object has the required structure
      if (!lessonData.title || !lessonData.description) {
        throw new Error('Invalid lesson data structure');
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse the AI-generated lesson');
    }
    
    // Add timestamps and ID
    const now = new Date().toISOString();
    lessonData.createdAt = now;
    lessonData.updatedAt = now;
    lessonData.id = Math.random().toString(36).substring(2, 15);
    
    return lessonData;
  } catch (error) {
    console.error('Error generating lesson with GROQ:', error);
    throw error;
  }
}