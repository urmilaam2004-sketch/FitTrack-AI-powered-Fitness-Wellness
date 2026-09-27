# FitTrack – AI-Powered Personal Fitness & Wellness Tracker

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs
- AI: Google Gemini through `@google/genai`

## Modules
Authentication/Profile, Workout, Hydration, Sleep, Nutrition, Activity,
Mood & Stress, Daily Goals, Habits/Streaks, AI Recommendations,
AI Insights, Analytics Dashboard.

## Run
### Backend
cd server
npm install
copy .env.example .env
# edit .env with MongoDB URI, JWT secret and Gemini API key
npm run dev

### Frontend
cd client
npm install
npm run dev

Open the Vite URL shown in the terminal.

## Notes
- MongoDB must be running locally or use MongoDB Atlas.
- AI routes return a clear message when GEMINI_API_KEY is not configured.
