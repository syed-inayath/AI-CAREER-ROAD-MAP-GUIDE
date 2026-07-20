"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login Request
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        const response = await fetch("/api/v1/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Login failed");
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");

      } else {
        // Signup Request
        const response = await fetch("/api/v1/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Signup failed");
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />

      <main className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl glass-neon mb-4"
          >
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-fira-code)] text-glow">CareerAI Pro</h1>
          <p className="text-slate-400 mt-2 font-[family-name:var(--font-fira-sans)]">Your intelligent path to decent work.</p>
        </div>

        <motion.div 
          className="glass rounded-3xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between mb-8">
            <button 
              type="button"
              className={`text-sm font-medium pb-2 px-2 transition-colors ${isLogin ? 'text-white border-b-2 border-cyan-400' : 'text-slate-500'}`}
              onClick={() => { setIsLogin(true); setError(""); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`text-sm font-medium pb-2 px-2 transition-colors ${!isLogin ? 'text-white border-b-2 border-cyan-400' : 'text-slate-500'}`}
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              Create Account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  placeholder="Full Name" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all"
              />
            </div>
            
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? "Access Dashboard" : "Start Journey"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
