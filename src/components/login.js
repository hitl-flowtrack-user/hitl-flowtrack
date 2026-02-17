import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Authorize Access');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('Verifying...');
    setError('');

    try {
      // Yeh line Firebase se login check karegi
      await signInWithEmailAndPassword(auth, email, password);
      
      // Agar login sahi ho gaya:
      localStorage.setItem("flowtrack_session", "active");
      setAuth(true);
    } catch (err) {
      // Agar password ya email ghalat hua:
      setError("Invalid Identity or Token");
      setStatus('Authorize Access');
      console.error("Login Error:", err.code);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '350px', padding: '40px', backgroundColor: '#111', borderRadius: '30px', border: '1px solid #333', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px' }}>SECURE GATEWAY</h2>
          <p style={{ color: '#555', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>ENTERPRISE ACCESS SYSTEM</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#444', fontSize: '10px', marginLeft: '10px', fontWeight: 'bold' }}>OPERATOR IDENTITY</label>
            <input 
              type="email" 
              placeholder="hadiemart@gmail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '15px', marginTop: '5px', backgroundColor: '#080808', border: '1px solid #222', color: '#fff', borderRadius: '15px', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#444', fontSize: '10px', marginLeft: '10px', fontWeight: 'bold' }}>SECURITY TOKEN</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '15px', marginTop: '5px', backgroundColor: '#080808', border: '1px solid #222', color: '#fff', borderRadius: '15px', fontSize: '13px', outline: 'none' }}
            />
          </div>
          
          {error && <p style={{ color: '#ff4444', fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>{error}</p>}
          
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '18px', 
              marginTop: '10px',
              backgroundColor: '#fff', 
              color: '#000', 
              border: 'none', 
              borderRadius: '15px', 
              fontWeight: '900', 
              fontSize: '14px',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            {status.toUpperCase()}
          </button>
        </form>
        
        <div style={{ marginTop: '40px', borderTop: '1px solid #222', paddingTop: '20px' }}>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
            MOBILE VERIFIED <span style={{ color: '#f59e0b', marginLeft: '10px' }}>v2.1.0-FT</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;