import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ setAuth }) => {
  return (
    <nav style={{ backgroundColor: '#000', padding: '15px', display: 'flex', gap: '20px', borderBottom: '1px solid #222' }}>
      <Link to="/additem" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' }}>ADD ITEM</Link>
      <Link to="/inventoryview" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>INVENTORY</Link>
      <button onClick={() => { localStorage.clear(); setAuth(false); }} style={{ marginLeft: 'auto', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>LOGOUT</button>
    </nav>
  );
};
export default Navbar;