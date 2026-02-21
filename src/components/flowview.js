import React from 'react';

export default function Flowview() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '15px', color: '#fff' }}>
      <h2 style={{ color: '#f59e0b', textAlign: 'center' }}>🔄 Business Flow</h2>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <div style={{ fontSize: '50px' }}>📊</div>
        <p style={{ color: '#666' }}>Flow analytics will appear here after more transactions.</p>
        <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #f59e0b', borderRadius: '15px' }}>
          <div style={{ color: '#10b981' }}>↑ INFLOW: Rs. 0</div>
          <div style={{ color: '#ef4444', marginTop: '10px' }}>↓ OUTFLOW: Rs. 0</div>
        </div>
      </div>
    </div>
  );
}
