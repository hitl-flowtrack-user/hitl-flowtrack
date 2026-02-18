import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';
import Login from './components/login';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("flowtrack_session") === "active");

  return (
    <Router>
      {isAuth && <Navbar setAuth={setIsAuth} />}
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuth} />} />
        <Route path="/additem" element={isAuth ? <AddItem /> : <Navigate to="/login" />} />
        <Route path="/inventoryview" element={isAuth ? <InventoryView /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuth ? <div style={{textAlign:'center', color:'#fff', marginTop:'100px'}}><h1>HITL FLOWTRACK PRO</h1><p>Authorized Access Only</p></div> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
