import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, MapPin, Home, CheckCircle, AlertCircle, LayoutDashboard, LogOut, Search, Users, Trash2, Settings } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LetterheadHeader = ({ onAdminClick }) => (
  <header className="w-full bg-white border-b border-slate-200 p-4 md:p-6 font-sans relative">
    <div className="max-w-7xl mx-auto">
      {/* Top Row: Reg No and Admin Icon */}
      <div className="flex justify-end items-center gap-4 mb-2">
        <p className="text-[10px] md:text-sm font-bold text-slate-700">
          Reg. No.: MU/0001161/2024
        </p>
        <button 
          onClick={onAdminClick}
          className="p-2 text-slate-300 hover:text-indigo-600 transition-all opacity-60 hover:opacity-100"
          title="Admin Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Main Content Row: Logo and Title */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-10">
        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          <img 
            src="https://appcdn.goqii.com/storeimg/58048_1778071550.png" 
            alt="Foundation Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-xl md:text-4xl font-black tracking-tight text-[#1E3A8A] uppercase leading-tight">
            Moradabad Mumbai Qureshi<br/>Ekta Foundation
          </h1>
          <div className="mt-2 h-1 w-full bg-[#D1FAE5]"></div> {/* Light green line like the letterhead */}
        </div>
      </div>
    </div>
  </header>
);

export default function App() {
  const [view, setView] = useState('form');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);

  const [familyData, setFamilyData] = useState({ mobile_number: '', postal_code: '', address: '' });
  const [members, setMembers] = useState([{ name: '', age: '', gender: 'Male' }]);
  const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });

  const addMemberRow = () => setMembers([...members, { name: '', age: '', gender: 'Male' }]);
  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: family, error: fErr } = await supabase
        .from('families')
        .insert([{ 
          ...familyData, 
          full_name: members[0].name,
          hof_name: members[0].name 
        }])
        .select()
        .single();

      if (fErr) throw fErr;

      const membersToInsert = members.map(m => ({
        family_id: family.id,
        member_name: m.name,
        age: parseInt(m.age),
        gender: m.gender
      }));

      const { error: mErr } = await supabase.from('family_members').insert(membersToInsert);
      if (mErr) throw mErr;

      setSubmitted(true);
    } catch (err) {
      setError(err.message.includes('unique') ? 'Mobile Number already registered!' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.user === 'admin' && loginCreds.pass === 'admin123') {
      fetchAdminData();
      setView('admin');
    } else {
      alert('Access Denied.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('families').select('*, family_members(*)').order('created_at', { ascending: false });
    if (!error) setAdminData(data);
    setLoading(false);
  };

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <LetterheadHeader onAdminClick={() => {}} />
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center bg-[#1E3A8A] p-5 rounded-2xl text-white shadow-lg">
              <h1 className="text-lg font-bold uppercase flex items-center gap-3">
                <LayoutDashboard size={20} /> Admin Dashboard
              </h1>
              <button onClick={() => setView('form')} className="bg-white/10 px-4 py-2 rounded-lg font-bold">Exit</button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 bg-slate-50 border-b">
                <input 
                  className="w-full p-3 border rounded-xl outline-none" 
                  placeholder="Search families..." 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase border-b">
                    <tr><th className="p-4">HOF Name</th><th className="p-4">Mobile</th><th className="p-4 text-center">Size</th><th className="p-4 text-right">View</th></tr>
                  </thead>
                  <tbody>
                    {adminData.filter(f => f.hof_name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.mobile_number.includes(searchQuery)).map(f => (
                      <tr key={f.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedFamily(f)}>
                        <td className="p-4 font-bold">{f.hof_name}</td>
                        <td className="p-4 text-sm">{f.mobile_number}</td>
                        <td className="p-4 text-center font-bold text-indigo-600">{f.family_members?.length || 0}</td>
                        <td className="p-4 text-right text-indigo-600 font-bold text-xs">DETAILS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {selectedFamily && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedFamily(null)}>
            <div className="bg-white p-8 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-black mb-6">{selectedFamily.hof_name}'s Family</h2>
              <div className="space-y-3">
                {selectedFamily.family_members.map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold">{i+1}. {m.member_name}</span>
                    <span className="font-bold text-indigo-600">{m.gender} | {m.age} Yrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <LetterheadHeader onAdminClick={() => setView('login')} />
      
      <div className="py-8 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border">
          <div className="bg-[#1E3A8A] p-4 text-white text-center font-black uppercase tracking-widest text-sm">
            Family Data Registration
          </div>

          {submitted ? (
            <div className="p-16 text-center animate-in zoom-in duration-300">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black">Registration Successful</h2>
              <button onClick={() => window.location.reload()} className="mt-8 w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-bold">Add Another</button>
            </div>
          ) : view === 'login' ? (
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <h3 className="text-xl font-black text-center">Admin Login</h3>
              <input required className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Username" onChange={e => setLoginCreds({...loginCreds, user: e.target.value})} />
              <input required type="password" className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Password" onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})} />
              <button className="w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-black shadow-lg">Login</button>
              <button type="button" onClick={() => setView('form')} className="w-full text-slate-400 text-sm font-bold">Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
              
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-indigo-800 tracking-widest border-b block pb-1">Head of Family</label>
                <input required placeholder="HOF Name" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" onChange={e => updateMember(0, 'name', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" placeholder="Age" className="w-full p-4 bg-slate-50 border rounded-xl" onChange={e => updateMember(0, 'age', e.target.value)} />
                  <select className="w-full p-4 bg-slate-50 border rounded-xl" onChange={e => updateMember(0, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-indigo-800 tracking-widest border-b block pb-1">Contact Info</label>
                <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-600" onChange={e => setFamilyData({...familyData, mobile_number: e.target.value})} />
                <textarea required placeholder="Address" className="w-full p-4 bg-slate-50 border rounded-xl" rows="2" onChange={e => setFamilyData({...familyData, address: e.target.value})} />
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-center border-b pb-1">
                  <label className="text-[10px] font-black uppercase text-indigo-800 tracking-widest">Other Members ({members.length - 1})</label>
                  <button type="button" onClick={addMemberRow} className="text-indigo-600 font-black text-xs">+ Add Member</button>
                </div>
                {members.slice(1).map((m, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl grid grid-cols-3 gap-2 relative border">
                    <input required placeholder="Name" className="p-2 border rounded text-sm bg-white" onChange={e => updateMember(i + 1, 'name', e.target.value)} />
                    <input required type="number" placeholder="Age" className="p-2 border rounded text-sm bg-white" onChange={e => updateMember(i + 1, 'age', e.target.value)} />
                    <select className="p-2 border rounded text-sm bg-white" onChange={e => updateMember(i + 1, 'gender', e.target.value)}>
                      <option>Male</option><option>Female</option>
                    </select>
                    <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i + 1))} className="absolute -top-2 -right-2 bg-red-100 p-1 rounded-full text-red-600"><Trash2 size={12} /></button>
                  </div>
                ))}
              </section>

              <button disabled={loading} className="w-full bg-[#1E3A8A] text-white p-5 rounded-2xl font-black shadow-lg">
                {loading ? 'Processing...' : 'Submit to Foundation'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      <footer className="p-8 text-center bg-white border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
          Bandra (W), Mumbai - 400050 [cite: 23]
        </p>
        <p className="text-[9px] text-slate-300">© 2026 MORADABAD MUMBAI QURESHI EKTA FOUNDATION [cite: 3]</p>
      </footer>
    </div>
  );
}
