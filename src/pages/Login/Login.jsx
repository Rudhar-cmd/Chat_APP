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
    <div className='login'>
      <div className="login-left">
        <img src={logo} alt="logo" className='login-logo' />
      </div>

      <form className='login-form' onSubmit={onSubmitHandler}>
        <h2 className='form-title'>
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <p className='form-subtitle'>
          {isLogin ? "Login to continue chatting" : "Start chatting in less than a minute."}
        </p>

        {!isLogin && (
          <div className="input-group">
            <label>Username</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              placeholder='Enter your username'
              className='form-input'
              required
            />
          </div>
        )}

        <div className="input-group">
          <label>Email address</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder='you@example.com'
            className='form-input'
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder={isLogin ? "Enter your password" : "Create a strong password"}
            className='form-input'
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
              <>Don’t have an account? <span className="login-toggle" onClick={() => setIsLogin(false)}>Sign up</span></>
            ) : (
              <>Already have an account? <span className="login-toggle" onClick={() => setIsLogin(true)}>Log in</span></>
            )}
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login
