import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CareerAI Pro API",
    description="Backend for AI Career Advisor powered by LangGraph and Gemini",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "CareerAI Pro API is running"}



