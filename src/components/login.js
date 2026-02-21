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
      // Firebase sign in call
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(); 
    } catch (err) {
      console.error("Auth Error Code:", err.code); // Is se asal masla pata chalega
      if (err.code === 'auth/user-not-found') {
        setError("Bhai, ye email register nahi hai!");
      } else if (err.code === 'auth/wrong-password') {
        setError("Password ghalat hai, dubara check karen.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email ya Password ghalat hai!");
      } else {
        setError("Login mein masla aya: " + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={logoIconStyle}>🔑</div>
        <h2 style={{ color: '#f59e0b', marginBottom: '5px' }}>MAHAVIR TRADERS</h2>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '25px' }}>Authorized Access Only</p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              style={inputField} 
              placeholder="admin@example.com"
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
            {loading ? 'CHECKING...' : 'SECURE LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Styles Same as before ---
const containerStyle = { background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const loginCardStyle = { background: '#111', padding: '40px 30px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #333' };
const logoIconStyle = { fontSize: '40px', background: '#222', width: '80px', height: '80px', lineHeight: '80px', borderRadius: '50%', margin: '0 auto 20px', border: '2px solid #f59e0b' };
const inputGroup = { textAlign: 'left', marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '12px', color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' };
const inputField = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '16px', boxSizing: 'border-box' };
const loginBtnStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#f59e0b', color: '#000', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };

export default Login;
