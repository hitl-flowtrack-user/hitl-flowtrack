// ... existing imports ...
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from './firebase';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStaffPresent, setIsStaffPresent] = useState(false);

  // Attendance Lock Logic
  useEffect(() => {
    const q = query(collection(db, "staff_members"), where("status", "==", "Present"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsStaffPresent(!snapshot.empty); // Agar koi present hai toh true
    });
    return () => unsubscribe();
  }, []);

  if (!isLoggedIn) return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;

  return (
    <div className="app-container">
      {/* Agar attendance nahi lagi, toh sirf Attendance page dikhega */}
      {!isStaffPresent && activeTab !== 'attendance' ? (
        <div style={lockOverlay}>
          <h2 style={{color: '#ef4444'}}>🔒 SYSTEM LOCKED</h2>
          <p>Please mark Attendance first to access the system.</p>
          <button onClick={() => setActiveTab('attendance')} style={homeButtonStyle}>Go to Attendance</button>
        </div>
      ) : (
        <>
          {activeTab !== 'dashboard' && <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />}
          <main className="content-area">
             {/* ... rest of your tabs ... */}
             {activeTab === 'attendance' && <Attendance />}
             {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} onLogout={() => auth.signOut()} />}
          </main>
        </>
      )}
    </div>
  );
}

const lockOverlay = { textAlign: 'center', padding: '50px 20px', background: '#000', height: '100vh' };
