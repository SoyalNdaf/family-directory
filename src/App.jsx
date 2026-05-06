import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, MapPin, Home, CheckCircle, AlertCircle, LayoutDashboard, LogOut, Search, Users, Trash2, CalendarDays, Smile } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
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
      // Step 1: Insert Family
      const { data: family, error: fErr } = await supabase
        .from('families')
        .insert([{ 
          ...familyData, 
          hof_name: members[0].name 
        }])
        .select()
        .single();

      if (fErr) throw fErr;

      // Step 2: Insert Members
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
    if (loginCreds.user === 'admin' && loginCreds.pass === 'admin2026') {
      fetchAdminData();
      setView('admin');
    } else {
      alert('Invalid Credentials');
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
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        <header className="flex justify-between items-center bg-indigo-900 p-5 rounded-2xl text-white mb-6">
          <h1 className="text-xl font-black uppercase">Admin Dashboard</h1>
          <button onClick={() => setView('form')} className="bg-white/10 px-4 py-2 rounded-lg font-bold">Exit</button>
        </header>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
           <div className="p-4 border-b">
              <input className="w-full p-3 bg-slate-100 rounded-xl outline-none" placeholder="Search members..." onChange={e => setSearchQuery(e.target.value)} />
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
                <tr><th className="p-4">HOF Name</th><th className="p-4">Mobile</th><th className="p-4">Members</th></tr>
              </thead>
              <tbody>
                {adminData.filter(f => f.hof_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
                  <tr key={f.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedFamily(f)}>
                    <td className="p-4 font-bold">{f.hof_name}</td>
                    <td className="p-4">{f.mobile_number}</td>
                    <td className="p-4">{f.family_members?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
        {selectedFamily && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedFamily(null)}>
            <div className="bg-white p-8 rounded-3xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-black mb-4">{selectedFamily.hof_name}'s Family</h2>
              {selectedFamily.family_members.map(m => (
                <div key={m.id} className="border-b py-2 flex justify-between">
                  <span>{m.member_name} ({m.gender})</span>
                  <span className="font-bold">{m.age} Years</span>
                </div>
              ))}
              <button onClick={() => setSelectedFamily(null)} className="mt-6 w-full bg-slate-100 py-3 rounded-xl font-bold">Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <header className="bg-indigo-800 p-8 text-white text-center relative">
          <h1 className="text-2xl font-black uppercase">Family Directory</h1>
          <p className="text-xs opacity-70">Moradabad Mumbai Qureshi Ekta Foundation [cite: 3]</p>
          <button onClick={() => setView('login')} className="absolute top-4 right-4 opacity-30 hover:opacity-100">⚙️</button>
        </header>

        {submitted ? (
          <div className="p-16 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black">Success!</h2>
            <button onClick={() => window.location.reload()} className="mt-8 w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Add Another Family</button>
          </div>
        ) : view === 'login' ? (
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <h2 className="text-xl font-black">Admin Access</h2>
            <input className="w-full p-4 border rounded-xl" placeholder="Username" onChange={e => setLoginCreds({...loginCreds, user: e.target.value})} />
            <input type="password" className="w-full p-4 border rounded-xl" placeholder="Password" onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})} />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black">Login</button>
            <button type="button" onClick={() => setView('form')} className="w-full text-slate-400 text-sm mt-2">Back to Registration</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
            
            <section className="space-y-4">
              <h3 className="font-black text-indigo-800 text-sm uppercase tracking-widest">Head of Family</h3>
              <input required placeholder="HOF Full Name" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => updateMember(0, 'name', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Age" className="w-full p-4 bg-slate-50 border rounded-xl outline-none" onChange={e => updateMember(0, 'age', e.target.value)} />
                <select className="w-full p-4 bg-slate-50 border rounded-xl outline-none" onChange={e => updateMember(0, 'gender', e.target.value)}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t">
              <h3 className="font-black text-indigo-800 text-sm uppercase tracking-widest">Contact Info</h3>
              <input required type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 border rounded-xl outline-none" onChange={e => setFamilyData({...familyData, mobile_number: e.target.value})} />
              <textarea required placeholder="Correspondence Address [cite: 23]" className="w-full p-4 bg-slate-50 border rounded-xl outline-none" rows="2" onChange={e => setFamilyData({...familyData, address: e.target.value})} />
            </section>

            <section className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-indigo-800 text-sm uppercase tracking-widest">Other Members ({members.length - 1})</h3>
                <button type="button" onClick={addMemberRow} className="text-indigo-600 font-bold text-xs">+ Add Member</button>
              </div>
              {members.slice(1).map((m, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl grid grid-cols-3 gap-2">
                  <input required placeholder="Name" className="p-2 border rounded bg-white text-sm" onChange={e => updateMember(i + 1, 'name', e.target.value)} />
                  <input required type="number" placeholder="Age" className="p-2 border rounded bg-white text-sm" onChange={e => updateMember(i + 1, 'age', e.target.value)} />
                  <select className="p-2 border rounded bg-white text-sm" onChange={e => updateMember(i + 1, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              ))}
            </section>

            <button disabled={loading} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all">
              {loading ? 'Processing...' : 'Register Family Info'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
