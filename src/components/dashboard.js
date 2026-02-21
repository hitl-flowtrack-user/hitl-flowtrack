import React from 'react';

const Dashboard = ({ userData, setActiveTab }) => {
  return (
    <div className="dashboard-wrapper">
      <header className="dash-header">
        <div>
          <p className="welcome-text">Assalam-o-Alaikum,</p>
          <h2 className="user-name">{auth.currentUser.email.split('@')[0]}</h2>
        </div>
        <div className="role-tag">{userData?.role}</div>
      </header>

      {/* Condition 3: Real-time Reports Area */}
      <section className="stats-grid">
        <div className="stat-card gold">
          <span>Daily Sales</span>
          <h3>Rs. 128,450</h3>
          <small>+12% from yesterday</small>
        </div>
        <div className="stat-card slate">
          <span>Daily Purchase</span>
          <h3>Rs. 85,000</h3>
        </div>
        <div className="stat-card glass">
          <span>Net Profit</span>
          <h3 style={{color: '#f59e0b'}}>Rs. 43,450</h3>
        </div>
        <div className="stat-card glass">
          <span>Active Staff</span>
          <h3>08</h3>
        </div>
      </section>

      {/* Live Feed Style Module Links */}
      <h4 className="section-title">Operations Control</h4>
      <div className="module-list">
        <div className="module-item" onClick={() => setActiveTab('sales')}>
          <div className="icon-box">🛒</div>
          <div className="module-info">
            <strong>Sales Terminal</strong>
            <p>Create new order for shopkeepers</p>
          </div>
          <div className="arrow">→</div>
        </div>

        <div className="module-item" onClick={() => setActiveTab('inventory')}>
          <div className="icon-box">📦</div>
          <div className="module-info">
            <strong>Inventory Hub</strong>
            <p>Check stock levels & warehouse</p>
          </div>
          <div className="arrow">→</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
