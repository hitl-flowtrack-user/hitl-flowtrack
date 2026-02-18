import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase'; // Ensure firebase.js is in /src folder
import Login from './components/login';
import Navbar from './components/navbar';
import AddItem from './components/additem';
import InventoryView from './components/inventoryview';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("flowtrack_session");
    if (session === "active") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return <div style={{backgroundColor:'#000', height:'100vh'}}></div>;

  return (
    <Router>
      {isAuthenticated && <Navbar setAuth={setIsAuthenticated} />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <div style={{color:'#fff', textAlign:'center', marginTop:'100px'}}><h1>FLOWTRACK PRO LIVE</h1></div> : <Navigate to="/login" />} />
        <Route path="/additem" element={isAuthenticated ? <AddItem /> : <Navigate to="/login" />} />
        <Route path="/inventoryview" element={isAuthenticated ? <InventoryView /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
