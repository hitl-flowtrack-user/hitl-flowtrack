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
    
    // Email aur Password ko trim karna zaroori hai taake koi space masla na kare
    const cleanEmail = email.trim();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      onLoginSuccess(); 
    } catch (err) {
      console.error("Login Error:", err.code);
      // Agar API key ka error aa raha hai to yahan check hoga
      if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        setError("Firebase Config (API Key) mein masla hai. firebase.js check karen.");
      } else {
        setError("Email ya Password ghalat hai!");
      }
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={logoIconStyle}>🔑</div>
        <h2 style={{ color: '#f59e0b', marginBottom: '5px' }}>HITL-FLOWTRACK</h2>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '25px' }}>Authorized Access Only</p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input 
              type="email" 
              style={inputField} 
              placeholder="admin@flowtrack.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              style={inputField} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={loginBtnStyle}>
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- CSS Styles ---
const containerStyle = { background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const loginCardStyle = { background: '#111', padding: '40px 30px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #333' };
const logoIconStyle = { fontSize: '40px', background: '#222', width: '80px', height: '80px', lineHeight: '80px', borderRadius: '50%', margin: '0 auto 20px', border: '2px solid #f59e0b' };
const inputGroup = { textAlign: 'left', marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '12px', color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' };
const inputField = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '16px', boxSizing: 'border-box' };
const loginBtnStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#f59e0b', color: '#000', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default Login;
