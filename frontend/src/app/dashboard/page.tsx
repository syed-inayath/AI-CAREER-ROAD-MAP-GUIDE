"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, LayoutDashboard, Target, Briefcase, Send, Bot, User, X, Menu, Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("AI Advisor");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<{
    skills: string[], 
    profile_summary: string, 
    roadmap: any[], 
    job_market_data: any
  }>({skills: [], profile_summary: "", roadmap: [], job_market_data: {}});
  
  // Dummy states that will eventually be replaced by real DB fetches if we built full endpoints for them, 
  // but for now they are managed via chat response or simple local state
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [jobs, setJobs] = useState<string>("");

  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");
      
      const res = await fetch("/api/v1/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const handleDeleteSkill = async (skill: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/profile/skills/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({...prev, skills: data.skills}));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!response.body) throw new Error("No body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMsg = "";
      
      setMessages(prev => [...prev, { role: "agent", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                aiMsg += data.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = aiMsg;
                  return newMsgs;
                });
              }
            } catch(e) {}
          }
        }
      }
      
      // Refresh profile to show newly extracted skills
      await fetchProfile();
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/profile/generate-roadmap", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({...prev, roadmap: data.roadmap}));
      } else {
        alert("Failed to generate roadmap. Make sure you have extracted skills first.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleSearchJobs = async () => {
    setIsSearchingJobs(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/profile/search-jobs", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({...prev, job_market_data: data.job_market_data}));
      } else {
        alert("Failed to search jobs. Make sure you have extracted skills first.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingJobs(false);
    }
  };

  const navItems = [
    { name: "AI Advisor", icon: MessageSquare },
    { name: "Overview", icon: LayoutDashboard },
    { name: "Skill Roadmap", icon: Target },
    { name: "Job Matches", icon: Briefcase }
  ];

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
      
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        className="glass border-r border-white/5 flex flex-col relative z-20 transition-all duration-300"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <span className="font-bold text-cyan-400">C</span>
                </div>
                <span className="font-semibold tracking-wide">CareerAI Pro</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                } ${!isSidebarOpen ? 'justify-center' : ''}`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            className={`flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <User className="w-5 h-5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 shrink-0 glass z-10">
          <h2 className="text-lg font-semibold">{activeTab}</h2>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          
          {/* VIEW: AI Advisor (Chat) */}
          {activeTab === "AI Advisor" && (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 pb-24 pr-4">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <Bot className="w-12 h-12 text-cyan-400/50" />
                    <p>Tell me about your current skills or what you want to achieve.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'agent' && (
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30">
                        <Bot className="w-4 h-4 text-cyan-400" />
                      </div>
                    )}
                    <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-white rounded-tr-sm' 
                        : 'glass border-white/5 text-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.content || <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 max-w-4xl mx-auto">
                <form onSubmit={handleSend} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for career advice, enter skills, or search jobs..."
                    className="w-full bg-[#0f0f13] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 shadow-2xl transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 disabled:opacity-50 disabled:text-slate-500 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: Overview */}
          {activeTab === "Overview" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4 text-white">Profile Summary</h3>
                <p className="text-slate-300 leading-relaxed">
                  {profile.profile_summary || "Start chatting with the AI Advisor to generate your professional summary!"}
                </p>
              </div>
              
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  Extracted Skills
                  <span className="text-xs font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {profile.skills.length}
                  </span>
                </h3>
                {profile.skills.length === 0 ? (
                  <p className="text-slate-400 text-sm">No skills extracted yet. Tell the AI Advisor what you know!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <div key={i} className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                        {skill}
                        <button 
                          onClick={() => handleDeleteSkill(skill)}
                          className="text-cyan-500 hover:text-cyan-300 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: Roadmap */}
          {activeTab === "Skill Roadmap" && (
            <div className="max-w-3xl mx-auto space-y-8 py-4">
              <div className="text-center mb-10 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-2">Your Career Roadmap</h2>
                <p className="text-slate-400 mb-6">Generated dynamically based on your current skill gaps.</p>
                <button 
                  onClick={handleGenerateRoadmap}
                  disabled={isGeneratingRoadmap || profile.skills.length === 0}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {isGeneratingRoadmap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                  {isGeneratingRoadmap ? "Generating..." : "Generate Roadmap"}
                </button>
              </div>
              
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-white/10 before:to-transparent">
                {profile.roadmap && profile.roadmap.length > 0 ? profile.roadmap.map((step, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#080808] bg-cyan-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {index + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-5 rounded-2xl border-white/5">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-white">{step.title || `Step ${index + 1}`}</div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${step.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-slate-400'}`}>{step.status || 'pending'}</span>
                      </div>
                      <div className="text-sm text-slate-400 mt-2 leading-relaxed">{step.description}</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm text-center py-10 w-full relative z-10">No roadmap generated yet. Chat with the AI Advisor about your skills!</p>
                )}
              </div>
            </div>
          )}

          {/* VIEW: Job Matches */}
          {activeTab === "Job Matches" && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="glass p-6 rounded-2xl flex items-center justify-between border-cyan-500/20">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">Live Job Search</h3>
                  <p className="text-sm text-slate-400">Powered by DuckDuckGo based on your extracted skills.</p>
                </div>
                <button 
                  onClick={handleSearchJobs}
                  disabled={isSearchingJobs || profile.skills.length === 0}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isSearchingJobs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                  {isSearchingJobs ? "Searching..." : "Search Now"}
                </button>
              </div>
              
              <div className="space-y-4">
                {profile.job_market_data && profile.job_market_data.jobs && profile.job_market_data.jobs.length > 0 ? (
                  profile.job_market_data.jobs.map((job: any, i: number) => (
                    <div key={i} className="glass p-5 rounded-2xl border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:bg-white/5">
                      <div className="space-y-2 flex-1">
                        <h4 className="text-lg font-bold text-white leading-tight">{job.title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{job.body}</p>
                      </div>
                      <a 
                        href={job.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-center text-cyan-50 flex items-center justify-center"
                      >
                        View in Browser
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="glass p-6 rounded-2xl">
                    <p className="text-slate-400 text-sm text-center py-10">No live job matches found yet. Click Search Now to find jobs!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
