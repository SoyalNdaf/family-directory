import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, MapPin, Home, CheckCircle, AlertCircle, LayoutDashboard, LogOut, Search, Users, Trash2 } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Letterhead branded header and logo
const LetterheadHeader = ({ showAdminIcon, onAdminClick }) => (
  <header className="p-6 md:p-8 bg-white border-b border-slate-200 shadow-sm font-sans text-slate-900 relative">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative">
      
      {/* 1. Circular Logo (Left) from image_2.png [cite: 3] */}
      <div className="w-28 h-28 flex-shrink-0">
        <img src="https://i.ibb.co/q5M8JqN/qureshi-ekta-foundation-logo.png" alt="Foundation Logo" className="w-full h-full object-contain" />
      </div>
      
      {/* 2. Main Title and Registration No from image_2.png [cite: 2, 3] */}
      <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-2">
        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-1 md:gap-0 mb-3">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1E3A8A] font-serif uppercase">
            Moradabad Mumbai Qureshi<br/>Ekta Foundation [cite: 3]
          </h1>
          <p className="text-[11px] md:text-xs font-mono tracking-tight text-slate-500 font-medium">
            Reg. No.: MU/0001161/2024 [cite: 2]
          </p>
        </div>
        <p className="text-[9px] md:text-xs text-slate-400 font-bold tracking-[0.25em] uppercase border-t border-slate-100 pt-2 w-full">
          Secure Community Data Portal [cite: 3]
        </p>
      </div>

      {/* Admin Icon */}
      {showAdminIcon && (
        <button 
          onClick={onAdminClick}
          className="absolute top-2 right-2 p-2 text-indigo-400 hover:text-indigo-800 transition-all opacity-30 hover:opacity-100 z-20"
        >
          <LayoutDashboard size={20} />
        </button>
      )}
    </div>
  </header>
);

