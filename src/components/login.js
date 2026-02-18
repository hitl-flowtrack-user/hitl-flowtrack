import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ setAuth }) => {
  const [e, setE] = useState('');
  const [p, setP] = useState('');

  const handle = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, e, p);
      localStorage.setItem("flowtrack_session", "active");
      setAuth(true);
    } catch (err) { alert("Login Failed"); }
  };

  return (
    <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handle} style={{ backgroundColor: '#111', padding: '40px', borderRadius: '20px' }}>
        <h2 style={{ color: '#f59e0b' }}>LOGIN</h2>
        <input placeholder="Email" style={{ display: 'block', marginBottom: '10px', padding: '10px' }} onChange={x => setE(x.target.value)} />
        <input type="password" placeholder="Password" style={{ display: 'block', marginBottom: '10px', padding: '10px' }} onChange={x => setP(x.target.value)} />
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#f59e0b' }}>ENTER</button>
      </form>
    </div>
  );
};
export default Login;