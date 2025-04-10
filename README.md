# CourseGPT

## AI-Powered Course Authoring Platform

CourseGPT is an intelligent authoring tool that empowers educators and content creators to efficiently create, organize, and enhance educational content. This innovative platform transforms the course creation process through AI-assisted content generation, structured templates, and intuitive organization tools.

## Demo Video 🎥

https://github.com/user-attachments/assets/cc3a85c4-9eab-4027-a354-7138b0d91c98

## 🚀 Features

### Lesson Generator
- Create high-quality educational content with AI assistance
- Generate well-structured lessons with comprehensive components:
  - Compelling titles and descriptions
  - Clear learning outcomes
  - Key concepts with definitions
  - Engaging content with proper formatting
  - Interactive activities with instructions
  - Assessment materials to evaluate learning

### Module Organization System
- Group related lessons into cohesive modules
- Track prerequisites, difficulty levels, and estimated completion times
- Visualize course structure and lesson relationships

### Interactive Content Editor
- Intuitive interface for refining AI-generated content
- Section-specific regeneration capabilities
- Education-focused formatting tools

## 📊 Dashboard

The dashboard provides an overview of your course content, showing:
- Total lessons created
- Module completion rates
- Recent lessons with quick access to view and edit

## 🛠️ Tech Stack

- **Frontend**: Next.js
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Integration**: Groq API with LLaMa 3 model

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account with Firestore database
- Groq API key for AI content generation

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kanishk3813/test.git
cd coursegpt
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
GROQ_API_KEY=your_groq_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## 📂 Project Structure

```
src/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── components/       # React components
│   ├── dashboard/        # Dashboard page
│   ├── lesson-generator/ # Lesson generator page
│   ├── lessons/          # Lesson view/edit pages
│   └── modules/          # Module management pages
├── lib/                  # Utility functions and hooks
│   ├── AuthContext.tsx   # Authentication context
│   ├── firebase.ts       # Firebase configuration
│   ├── groq.ts           # Groq API integration
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## ✨ Key Components

### LessonForm
The `LessonForm` component provides an intuitive interface for collecting user input to generate new lessons. It includes fields for:
- Course topic
- Lesson title
- Target audience
- Difficulty level
- Additional instructions

### LessonDisplay
The `LessonDisplay` component renders a comprehensive view of a lesson, including all its sections:
- Title and description
- Learning outcomes
- Key concepts
- Main content
- Activities
- Assessment

It also provides options to save, edit, or download the lesson.

### ModuleBuilder
The `ModuleBuilder` component allows users to organize lessons into cohesive modules. Features include:
- Drag-and-drop lesson arrangement
- Module metadata management
- Prerequisite linking
- Module status tracking

### ContentEditor
The `ContentEditor` component provides rich text editing capabilities specifically designed for educational content:
- Section-specific editing
- Formatting tools for educational content
- Option to regenerate specific sections
- Preview functionality

## 🔥 Firebase Integration

The project uses Firebase for:
- User authentication (email/password and Google Sign-In)
- Firestore database for storing lessons and modules
- Storage for any uploaded assets

## 🤖 AI Integration

CourseGPT leverages the Groq API with the LLaMa 3 model to generate high-quality educational content. The integration:
- Takes user input about lesson topics and requirements
- Generates structured educational content with proper formatting
- Returns JSON-formatted lesson data ready for display and editing

## 🌟 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Firebase](https://firebase.google.com/) - Authentication and database
- [Groq](https://groq.com/) - AI language model provider

