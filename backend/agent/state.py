from typing import Annotated, TypedDict, List
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_profile: dict
    profile_summary: str
    skills_gap: dict
    job_market_data: dict
    roadmap: list
    next_node: str
