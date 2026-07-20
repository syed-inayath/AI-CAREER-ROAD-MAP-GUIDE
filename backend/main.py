from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.routes import router as api_router
import os
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

# Mount the static files from the Next.js build
frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/out")

if os.path.isdir(frontend_build_path):
    app.mount("/_next", StaticFiles(directory=os.path.join(frontend_build_path, "_next")), name="next-static")
    # For serving static assets like images or CSS in the root
    # Note: StaticFiles cannot easily serve the index.html for React SPA paths without custom routing
    
    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(frontend_build_path, "index.html"))

    # Catch-all route to serve the SPA index.html or specific html files
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent accessing files outside the directory or API routes
        if full_path.startswith("api/"):
            return {"error": "Not Found"}
            
        file_path = os.path.join(frontend_build_path, full_path)
        
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        html_path = f"{file_path}.html"
        if os.path.isfile(html_path):
            return FileResponse(html_path)
            
        # Fallback to SPA index
        return FileResponse(os.path.join(frontend_build_path, "index.html"))

