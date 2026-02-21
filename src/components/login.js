import React, { useState } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Email aur Password trim karke login
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(); 
    } catch (err) {
      console.error("Firebase Error Object:", err);
      
      // Agar API key invalid keh raha hai to iska matlab firebase.js ko restart chahiye
      if (err.message.includes('API key')) {
        setError("Firebase Config Error: API Key match nahi ho rahi. Console check karein.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email ya Password ghalat hai!");
      } else {
        setError(`Error: ${err.code || err.message}`);
      }
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={logoIconStyle}>🔑</div>
        <h2 style={{ color: '#f59e0b' }}>ELITE VAULT</h2>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '20px' }}>Project: elite-vault-93de5</p>

        <form onSubmit={handleLogin}>
          <input 
            type="email" style={inputField} placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" style={{...inputField, marginTop: '15px'}} placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />

          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={loginBtnStyle}>
            {loading ? 'WAIT...' : 'SECURE LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle = { background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const loginCardStyle = { background: '#111', padding: '30px', borderRadius: '20px', width: '320px', textAlign: 'center', border: '1px solid #333' };
const logoIconStyle = { fontSize: '30px', marginBottom: '10px' };
const inputField = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' };
const loginBtnStyle = { width: '100%', padding: '12px', marginTop: '20px', background: '#f59e0b', border: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default Login;
