from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated
import json
import asyncio

from agent.graph import career_agent
from langchain_core.messages import HumanMessage, AIMessage
from api.auth import get_current_user
from db.models import User, UserProfile
from db.database import get_db

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    db_skills = profile.skills_list if profile and profile.skills_list else []
    db_summary = profile.profile_summary if profile and profile.profile_summary else ""

    async def event_generator():
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_profile": {"skills": db_skills},
            "profile_summary": db_summary,
            "roadmap": [],
            "skills_gap": {},
            "job_market_data": {},
            "next_node": ""
        }
        
        final_state = None
        for chunk in career_agent.stream(initial_state):
            final_state = chunk
            # The chunk is a dictionary keyed by node name
            for node_name, state in chunk.items():
                if "messages" in state and state["messages"]:
                    latest_msg = state["messages"][-1]
                    if isinstance(latest_msg, AIMessage):
                        yield f"data: {json.dumps({'content': latest_msg.content})}\n\n"

        # Save to DB after LangGraph completes
        if final_state and profile:
            # final_state will be a dict from the final node. In Langgraph 0.1+, stream yields dicts mapping node->output
            # If the output updates user_profile, we grab it.
            last_node_state = list(final_state.values())[0]
            
            # Re-read all state elements in case they were updated
            updated_skills = last_node_state.get("user_profile", {}).get("skills", db_skills)
            updated_summary = last_node_state.get("profile_summary", db_summary)
            updated_roadmap = last_node_state.get("roadmap", profile.roadmap if profile.roadmap else [])
            updated_jobs = last_node_state.get("job_market_data", profile.job_market_data if profile.job_market_data else {})
            
            profile.skills_list = updated_skills
            profile.profile_summary = updated_summary
            profile.roadmap = updated_roadmap
            profile.job_market_data = updated_jobs
            
            db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
