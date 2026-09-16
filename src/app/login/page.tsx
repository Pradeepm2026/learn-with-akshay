import Link from "next/link";

export default function LoginChoicePage() {
  return <main className="login-choice-page"><section className="login-choice-card"><p>LEARN.WITH.AKSHAY</p><h1>Welcome back</h1><span>Choose the type of account you want to use.</span><div className="login-choice-buttons"><Link className="user-login-choice" href="/user/login"><i>U</i><strong>User login</strong><small>Login with your registered mobile number</small><b>Continue →</b></Link><Link className="admin-login-choice" href="/admin/login"><i>A</i><strong>Admin login</strong><small>Manage your coaching portal</small><b>Admin access →</b></Link></div></section></main>;
}
