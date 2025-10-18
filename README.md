# StudyMentor

StudyMentor is a comprehensive study management application built with React and Vite. It provides tools for task management, note-taking, and flashcard studying to help students organize their learning effectively.

## 🚀 Setup Instructions

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gemini AI Configuration (for Notes Summarization and AI Assistant)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

1. **Supabase**: Create a project at [supabase.com](https://supabase.com) and get your URL and anon key
2. **Gemini AI**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Features

- ✅ **Notes Summarization** - AI-powered note summaries (requires Gemini API key)
- ✅ **AI Study Assistant** - Chat with AI for study help (requires Gemini API key)
- ✅ **Focus Timer** - Pomodoro-style study sessions
- ✅ **Flashcard System** - Create and study with flashcards
- ✅ **Task Management** - Organize your daily study goals

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Deployment fix
