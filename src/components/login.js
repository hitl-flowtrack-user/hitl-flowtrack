import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Smartphone } from 'lucide-react';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("flowtrack_session", userCredential.user.uid);
      setAuth(true);
    } catch (error) {
      alert("Access Denied: Invalid Credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]"></div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-amber-500/10 rounded-3xl mb-4 border border-amber-500/20">
            <ShieldCheck size={40} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-black italic text-white tracking-tighter uppercase">
            Secure <span className="text-amber-500">Gateway</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase mt-2">Enterprise Access System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 font-black uppercase ml-2 tracking-widest">Operator Identity</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type="email" required placeholder="email@enterprise.com"
                className="w-full bg-black border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-amber-500 text-sm font-bold text-white transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 font-black uppercase ml-2 tracking-widest">Security Token</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input 
                type={showPass ? "text" : "password"} required placeholder="••••••••"
                className="w-full bg-black border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-amber-500 text-sm font-bold text-white transition-all"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-amber-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : "Authorize Access"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <Smartphone size={12} /> Mobile Verified
          </div>
          <div>v2.1.0-FT</div>
        </div>
      </div>
    </div>
  );
};

export default Login;