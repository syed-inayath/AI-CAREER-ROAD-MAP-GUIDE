# CareerAI: Intelligent Career Advisor

CareerAI is a sophisticated, full-stack, AI-driven career mentoring platform. It acts as a personalized career advisor that analyzes your conversations, extracts your core skills, generates custom roadmaps, and scrapes the live internet for job opportunities tailored specifically to you.

Built with a state-of-the-art "Pro Max" dark mode glassmorphic UI and an intelligent LangGraph backend, CareerAI offers a premium software-as-a-service (SaaS) experience.

## ✨ Key Features

- **🧠 Intelligent Skill Extraction:** Powered by Google Gemini and LangGraph, the AI naturally converses with you while silently analyzing your messages to extract and persist your technical and soft skills.
- **🗺️ Dynamic Career Roadmaps:** Generates structured, step-by-step career roadmaps based on your unique skill gaps and goals using on-demand generative AI.
- **💼 Live Job Search:** Utilizes DuckDuckGo (via the `ddgs` package) to scrape live tech jobs (from LinkedIn, Indeed, etc.) that specifically require your extracted tech stack, displayed beautifully in individual UI cards.
- **🎨 Premium UI/UX:** Built with Next.js and Tailwind CSS, featuring deep dark themes, glassmorphism, micro-animations (Framer Motion), custom scrollbars, and a fully responsive collapsible sidebar architecture.
- **🔒 Secure Authentication:** Full JWT-based user authentication and encrypted password storage. SQLite database for seamless persistent state tracking across sessions.

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js (React 18)
- **Styling:** Tailwind CSS (Custom Pro Max theme)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Markdown:** React Markdown

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite & SQLAlchemy (ORM)
- **Authentication:** JWT (JSON Web Tokens) & Passlib

### AI & Agents
- **Orchestration:** LangGraph & LangChain
- **LLM:** Google Gemini (gemini-2.5-flash)
- **Web Scraping:** DuckDuckGo Search (`ddgs`)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Google Gemini API Key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt
pip install ddgs langchain-google-genai langchain-community

# Set up environment variables
# Create a .env file in the backend directory:
# GOOGLE_API_KEY=your_gemini_key_here
# SECRET_KEY=your_jwt_secret_here

# Run the server
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Usage
- Navigate to `http://localhost:3000` in your browser.
- Create a new account and sign in.
- Go to the **AI Advisor** tab and chat about your skills (e.g., "I know React and Node.js").
- Head over to the **Overview**, **Skill Roadmap**, and **Job Matches** tabs to instantly generate personalized career insights!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
