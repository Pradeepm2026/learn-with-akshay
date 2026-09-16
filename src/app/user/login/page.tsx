"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const router = useRouter(); const [mobile, setMobile] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setMessage(""); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile }) }); const raw = await response.text(); let data: { error?: string } = {}; try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error("Database server did not return a valid response. Please try again."); } if (!response.ok) throw new Error(data.error ?? "User login failed."); router.push("/"); } catch (error) { setMessage(error instanceof Error ? error.message : "User login failed."); } finally { setLoading(false); } };
  return <main className="admin-login-page"><section className="admin-login-card user-mobile-login"><Link className="admin-login-back" href="/">← Back to portal</Link><div className="admin-login-badge">U</div><p>LEARN.WITH.AKSHAY</p><h1>User account</h1><span>Enter the mobile number registered by your administrator.</span><form onSubmit={submit}><label>Mobile number<input required inputMode="numeric" maxLength={10} value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" /></label>{message && <div className="admin-login-message">{message}</div>}<button disabled={loading} className="admin-login-submit">{loading ? "Checking account…" : "Login with mobile number →"}</button></form></section></main>;
}
