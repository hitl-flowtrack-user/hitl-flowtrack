import React, { useState, useEffect } from 'react';
import { db, auth, logActivity } from '../../firebase'; // Humari purani file se connection
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Users, UserPlus, ShieldCheck, MapPin } from 'lucide-react';

const StaffManager = ({ currentUser }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Salesman',
    salary: '',
    target: '',
    baseLocation: '' // Geo-fencing ke liye
  });

  // 1. Staff ki List Load Karna (Sirf apni Company ka data)
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"), 
        where("companyId", "==", currentUser.companyId)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(data);
    } catch (error) {
      alert("Data load karne mein masla hua: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.companyId) fetchStaff();
  }, [currentUser]);

  // 2. Naya Staff Add Karna
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStaff = {
        ...formData,
        companyId: currentUser.companyId,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await addDoc(collection(db, "users"), newStaff);
      
      // Activity Log: Record rakhna ke kis ne add kiya
      await logActivity(
        currentUser.uid, 
        currentUser.companyId, 
        "STAFF_ADDED", 
        "Staff Management", 
        `Added new staff: ${formData.name}`
      );

      alert("Staff kamyabi se add ho gaya!");
      setFormData({ name: '', phone: '', role: 'Salesman', salary: '', target: '', baseLocation: '' });
      fetchStaff(); // List refresh karna
    } catch (error) {
      alert("Add karne mein ghalti: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">HITL-FlowTrack Staff Management</h1>
      </div>

      {/* Form: Naya Staff Add Karne ke liye */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <UserPlus size={20} /> Naya Staff Shamil Karen
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            className="border p-2 rounded" 
            placeholder="Pura Naam" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <input 
            className="border p-2 rounded" 
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required 
          />
          <select 
            className="border p-2 rounded"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="Salesman">Salesman</option>
            <option value="Accountant">Accountant</option>
            <option value="Manager">Manager</option>
          </select>
          <input 
            className="border p-2 rounded" 
            placeholder="Mahana Salary" 
            type="number"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
          />
          <input 
            className="border p-2 rounded" 
            placeholder="Sales Target" 
            type="number"
            value={formData.target}
            onChange={(e) => setFormData({...formData, target: e.target.value})}
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Staff Save Karen
          </button>
        </form>
      </div>

      {/* Table: Staff ki List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Naam</th>
              <th className="p-4">Role</th>
              <th className="p-4">Salary</th>
              <th className="p-4">Target</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{staff.name}</td>
                <td className="p-4 text-blue-600">{staff.role}</td>
                <td className="p-4">Rs. {staff.salary}</td>
                <td className="p-4">Rs. {staff.target}</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManager;