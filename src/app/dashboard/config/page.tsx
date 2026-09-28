"use client";

import { useState } from "react";
import { Settings, User, Lock, Bot, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ConfigPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setStatus("error");
      setMessage("Username and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("Credentials updated successfully! You can now use these to log in.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to update credentials.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Network error occurred.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-[#F8F9FA] dark:bg-black">
      <div className="mb-12 animate-fade-up">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Account Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your system settings and secure access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          
          {/* Dashboard Credentials Settings */}
          <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-mahindra-red/5 rounded-full blur-3xl -ml-32 -mt-32 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />
            
            <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-mahindra-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5 text-mahindra-red" />
              </div>
              <span>Admin Credentials</span>
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">New Username</label>
                <div className="flex relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mahindra-red/50 focus:border-mahindra-red transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">New Password</label>
                <div className="flex relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mahindra-red/50 focus:border-mahindra-red transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">Confirm New Password</label>
                <div className="flex relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mahindra-red/50 focus:border-mahindra-red transition-all duration-300"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-mahindra-red hover:bg-mahindra-red-dark text-white font-extrabold uppercase tracking-widest text-sm transition-all duration-300 flex justify-center items-center gap-3 rounded-2xl shadow-lg hover:shadow-mahindra-red/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                  ) : (
                    "Update Credentials"
                  )}
                </button>
              </div>
              
              {status === 'success' && (
                <div className="p-4 rounded-xl text-sm font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-500/20 flex items-start gap-3 mt-4 animate-pop">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 flex items-start gap-3 mt-4 animate-pop">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {/* Agent Settings Note */}
          <div className="bg-mahindra-red/5 border border-mahindra-red/20 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mahindra-red/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12 pointer-events-none">
              <Bot className="w-32 h-32 text-mahindra-red" />
            </div>

            <h3 className="text-xs font-black uppercase tracking-widest text-mahindra-red flex items-center gap-2 mb-3 relative z-10">
              <Settings className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
              AI Behavior Profile
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium relative z-10">
              The internal AI logic, prompting guardrails, and acoustic model parameters are securely locked. To request changes to the conversational AI behavior, please contact your account manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
