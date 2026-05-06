import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, MapPin, Home, CheckCircle, AlertCircle, LayoutDashboard, LogOut, Search, Users, Trash2 } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LetterheadHeader = ({ showAdminIcon, onAdminClick }) => (
  <header className="p-4 md:p-6 bg-white border-b-4 border-[#4ADE80]/30 shadow-sm font-sans text-slate-900 relative">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Logo and Title Group */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <div className="w-24 h-24 flex-shrink-0 bg-white rounded-full border border-slate-100 p-1 shadow-sm">
          <img 
            src="https://i.ibb.co/q5M8JqN/qureshi-ekta-foundation-logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
            onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=MMQEF&background=1E3A8A&color=fff"; }}
          />
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-[#1E3A8A] uppercase leading-tight">
            Moradabad Mumbai Qureshi<br/>Ekta Foundation
          </h1>
        </div>
      </div>

      {/* Reg No positioned like the letterhead */}
      <div className="text-right flex flex-col items-end">
        <p className="text-[11px] md:text-sm font-bold text-slate-700">
          Reg. No.: MU/0001161/2024
        </p>
        {showAdminIcon && (
          <button 
            onClick={onAdminClick}
            className="mt-2 p-2 text-slate-300 hover:text-indigo-600 transition-all opacity-50 hover:opacity-100"
          >
            <LayoutDashboard size={20} />
          </button>
        )}
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
      alert('Unauthorized access attempt.');
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
        <LetterheadHeader showAdminIcon={false} />
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center bg-[#1E3A8A] p-5 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-3">
                <LayoutDashboard size={24} />
                <h1 className="text-lg font-bold uppercase">Database Dashboard</h1>
              </div>
              <button onClick={() => setView('form')} className="bg-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/20 transition">Exit</button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 bg-slate-50 border-b">
                <input 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Search family records..." 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr><th className="p-4">Head of Family</th><th className="p-4">Mobile</th><th className="p-4 text-center">Family Size</th><th className="p-4 text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {adminData.filter(f => f.hof_name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.mobile_number.includes(searchQuery)).map(f => (
                      <tr key={f.id} className="border-b hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedFamily(f)}>
                        <td className="p-4 font-bold">{f.hof_name}</td>
                        <td className="p-4 text-sm font-mono">{f.mobile_number}</td>
                        <td className="p-4 text-center font-bold text-indigo-600">{f.family_members?.length || 0}</td>
                        <td className="p-4 text-right text-xs font-bold text-indigo-600">VIEW ALL</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {selectedFamily && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedFamily(null)}>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">{selectedFamily.hof_name}'s Family</h2>
                <button onClick={() => setSelectedFamily(null)} className="text-slate-400 hover:text-black text-xl font-bold">✕</button>
              </div>
              <div className="space-y-3">
                {selectedFamily.family_members.map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">{i + 1}. {m.member_name}</span>
                    <div className="flex gap-4 text-sm font-bold">
                      <span className={m.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'}>{m.gender}</span>
                      <span className="text-slate-500">{m.age} Yrs</span>
                    </div>
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <LetterheadHeader showAdminIcon={true} onAdminClick={() => setView('login')} />
      
      <div className="py-10 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border">
          <div className="bg-[#1E3A8A] p-6 text-white text-center">
            <h2 className="text-xl font-black uppercase tracking-widest">Registration Form</h2>
          </div>

          {submitted ? (
            <div className="p-16 text-center animate-in zoom-in duration-300">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black">Data Saved Successfully</h2>
              <button onClick={() => window.location.reload()} className="mt-8 w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-bold">Add New Family</button>
            </div>
          ) : view === 'login' ? (
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <div className="text-center"><h3 className="text-xl font-black">Admin Access</h3></div>
              <input required className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Username" onChange={e => setLoginCreds({...loginCreds, user: e.target.value})} />
              <input required type="password" className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Password" onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})} />
              <button className="w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-black">Login</button>
              <button type="button" onClick={() => setView('form')} className="w-full text-slate-400 text-sm font-bold">Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
              
              <section className="space-y-4">
                <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b pb-2">1. Head of Family Details</h4>
                <input required placeholder="HOF Full Name" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" onChange={e => updateMember(0, 'name', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" placeholder="Age" className="w-full p-4 bg-slate-50 border rounded-xl outline-none" onChange={e => updateMember(0, 'age', e.target.value)} />
                  <select className="w-full p-4 bg-slate-50 border rounded-xl outline-none" onChange={e => updateMember(0, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b pb-2">2. Contact & Address</h4>
                <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" onChange={e => setFamilyData({...familyData, mobile_number: e.target.value})} />
                <textarea required placeholder="Full Address" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" rows="2" onChange={e => setFamilyData({...familyData, address: e.target.value})} />
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest">3. Other Members ({members.length - 1})</h4>
                  <button type="button" onClick={addMemberRow} className="text-indigo-600 font-black text-xs hover:underline">+ Add Member</button>
                </div>
                {members.slice(1).map((m, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 relative border border-slate-200">
                    <input required placeholder="Name" className="p-2 border rounded bg-white text-sm" onChange={e => updateMember(i + 1, 'name', e.target.value)} />
                    <input required type="number" placeholder="Age" className="p-2 border rounded bg-white text-sm" onChange={e => updateMember(i + 1, 'age', e.target.value)} />
                    <select className="p-2 border rounded bg-white text-sm" onChange={e => updateMember(i + 1, 'gender', e.target.value)}>
                      <option>Male</option><option>Female</option>
                    </select>
                    <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i + 1))} className="absolute -top-2 -right-2 bg-red-100 p-1.5 rounded-full text-red-600 hover:bg-red-200"><Trash2 size={14} /></button>
                  </div>
                ))}
              </section>

              <button disabled={loading} className="w-full bg-[#1E3A8A] text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">
                {loading ? 'Saving Information...' : 'Submit Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
