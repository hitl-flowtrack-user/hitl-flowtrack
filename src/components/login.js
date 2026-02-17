import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("flowtrack_session", "active");
      setAuth(true);
    } catch (err) {
      setError("Invalid Credentials. Please try again.");
    }
  };

  return (
    <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#111', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '350px', border: '1px solid #222' }}>
        <h2 style={{ color: '#f59e0b', textAlign: 'center', marginBottom: '30px', fontWeight: '900' }}>LOGIN</h2>
        {error && <p style={{ color: '#ff4444', fontSize: '12px', textAlign: 'center' }}>{error}</p>}
        <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} style={loginInput} required />
        <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} style={loginInput} required />
        <button type="submit" style={loginBtn}>ENTER SYSTEM</button>
      </form>
    </div>
  );
};

const loginInput = { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#222', color: '#fff', outline: 'none', boxSizing: 'border-box' };
const loginBtn = { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#f59e0b', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default Login;
