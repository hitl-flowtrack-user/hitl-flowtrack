import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ setAuth }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("flowtrack_session");
    setAuth(false);
    navigate("/login");
  };

  return (
    <nav style={{ backgroundColor: '#000', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222' }}>
      <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>FLOWTRACK PRO</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/additem" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>ADD ITEM</Link>
        <Link to="/inventoryview" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>INVENTORY</Link>
        <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>LOGOUT</button>
      </div>
    </nav>
  );
};

export default Navbar;
