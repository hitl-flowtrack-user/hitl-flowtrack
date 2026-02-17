import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Navbar = ({ setAuth }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Do you want to logout?")) {
      localStorage.removeItem("flowtrack_session");
      setAuth(false);
      auth.signOut();
      navigate("/login");
    }
  };

  return (
    <nav style={{
      backgroundColor: '#000',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #1a1a1a',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '18px', letterSpacing: '2px' }}>
        FLOWTRACK PRO
      </div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>HOME</Link>
        <Link to="/additem" style={linkStyle}>ADD ITEM</Link>
        <Link to="/inventoryview" style={linkStyle}>INVENTORY</Link>
        <button onClick={handleLogout} style={logoutBtnStyle}>LOGOUT</button>
      </div>
    </nav>
  );
};

const linkStyle = { color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' };
const logoutBtnStyle = { backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '7px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default Navbar;
