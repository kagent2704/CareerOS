"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import "./auth.css";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function social() {
    if (!isSupabaseConfigured()) return setMessage("Connect Supabase in Vercel before signing in.");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setMessage(error.message); setLoading(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured()) return setMessage("Connect Supabase in Vercel before signing in.");
    setLoading(true); setMessage("");
    const supabase = createClient();
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
      setMessage(error ? error.message : "Check your inbox to confirm your account.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); setLoading(false); return; }
    router.push("/");
    router.refresh();
  }

  return <main className="auth-page">
    <section className="auth-story">
      <a className="auth-brand" href="#"><span>C</span>Career<b>OS</b></a>
      <div className="story-copy"><p className="story-kicker">YOUR CAREER COMMAND CENTER</p><h1>Turn ambition into<br/><em>momentum.</em></h1><p>Plan your search, prepare with purpose, and make every application count.</p></div>
      <div className="story-proof"><div><strong>24</strong><span>Applications tracked</span></div><div><strong>37.5%</strong><span>Response rate</span></div><div><strong>2.4×</strong><span>Better focus</span></div></div>
    </section>
    <section className="auth-form-side">
      <div className="auth-card">
        <p className="auth-eyebrow">{mode === "signin" ? "WELCOME BACK" : "START YOUR JOURNEY"}</p>
        <h2>{mode === "signin" ? "Sign in to CareerOS" : "Create your account"}</h2>
        <p className="auth-subtitle">{mode === "signin" ? "Your next opportunity is waiting." : "Build a job search system that works for you."}</p>
        <div className="social-grid">
          <button onClick={social} disabled={loading}><span className="google">G</span>Continue with Google</button>
        </div>
        <div className="divider"><span>or continue with email</span></div>
        <form onSubmit={submit}>
          {mode === "signup" && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kashish Mehta" required /></label>}
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          <label>Password<span className="label-row">Password {mode === "signin" && <button type="button">Forgot password?</button>}</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="submit-auth" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}<span>→</span></button>
        </form>
        <p className="auth-switch">{mode === "signin" ? "New to CareerOS?" : "Already have an account?"} <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "Create an account" : "Sign in"}</button></p>
        <p className="legal">By continuing, you agree to our Terms and Privacy Policy.</p>
      </div>
    </section>
  </main>;
}
