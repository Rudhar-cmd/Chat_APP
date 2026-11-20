import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import logo from '../../assets/ChatGPT Image Dec 6, 2025, 02_09_34 PM.png'
import './Login.css'
import { signup, login } from '../../config/firebase'

function Login() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = async (event) => {
    event.preventDefault();
  
    if (!isLogin) {
      // SIGNUP
      const res = await signup(username, email, password);

      if (res === "NEW_USER") {
        navigate("/profile");   // go to profile setup
      }
  
    } else {
      // LOGIN
      const res = await login(email, password);

      if (res === "LOGGED_IN") {
        navigate("/chat");       // go to chat
      }
    }
  };

  return (
    <main className='login'>
      <div className="login-left">
        <img src={logo} alt="logo" className='login-logo' />
        <p className="brand-eyebrow">A little closer, every day</p>
        <h1 className="brand-title">Good conversations<br /><span>start here.</span></h1>
        <p className="brand-subtitle">
          Find your people, share a moment, and keep every conversation going.
        </p>
        <div className="login-points" aria-label="Chat app features">
          <span>Private chats</span>
          <span>Share photos</span>
          <span>Always in sync</span>
        </div>
      </div>

      <form className='login-form' onSubmit={onSubmitHandler}>
        <p className="form-kicker">{isLogin ? "Welcome back" : "Get started for free"}</p>
        <h2 className='form-title'>
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <p className='form-subtitle'>
          {isLogin ? "Login to continue chatting" : "Start chatting in less than a minute."}
        </p>

        {!isLogin && (
          <div className="input-group">
            <label htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              placeholder='Enter your username'
              className='form-input'
              autoComplete="username"
              required
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="account-email">Email address</label>
          <input
            id="account-email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder='you@example.com'
            className='form-input'
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="account-password">Password</label>
          <input
            id="account-password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder={isLogin ? "Enter your password" : "Create a strong password"}
            className='form-input'
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {!isLogin && (
          <div className='login-term'>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <span>Terms of Use</span> & <span>Privacy Policy</span>.
            </label>
          </div>
        )}

        <button type="submit" className="submit-btn">
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        <div className='login-footer'>
          <p>
            {isLogin ? (
              <>Don’t have an account? <button type="button" className="login-toggle" onClick={() => setIsLogin(false)}>Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" className="login-toggle" onClick={() => setIsLogin(true)}>Log in</button></>
            )}
          </p>
        </div>
      </form>
    </main>
  )
}

export default Login
