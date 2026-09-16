"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, expectedRole: "admin" }) });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!response.ok) throw new Error(data.error ?? "Admin login failed.");
      router.push("/?admin=1");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Admin login failed."); }
    finally { setLoading(false); }
  };

  return <main className="admin-login-page"><section className="admin-login-card"><Link className="admin-login-back" href="/">← Back to portal</Link><div className="admin-login-badge">A</div><p>LEARN.WITH.AKSHAY</p><h1>Admin access</h1><span>Use your administrator account to manage quizzes, notes, assignments and reports.</span><form onSubmit={submit}><label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></label><label>Password<span className="password-field"><input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "🙈" : "👁"}</button></span></label>{message && <div className="admin-login-message">{message}</div>}<button disabled={loading} className="admin-login-submit">{loading ? "Checking access…" : "Login as administrator →"}</button></form><small>Student accounts cannot access this page.</small></section></main>;
}
