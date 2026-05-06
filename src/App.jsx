import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, MapPin, Home, CheckCircle, AlertCircle, LayoutDashboard, LogOut, Search, Users } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [view, setView] = useState('form'); // 'form', 'login', or 'admin'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '', mobile_number: '', postal_code: '', address: '',
    male_count: 0, female_count: 0, unmarried_male_count: 0, unmarried_female_count: 0
  });

  const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: insertError } = await supabase.from('community_members').insert([formData]);
    if (insertError) {
      setError(insertError.message.includes('unique') ? 'Mobile number already registered!' : insertError.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.user === 'admin' && loginCreds.pass === 'admin123') {
      fetchAdminData();
      setView('admin');
    } else {
      alert('Invalid Credentials');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('community_members').select('*').order('created_at', { ascending: false });
    if (!error) setAdminData(data);
    setLoading(false);
  };

  const filteredData = adminData.filter(item => 
    item.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.mobile_number.includes(searchQuery)
  );

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-700"><LayoutDashboard /> Admin Portal</h1>
            <button onClick={() => setView('form')} className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"><LogOut size={18} /> Exit Admin</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-indigo-500">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Families</p>
              <p className="text-3xl font-black">{adminData.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-green-500">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Members</p>
              <p className="text-3xl font-black">
                {adminData.reduce((acc, curr) => acc + (curr.male_count || 0) + (curr.female_count || 0), 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="p-4 border-b bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input 
                  className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="Search by name or mobile..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase tracking-widest">Name</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest">Mobile</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Family Size</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(member => (
                    <tr key={member.id} className="border-b hover:bg-indigo-50/30 transition last:border-0">
                      <td className="p-4 font-semibold text-slate-800">{member.full_name}</td>
                      <td className="p-4 text-slate-600 font-mono tracking-tighter">{member.mobile_number}</td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{member.male_count}M</span>
                        <span className="mx-1 text-slate-300">|</span>
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-bold">{member.female_count}F</span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 max-w-xs break-words">{member.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans antialiased">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-indigo-700 p-8 text-white text-center relative shadow-inner">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Family Directory</h1>
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-[0.2em]">Community Portal</p>
          <button 
            onClick={() => setView('login')}
            className="absolute top-4 right-4 p-2 text-indigo-300 hover:text-white transition-all opacity-40 hover:opacity-100"
          >
            <Users size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-16 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Registration Complete</h2>
            <p className="text-slate-500 mt-3 leading-relaxed">Thank you, {formData.full_name}. Your family information has been securely stored.</p>
            <button onClick={() => window.location.reload()} className="mt-10 w-full bg-slate-100 py-4 rounded-2xl text-slate-800 font-bold hover:bg-slate-200 transition">Add Another Entry</button>
          </div>
        ) : view === 'login' ? (
          <form onSubmit={handleLogin} className="p-10 space-y-5">
            <div className="text-center mb-6">
              <h2 className="font-black text-2xl text-slate-800">Admin Login</h2>
              <p className="text-slate-400 text-sm">Enter credentials to view directory</p>
            </div>
            <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Username" onChange={e => setLoginCreds({...loginCreds, user: e.target.value})} />
            <input required type="password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Password" onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})} />
            <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-black transition shadow-xl">Access Dashboard</button>
            <button type="button" onClick={() => setView('form')} className="w-full text-slate-400 text-sm font-bold">Cancel</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}
            <div className="space-y-4">
              <div className="relative group"><User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition" size={20} /><input required placeholder="Full Name" className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none" onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
              <div className="relative group"><Phone className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition" size={20} /><input required type="tel" placeholder="Mobile Number" className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none" onChange={e => setFormData({...formData, mobile_number: e.target.value})} /></div>
              <div className="relative group"><MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition" size={20} /><input required placeholder="Postal Code" className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none" onChange={e => setFormData({...formData, postal_code: e.target.value})} /></div>
              <div className="relative group"><Home className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition" size={20} /><textarea required placeholder="Correspondence Address" className="w-full pl-12 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition outline-none" rows="2" onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100"><label className="text-[10px] uppercase font-black text-blue-600 block mb-1">Males</label><input type="number" min="0" placeholder="0" className="w-full bg-transparent font-bold text-lg outline-none" onChange={e => setFormData({...formData, male_count: parseInt(e.target.value)||0})} /></div>
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100"><label className="text-[10px] uppercase font-black text-pink-600 block mb-1">Females</label><input type="number" min="0" placeholder="0" className="w-full bg-transparent font-bold text-lg outline-none" onChange={e => setFormData({...formData, female_count: parseInt(e.target.value)||0})} /></div>
            </div>

            <button disabled={loading} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
              {loading ? 'Processing...' : 'Register Family'}
            </button>
          </form>
        )}
      </div>
      <p className="text-center text-slate-400 text-xs mt-8 font-medium">© 2026 Community Directory Secure Portal</p>
    </div>
  );
}
