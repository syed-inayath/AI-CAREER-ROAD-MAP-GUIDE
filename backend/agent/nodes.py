import json
from langchain_core.messages import AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from agent.state import AgentState

def get_llm():
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)

def conversational_analyzer(state: AgentState):
    llm = get_llm()
    messages = state["messages"]
    
    # Existing skills from the database (passed in via state)
    existing_skills = state.get("user_profile", {}).get("skills", [])
    
    prompt = SystemMessage(content=f"""
You are CareerAI, an expert, encouraging, and highly intelligent AI Career Advisor.
The user is talking to you. You must do TWO things:
1. Respond to the user's message conversationally, providing great career advice or acknowledging their skills.
2. Analyze their message to see if they mentioned any skills (e.g. programming languages, tools, soft skills, frameworks).
Currently known skills: {existing_skills}

You MUST return your response ONLY as a raw JSON object with this exact structure (do not include markdown formatting or backticks):
{{
  "ai_message": "Your conversational response to the user",
  "new_skills": ["List", "of", "new", "skills", "found", "or", "empty", "array", "if", "none"],
  "profile_summary": "A short, updated 2-sentence professional summary of this user based on their skills and chat."
}}
""")
    
    try:
        response = llm.invoke([prompt] + messages)
        # Strip markdown formatting if the LLM adds it
        clean_text = response.content.strip().strip('`').removeprefix('json').strip()
        data = json.loads(clean_text)
        
        ai_message = data.get("ai_message", "I understand. Let's keep working on your career profile!")
        new_skills = data.get("new_skills", [])
        
        # Merge skills uniquely and case-insensitively
        merged_skills = list(set([s.lower().title() for s in existing_skills + new_skills]))
        
        user_profile = {"skills": merged_skills}
        profile_summary = data.get("profile_summary", state.get("profile_summary", ""))
        
        return {
            "messages": [AIMessage(content=ai_message)], 
            "user_profile": user_profile, 
            "profile_summary": profile_summary,
            "next_node": "end"
        }
    except Exception as e:
        print("Error parsing profile json:", e)
        # Fallback if the LLM failed to output JSON
        fallback_msg = AIMessage(content="I'm here to help with your career! Please tell me more about your skills and goals.")
        return {"messages": [fallback_msg], "next_node": "end"}
