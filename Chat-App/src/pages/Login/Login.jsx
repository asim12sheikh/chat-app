import React, { useState } from 'react'
import "./Login.css"
import assets from "../../assets/assets"
import { signup,login,resetPassword } from '../../config/firebase';

const Login = () => {

  const [currState, setCurrState] = useState("Sign Up");
  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("");
  

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign Up") {
      signup(username,email,password)
    }
    else {
      login(email,password)
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} className='logo' />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign Up" ? <input onChange={(e)=>setUsername(e.target.value)} value={username} type="text" placeholder='Username' className="form-input" required/> : null}

        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Enter Your Email' className="form-input" required />

        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Enter Your Password' className="form-input" required />

        <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login Now" }</button>
        
        <div className="login-terms">
          <input type="checkbox" required/>
          <p>Agree to the terms of use & privacy policy</p>
        </div>
       <div className="login-forgot">
          {
            currState === "Sign Up" ? <p className='login-toggle'>Already have an account ? <span onClick={()=>setCurrState("Login")}>Login Here</span></p>
            :
            <p className='login-toggle'>Don't have an Account ?<span onClick={()=>setCurrState("Sign Up")}>Click Here</span></p>
          }
          {currState === "Login" ? <p className='login-toggle'>Want to Reset password<span onClick={()=>resetPassword(email)}>Click Here</span></p>
           : null }
       
       </div>
      </form>
      <div className="demo-section">
  <h3>Demo Accounts</h3>

  <div className="demo-user">
    <p><strong>User 1:</strong></p>
    <p>Email: demo@gmail.com</p>
    <p>Password: 123456</p>
  </div>

  <div className="demo-user">
    <p><strong>User 2:</strong></p>
    <p>Email: demo2@gmail.com</p>
    <p>Password: 123456</p>
  </div>

  <p className="demo-note">
    Open in two tabs to test real-time chat.
  </p>
</div>
    </div>
  )
}

export default Login
