import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('Verifying Identity...');

    // Email ko small letters mein convert karna behtar hai
    const cleanEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      localStorage.setItem("flowtrack_session", "active");
      setAuth(true);
    } catch (err) {
      console.log("Firebase Error Code:", err.code); // Console mein error check karne ke liye
      
      if (err.code === 'auth/user-not-found') {
        setError("Operator Identity not found.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Invalid Security Token.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Email format is incorrect.");
      } else {
        setError("Access Denied: " + err.message);
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '350px', padding: '40px', backgroundColor: '#111', borderRadius: '30px', border: '1px solid #333', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '30px' }}>SECURE GATEWAY</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="email" placeholder="IDENTITY (EMAIL)" 
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '15px', marginBottom: '15px', backgroundColor: '#000', border: '1px solid #222', color: '#fff', borderRadius: '10px' }}
            required
          />
          <input 
            type="password" placeholder="TOKEN (PASSWORD)" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '15px', marginBottom: '15px', backgroundColor: '#000', border: '1px solid #222', color: '#fff', borderRadius: '10px' }}
            required
          />
          <p style={{ color: error.includes('Verifying') ? '#f59e0b' : '#ff4444', fontSize: '12px', marginBottom: '15px' }}>{error}</p>
          <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#fff', color: '#000', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            AUTHORIZE ACCESS
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;