from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
import json

from db.database import get_db
from db.models import User, UserProfile
from api.auth import get_current_user

from ddgs import DDGS
from langchain_core.messages import SystemMessage, HumanMessage
from agent.nodes import get_llm

router = APIRouter()

# Fixed route to respond to both /profile and /profile/ seamlessly
@router.get("")
@router.get("/")
def get_profile(current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {
        "full_name": profile.full_name,
        "skills": profile.skills_list if profile.skills_list else [],
        "profile_summary": profile.profile_summary if profile.profile_summary else "",
        "roadmap": profile.roadmap if profile.roadmap else [],
        "job_market_data": profile.job_market_data if profile.job_market_data else {}
    }

@router.delete("/skills/{skill_name}")
def delete_skill(skill_name: str, current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    skills = profile.skills_list if profile.skills_list else []
    
    # Remove the skill case-insensitively
    updated_skills = [s for s in skills if s.lower() != skill_name.lower()]
    
    profile.skills_list = updated_skills
    db.commit()
    
    return {"message": f"Skill {skill_name} removed", "skills": updated_skills}

@router.post("/generate-roadmap")
def generate_roadmap(current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    skills = profile.skills_list if profile.skills_list else []
    if not skills:
        raise HTTPException(status_code=400, detail="No skills found. Please add skills via chat first.")
        
    llm = get_llm()
    prompt = SystemMessage(content=f"""
You are an expert career advisor.
Generate a realistic career roadmap based on these skills: {skills}
Return ONLY raw JSON in this exact structure:
[
  {{"title": "Step 1", "description": "What to do first", "status": "active"}},
  {{"title": "Step 2", "description": "What to do next", "status": "pending"}}
]
""")
    human_msg = HumanMessage(content="Please generate my career roadmap based on my skills.")
    try:
        response = llm.invoke([prompt, human_msg])
        clean_text = response.content.strip().strip('`').removeprefix('json').strip()
        roadmap = json.loads(clean_text)
        
        profile.roadmap = roadmap
        db.commit()
        return {"message": "Roadmap generated successfully", "roadmap": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")

@router.post("/search-jobs")
def search_jobs(current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    skills = profile.skills_list if profile.skills_list else []
    if not skills:
        raise HTTPException(status_code=400, detail="No skills found. Please add skills via chat first.")
        
    query = f"latest tech jobs requiring {', '.join(skills[:3])} site:linkedin.com/jobs OR site:indeed.com/viewjob"
    
    try:
        results = DDGS().text(query, max_results=6)
        
        # Results is a list of dicts: [{'title': '...', 'href': '...', 'body': '...'}]
        job_market_data = {"jobs": results, "query": query}
        
        profile.job_market_data = job_market_data
        db.commit()
        return {"message": "Jobs searched successfully", "job_market_data": job_market_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search jobs: {str(e)}")
