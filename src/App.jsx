import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Phone, MapPin, Home, CheckCircle, AlertCircle, 
  LayoutDashboard, LogOut, Search, Users, Trash2, 
  Settings, GraduationCap, Briefcase, Heart, 
  ClipboardList, CalendarDays, BadgeCheck 
} from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const QUALIFICATIONS = ["Below SSC", "SSC", "HSC", "Graduate", "Post Graduate", "Professional (Dr./Eng./Lawyer)"];
const OCCUPATIONS = ["Private Service", "Government Service", "Business", "Self-Employed", "Unemployed", "Student", "Housewife"];
const MARITAL_STATUSES = ["Unmarried", "Married", "Widow", "Divorcee"];

const FormField = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col w-full">
    <label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-wider ml-1 mb-1.5">
      {Icon && <Icon size={14} className="text-indigo-500" />} {label}
    </label>
    <div className="w-full h-[48px]">
      {children}
    </div>
  </div>
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
  const [members, setMembers] = useState([{ name: '', age: '13', gender: 'Male', marital_status: 'Unmarried', qualification: 'SSC', occupation: 'Government Service' }]);
  const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });

  const addMemberRow = () => setMembers([...members, { name: '', age: '13', gender: 'Male', marital_status: 'Unmarried', qualification: 'Below SSC', occupation: 'Private Service' }]);
  
  const updateMember = (index, field, value) => {
    const updated = [...members];
    if (field === 'age' && value < 0) value = 0;
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const { data: family, error: fErr } = await supabase.from('families').insert([{ ...familyData, hof_name: members[0].name }]).select().single();
      if (fErr) throw fErr;
      
      const membersToInsert = members.map(m => ({
        family_id: family.id, member_name: m.name, age: parseInt(m.age), gender: m.gender,
        marital_status: m.marital_status, qualification: m.qualification, occupation: m.occupation
      }));
      
      const { error: mErr } = await supabase.from('family_members').insert(membersToInsert);
      if (mErr) throw mErr;
      
      setSubmitted(true);
      window.scrollTo(0, 0);
      
    } catch (err) {
      console.error("Database Error:", err);
      // BULLETPROOF ERROR CATCHER
      const errMsg = (err?.message || err?.details || err?.hint || String(err)).toLowerCase();
      
      if (errMsg.includes('unique') || errMsg.includes('duplicate') || err?.code === '23505') {
        setError("This Mobile Number is already registered! Please use a different number.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      window.scrollTo(0, 0); // Scroll up to show the error
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.user === 'admin' && loginCreds.pass === 'admin123') { fetchAdminData(); setView('admin'); }
    else { alert('Access Denied'); }
  };

  const fetchAdminData = async () => {
    const { data } = await supabase.from('families').select('*, family_members(*)').order('created_at', { ascending: false });
    if (data) setAdminData(data);
  };

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
        <header className="w-full bg-white border-b-2 border-slate-100 p-4 md:p-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
              <img src="https://appcdn.goqii.com/storeimg/2316_1778071871.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-xl md:text-3xl font-black text-[#1E3A8A] uppercase tracking-tight">Foundation Admin</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Community Database Access</p>
            </div>
            <button onClick={() => setView('form')} className="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-md">
              <LogOut size={18} /> Exit Admin
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto mt-4">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
              <Search className="text-indigo-400" size={24} />
              <input 
                className="w-full bg-transparent outline-none text-lg text-slate-700 font-medium placeholder-slate-400" 
                placeholder="Search by Head of Family, Mobile, or Area PIN Code..." 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-100">
                  <tr>
                    <th className="p-6">HOF Name</th>
                    <th className="p-6">Mobile</th>
                    <th className="p-6">PIN Code</th>
                    <th className="p-6 text-center">Family Size</th>
                    <th className="p-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminData.filter(f => f.hof_name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.mobile_number.includes(searchQuery) || f.postal_code?.includes(searchQuery)).map(f => (
                    <tr key={f.id} className="hover:bg-indigo-50/50 cursor-pointer transition-colors" onClick={() => setSelectedFamily(f)}>
                      <td className="p-6 font-black text-slate-800">{f.hof_name}</td>
                      <td className="p-6 text-sm font-mono font-bold text-slate-600">{f.mobile_number}</td>
                      <td className="p-6 text-sm font-mono font-bold text-slate-600 bg-slate-50/50">{f.postal_code || 'N/A'}</td>
                      <td className="p-6 text-center font-black text-indigo-600 bg-indigo-50/30">{f.family_members?.length || 0} Members</td>
                      <td className="p-6 text-right text-indigo-600 font-bold text-xs uppercase underline">View Full Family</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedFamily && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setSelectedFamily(null)}>
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-[#1E3A8A] uppercase tracking-tight">{selectedFamily.hof_name}'s Family</h2>
                  <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-2"><MapPin size={16}/> {selectedFamily.address} <span className="font-black text-slate-700 ml-2">(PIN: {selectedFamily.postal_code})</span></p>
                </div>
                <button onClick={() => setSelectedFamily(null)} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full text-slate-600 transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {selectedFamily.family_members.map((m, i) => (
                  <div key={m.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <p className="font-black text-[#1E3A8A] border-b border-slate-200 pb-3 text-lg flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">{i+1}</span> {m.member_name}
                    </p>
                    <div className="text-[11px] text-slate-500 grid grid-cols-2 gap-y-3 gap-x-2 uppercase tracking-widest font-bold">
                      <p>Gender: <span className="font-black text-slate-900 block mt-1 text-sm">{m.gender}</span></p>
                      <p>Age: <span className="font-black text-slate-900 block mt-1 text-sm">{m.age}</span></p>
                      <p>Status: <span className="font-black text-slate-900 block mt-1 text-sm">{m.marital_status}</span></p>
                      <p className="col-span-2">Qualification: <span className="font-black text-slate-900 block mt-1 text-sm">{m.qualification}</span></p>
                      <p className="col-span-2">Occupation: <span className="font-black text-indigo-600 block mt-1 text-sm">{m.occupation}</span></p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedFamily(null)} className="w-full mt-10 bg-[#1E3A8A] text-white py-5 rounded-2xl font-black shadow-xl hover:bg-black transition-colors text-lg uppercase tracking-widest">Close Details</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased pb-20">
      <header className="w-full bg-white border-b p-4 md:p-6 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <img src="https://appcdn.goqii.com/storeimg/2316_1778071871.png" className="w-16 h-16" alt="logo" />
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-lg md:text-3xl font-black text-[#1E3A8A] uppercase tracking-tight">Moradabad Mumbai Qureshi Ekta Foundation</h1>
            <div className="h-1 bg-green-100 w-full mt-2 rounded-full hidden md:block"></div>
          </div>
          <button onClick={() => setView('login')} className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><Settings size={24} /></button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border overflow-hidden">
        <div className="bg-[#1E3A8A] p-5 text-white text-center font-black uppercase tracking-widest text-sm">
          Family Registration Portal
        </div>

        {submitted ? (
          <div className="p-20 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
            <h2 className="text-2xl font-black text-slate-800">Registration Success!</h2>
            <button onClick={() => window.location.reload()} className="mt-8 bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl font-black transition active:scale-95">Register New Family</button>
          </div>
        ) : view === 'login' ? (
          <form onSubmit={handleLogin} className="p-10 md:p-16 space-y-8 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <BadgeCheck size={40} />
              </div>
              <h3 className="text-3xl font-black text-[#1E3A8A] uppercase tracking-tight">Admin Access</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Restricted foundation dashboard</p>
            </div>
            <div className="space-y-6">
              <FormField label="Username" icon={User}><input required className="w-full h-full px-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold" onChange={e => setLoginCreds({...loginCreds, user: e.target.value})} /></FormField>
              <FormField label="Password" icon={Settings}><input required type="password" className="w-full h-full px-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold" onChange={e => setLoginCreds({...loginCreds, pass: e.target.value})} /></FormField>
            </div>
            <div className="space-y-4 pt-4">
              <button className="w-full bg-[#1E3A8A] text-white py-6 rounded-2xl font-black shadow-xl hover:bg-black transition-all text-xl uppercase tracking-widest">Login</button>
              <button type="button" onClick={() => setView('form')} className="w-full text-slate-400 text-sm font-black uppercase tracking-widest hover:text-slate-600 p-4">Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-12 relative">
            
            {/* UPDATED FRIENDLY ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 text-red-700 p-5 rounded-2xl border-2 border-red-200 flex items-start gap-4 mb-8 shadow-sm animate-in slide-in-from-top-4">
                <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs mb-1">Registration Notice</h4>
                  <p className="text-sm font-bold">{error}</p>
                </div>
              </div>
            )}

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-[#1E3A8A] mb-8 border-b-2 border-slate-100 pb-4">
                <ClipboardList size={20}/> 
                <h3 className="font-black uppercase text-sm tracking-widest">01. Head of Family Detail</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                  <FormField label="Full Name" icon={User}><input required placeholder="Enter Name" className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={members[0].name} onChange={e => updateMember(0, 'name', e.target.value)} /></FormField>
                </div>
                <FormField label="Mobile" icon={Phone}><input required placeholder="Number" className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={e => setFamilyData({...familyData, mobile_number: e.target.value})} /></FormField>
                <FormField label="PIN Code" icon={MapPin}><input required placeholder="Area PIN" className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={e => setFamilyData({...familyData, postal_code: e.target.value})} /></FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField label="Age" icon={CalendarDays}><input required type="number" min="0" className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500" value={members[0].age} onChange={e => updateMember(0, 'age', e.target.value)} /></FormField>
                <FormField label="Gender" icon={Users}><select className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={members[0].gender} onChange={e => updateMember(0, 'gender', e.target.value)}><option>Male</option><option>Female</option></select></FormField>
                <FormField label="Marital Status" icon={Heart}><select className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={members[0].marital_status} onChange={e => updateMember(0, 'marital_status', e.target.value)}>{MARITAL_STATUSES.map(s => <option key={s}>{s}</option>)}</select></FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Qualification" icon={GraduationCap}><select className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={members[0].qualification} onChange={e => updateMember(0, 'qualification', e.target.value)}>{QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}</select></FormField>
                <FormField label="Occupation" icon={Briefcase}><select className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={members[0].occupation} onChange={e => updateMember(0, 'occupation', e.target.value)}>{OCCUPATIONS.map(o => <option key={o}>{o}</option>)}</select></FormField>
              </div>

              <FormField label="Full Address" icon={MapPin}><textarea required className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" rows="3" onChange={e => setFamilyData({...familyData, address: e.target.value})} /></FormField>
            </section>

            <section className="pt-8">
              <div className="flex justify-between items-center text-[#1E3A8A] border-b-2 border-slate-100 pb-4 mb-8">
                <div className="flex items-center gap-3"><Users size={20}/> <h3 className="font-black uppercase text-sm tracking-widest">02. Other Family Members ({members.length - 1})</h3></div>
                <button type="button" onClick={addMemberRow} className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-full font-bold text-xs uppercase hover:bg-indigo-100 transition-all shadow-sm active:scale-95">+ Add Member</button>
              </div>

              <div className="space-y-8">
                {members.slice(1).map((m, i) => (
                  <div key={i} className="pt-10 p-6 md:p-8 bg-slate-50/50 rounded-3xl border border-slate-200 relative space-y-8 shadow-sm">
                    <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i + 1))} className="absolute top-4 right-4 bg-red-50 p-2.5 rounded-full text-red-500 hover:bg-red-100 transition-colors z-10"><Trash2 size={18} /></button>
                    
                    <FormField label="Member Name" icon={User}><input required className="w-full h-full px-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={m.name} onChange={e => updateMember(i + 1, 'name', e.target.value)} /></FormField>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormField label="Age"><input required type="number" min="0" className="w-full h-full px-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={m.age} onChange={e => updateMember(i + 1, 'age', e.target.value)} /></FormField>
                      <FormField label="Gender"><select className="w-full h-full px-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer" value={m.gender} onChange={e => updateMember(i + 1, 'gender', e.target.value)}><option>Male</option><option>Female</option></select></FormField>
                      <FormField label="Status"><select className="w-full h-full px-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer" value={m.marital_status} onChange={e => updateMember(i + 1, 'marital_status', e.target.value)}>{MARITAL_STATUSES.map(s => <option key={s}>{s}</option>)}</select></FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField label="Qualification"><select className="w-full h-full px-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer" value={m.qualification} onChange={e => updateMember(i + 1, 'qualification', e.target.value)}>{QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}</select></FormField>
                      <FormField label="Occupation"><select className="w-full h-full px-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer" value={m.occupation} onChange={e => updateMember(i + 1, 'occupation', e.target.value)}>{OCCUPATIONS.map(o => <option key={o}>{o}</option>)}</select></FormField>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button disabled={loading} className="w-full bg-[#1E3A8A] text-white p-6 rounded-[2rem] font-black text-xl shadow-2xl transition hover:bg-black active:scale-[0.98] mt-8">
              {loading ? 'Registering Family...' : 'Register Family Info'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
