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
      // Email se extra spaces khatam karke login ki koshish
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(); 
    } catch (err) {
      console.log("Full Firebase Error Object:", err);
      console.error("Error Code:", err.code);

      // Simple Urdu/Hindi Errors
      if (err.code === 'auth/invalid-api-key' || err.code.includes('api-key-not-valid')) {
        setError("Firebase API Key ka masla hai. Apni firebase.js file check karen.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Email ya Password ghalat hai!");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Internet nahi chal raha ya Firebase blocked hai.");
      } else {
        setError(`Masla: ${err.code}`); // Is se humein exact code mil jaye ga
      }
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={logoIconStyle}>🔑</div>
        
        <h2 style={{ color: '#f59e0b', margin: '0 0 5px 0' }}>HITL-FLOWTRACK</h2>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '25px' }}>Authorized Access Only</p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>ADMIN EMAIL</label>
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
            <label style={labelStyle}>PASSWORD</label>
            <input 
              type="password" 
              style={inputField} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{...loginBtnStyle, opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'VERIFYING...' : 'LOGIN TO SYSTEM'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '10px', color: '#444' }}>
          HITL-FlowTrack v4.0 | Secure POS
        </p>
      </div>
    </div>
  );
};

// --- Styles (Mobile Friendly & Professional) ---
const containerStyle = {
  background: '#000',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const loginCardStyle = {
  background: '#111',
  padding: '40px 25px',
  borderRadius: '25px',
  width: '100%',
  maxWidth: '380px',
  textAlign: 'center',
  border: '1px solid #333',
  boxShadow: '0 15px 35px rgba(0,0,0,0.8)'
};

const logoIconStyle = {
  fontSize: '35px',
  background: '#222',
  width: '70px',
  height: '70px',
  lineHeight: '70px',
  borderRadius: '50%',
  margin: '0 auto 15px',
  border: '2px solid #f59e0b'
};

const inputGroup = {
  textAlign: 'left',
  marginBottom: '18px'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#f59e0b',
  marginBottom: '6px',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const inputField = {
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid #333',
  background: '#000',
  color: '#fff',
  fontSize: '15px',
  boxSizing: 'border-box',
  outline: 'none'
};

const loginBtnStyle = {
  width: '100%',
  padding: '15px',
  borderRadius: '10px',
  border: 'none',
  background: '#f59e0b',
  color: '#000',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px'
};

export default Login;