export default function App() {
  const [view, setView] = useState('form'); // 'form', 'login', or 'admin'
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
    // FIXED CREDENTIALS CHECK [cite: 3]
    if (loginCreds.user === 'admin' && loginCreds.pass === 'admin123') {
      fetchAdminData();
      setView('admin');
    } else {
      alert('Invalid Credentials. Please use the correct username and password.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('families').select('*, family_members(*)').order('created_at', { ascending: false });
    if (!error) setAdminData(data);
    setLoading(false);
  };

  const filteredData = adminData.filter(f => 
    f.hof_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.mobile_number.includes(searchQuery)
  );

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <LetterheadHeader showAdminIcon={false} />
        
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center bg-indigo-950 p-5 rounded-2xl text-white mb-6 shadow-xl border border-indigo-900">
              <div className="flex items-center gap-4 text-white">
                <LayoutDashboard size={28} className="text-indigo-400"/>
                <h1 className="text-xl font-black uppercase tracking-tight">Admin Portal</h1>
              </div>
              <button onClick={() => setView('form')} className="flex items-center gap-2.5 text-white font-bold bg-white/10 px-5 py-3 rounded-full hover:bg-white/20 transition-all"><LogOut size={18} /> Exit Admin</button>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b">
                <input 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Search by HOF name or Mobile..." 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest border-b">
                    <tr>
                      <th className="p-5">Head of Family</th>
                      <th className="p-5">Mobile</th>
                      <th className="p-5 text-center">Family Size</th>
                      <th className="p-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(f => (
                      <tr key={f.id} className="border-b hover:bg-indigo-50/30 transition cursor-pointer last:border-0" onClick={() => setSelectedFamily(f)}>
                        <td className="p-5 font-bold text-slate-800">{f.hof_name}</td>
                        <td className="p-5 text-slate-600 font-mono text-sm tracking-tighter">{f.mobile_number}</td>
                        <td className="p-5 text-center"><span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{f.family_members?.length || 0}</span></td>
                        <td className="p-5 text-right text-indigo-600 font-bold text-sm">View Members</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {selectedFamily && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300" onClick={() => setSelectedFamily(null)}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedFamily.hof_name}'s Family</h2>
                  <p className="text-slate-500 mt-1 font-medium italic">{selectedFamily.address}</p>
                </div>
                <button onClick={() => setSelectedFamily(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
              </div>
              <div className="space-y-3">
                {selectedFamily.family_members.sort((a,b) => b.age - a.age).map((m, idx) => (
                  <div key={m.id} className="flex items-center justify-between p-4.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                      <p className="font-bold text-slate-800">{m.member_name}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className={m.gender === 'Male' ? 'text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded' : 'text-pink-600 font-bold bg-pink-100 px-2 py-0.5 rounded'}>{m.gender[0]}</span>
                      <span className="text-slate-700 font-bold">{m.age} Years</span>
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-950">
      <LetterheadHeader showAdminIcon={true} onAdminClick={() => setView('login')} />
      
      <div className="py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          
          <header className="bg-indigo-950 p-6 md:p-8 text-white text-center shadow-inner relative">
            <h1 className="text-2xl font-black tracking-tight uppercase leading-tight">Community Directory</h1>
            <p className="text-xs text-indigo-200 mt-1 font-medium">Community Data Registration Portal [cite: 3]</p>
          </header>

          {submitted ? (
            <div className="p-16 text-center animate-in zoom-in duration-500">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Done</h2>
              <p className="text-slate-600 mt-4 leading-relaxed text-lg">Family information has been successfully added to the foundation records [cite: 3].</p>
              <button onClick={() => window.location.reload()} className="mt-12 w-full bg-slate-900 text-white py-4.5 rounded-xl font-bold text-lg hover:bg-black transition shadow-lg">New Family Registration</button>
            </div>
          ) : view === 'login' ? (
            <form onSubmit={handleLogin} className="p-10 space-y-6">
              <div className="text-center mb-8">
                <LayoutDashboard size={48} className="text-indigo-300 mx-auto mb-4 p-3 bg-indigo-50 rounded-2xl"/>
                <h2 className="font-black text-2xl text-slate-900">Admin Login</h2>
                <p className="text-slate-500 mt-1">Sign in to manage foundation data [cite: 3]</p>
              </div>
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition" placeholder="Admin Username (use 'admin')" onChange={e => setLoginCreds({...loginCreds, user: e.target.value})} />
              <input required type="password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition" placeholder="Admin Password (use 'admin123')" onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})} />
              <button className="w-full bg-slate-950 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-black transition shadow-xl active:scale-[0.98]">Access Admin Dashboard</button>
              <button type="button" onClick={() => setView('form')} className="w-full text-slate-500 text-sm font-bold p-2 hover:text-slate-800 transition">Back to Registration</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {error && <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100"><AlertCircle size={20}/> {error}</div>}
              
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2"><span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs italic">01</span><h3 className="font-black uppercase tracking-widest text-sm text-indigo-900">Head of Family</h3></div>
                <input required placeholder="Full Name of Head of Family" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 transition outline-none" onChange={e => updateMember(0, 'name', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" min="1" max="120" placeholder="Age" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" onChange={e => updateMember(0, 'age', e.target.value)} />
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none" onChange={e => updateMember(0, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-2"><span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs italic">02</span><h3 className="font-black uppercase tracking-widest text-sm text-indigo-900">Contact Details</h3></div>
                <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" onChange={e => setFamilyData({...familyData, mobile_number: e.target.value})} />
                <textarea required placeholder="Correspondence Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" rows="2" onChange={e => setFamilyData({...familyData, address: e.target.value})} />
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs italic">03</span><h3 className="font-black uppercase tracking-widest text-sm text-indigo-900">Family Members ({members.length - 1})</h3></div>
                  <button type="button" onClick={addMemberRow} className="text-indigo-600 font-black text-[10px] uppercase pb-0.5 hover:text-indigo-800 transition">+ Add Member</button>
                </div>
                <div className="space-y-3">
                  {members.slice(1).map((m, i) => (
                    <div key={i} className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 relative animate-in slide-in-from-right-4 duration-300">
                      <input required placeholder="Name" className="p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-indigo-400" onChange={e => updateMember(i + 1, 'name', e.target.value)} />
                      <input required type="number" min="0" placeholder="Age" className="p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-indigo-400" onChange={e => updateMember(i + 1, 'age', e.target.value)} />
                      <select className="p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-indigo-400 appearance-none" onChange={e => updateMember(i + 1, 'gender', e.target.value)}>
                        <option>Male</option><option>Female</option>
                      </select>
                      <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i + 1))} className="absolute -top-2 -right-2 bg-red-100 p-1.5 rounded-full text-red-600 hover:bg-red-200 transition"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </section>

              <button disabled={loading} className="w-full bg-slate-950 text-white p-5 rounded-2xl font-black text-xl hover:bg-black active:scale-[0.98] transition-all mt-4 shadow-xl shadow-slate-200">
                {loading ? 'Processing...' : 'Register Family Info [cite: 3]'}
              </button>
            </form>
          )}
          
          <footer className="p-8 text-center text-slate-400 text-xs font-medium border-t border-slate-100">
             MMQEF COMMUNITY DATA PORTAL © 2026 [cite: 3]
          </footer>
        </div>
      </div>
    </div>
  );
}
