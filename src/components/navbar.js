import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Navbar = ({ setAuth, setAttendanceMarked }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("flowtrack_session");
    localStorage.removeItem("attendance_done");
    setAuth(false);
    setAttendanceMarked(false);
    auth.signOut();
    navigate("/login");
  };

  return (
    <nav style={{ backgroundColor: '#111', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
      <div style={{ color: '#f59e0b', fontWeight: 'bold', letterSpacing: '1px' }}>FLOWTRACK</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>HOME</Link>
        <Link to="/additem" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>ADD ITEM</Link>
        <Link to="/inventoryview" style={{ color: 'white', textDecoration: 'none', fontSize: '13px' }}>INVENTORY</Link>
        <button onClick={handleLogout} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
      </div>
    </nav>
  );
};
export default Navbar;