import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Users, UserPlus, Pencil, Trash2, ShieldCheck, DollarSign, Target } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function StaffManager() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", role: "User", phone: "",
    baseSalary: "", incentiveRate: "", monthlyTarget: "",
    designation: "", companyId: user?.companyId || ""
  });

  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(collection(db, "staff"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateDoc(doc(db, "staff", formData.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "staff"), { ...formData, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      setEditMode(false);
      resetForm();
    } catch (err) { alert("Action Failed!"); }
  };

  const resetForm = () => setFormData({ name: "", email: "", role: "User", phone: "", baseSalary: "", incentiveRate: "", monthlyTarget: "", designation: "", companyId: user?.companyId });

  return (
    <div className="p-4 md:p-8 bg-slate-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black italic uppercase flex items-center gap-3 tracking-tighter">
            <Users className="text-amber-500" size={32} /> Staff Vault
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Manage Roles & Payroll</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-amber-400">
          <UserPlus size={16} /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-amber-500/30 transition-all relative group">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => { setFormData(member); setEditMode(true); setShowModal(true); }} className="p-2 bg-white/10 rounded-lg hover:text-amber-500"><Pencil size={14} /></button>
              <button onClick={async () => window.confirm("Delete member?") && await deleteDoc(doc(db, "staff", member.id))} className="p-2 bg-white/10 rounded-lg hover:text-red-500"><Trash2 size={14} /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black italic">{member.name[0]}</div>
              <div>
                <h3 className="font-black uppercase italic text-lg leading-tight">{member.name}</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">{member.role}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[11px] border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase font-bold flex items-center gap-1"><DollarSign size={12}/> Base Salary</span>
                <span className="font-black">Rs. {member.baseSalary}</span>
              </div>
              <div className="flex justify-between text-[11px] border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase font-bold flex items-center gap-1"><Target size={12}/> Monthly Target</span>
                <span className="font-black">Rs. {member.monthlyTarget}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-500 uppercase font-bold">Incentive Rate</span>
                <span className="text-emerald-500 font-black">{member.incentiveRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#121212] w-full max-w-xl rounded-[2.5rem] p-8 border border-white/10">
            <h3 className="text-2xl font-black italic uppercase mb-6">{editMode ? "Update Details" : "New Staff Registration"}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Full Name</label>
                <input required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-amber-500 uppercase text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Role</label>
                <select className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-xs" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Admin">Admin</option>
                  <option value="User">User / Booker</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Base Salary</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-xs" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Monthly Target</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-xs" value={formData.monthlyTarget} onChange={e => setFormData({...formData, monthlyTarget: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Incentive (%)</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none text-xs" value={formData.incentiveRate} onChange={e => setFormData({...formData, incentiveRate: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-amber-500 text-black py-4 rounded-2xl font-black uppercase text-xs italic tracking-widest">{editMode ? "Update" : "Confirm Staff"}</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-6 text-zinc-500 font-bold uppercase text-[10px]">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}