from langgraph.graph import StateGraph, END
from agent.state import AgentState
from agent.nodes import conversational_analyzer

def create_career_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("conversational_analyzer", conversational_analyzer)
    workflow.set_entry_point("conversational_analyzer")
    workflow.add_edge("conversational_analyzer", END)

    app = workflow.compile()
    return app

career_agent = create_career_graph()
