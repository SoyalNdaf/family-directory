import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, MapPin, Home, Users, CheckCircle, AlertCircle } from 'lucide-react';

// Use environment variables for security
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '', mobile_number: '', postal_code: '', address: '',
    male_count: 0, female_count: 0, unmarried_male_count: 0, unmarried_female_count: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for duplicates
    const { data: existing } = await supabase
      .from('community_members')
      .select('mobile_number')
      .eq('mobile_number', formData.mobile_number)
      .single();

    if (existing) {
      setError('This mobile number is already registered!');
      setLoading(false);
      return;
    }

    // Save data
    const { error: insertError } = await supabase
      .from('community_members')
      .insert([formData]);

    if (insertError) {
      setError('Error: ' + insertError.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-indigo-600">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Success!</h1>
        <p className="mt-2 text-slate-600">Information for {formData.full_name} has been saved.</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-indigo-600 font-bold underline">
          Register another family
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-700 p-6 text-white text-center">
          <h1 className="text-2xl font-black tracking-tight">COMMUNITY DIRECTORY</h1>
          <p className="text-indigo-100 text-sm">Family Information Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required placeholder="Full Name" className="w-full pl-10 p-3 border rounded-lg"
                onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required type="tel" placeholder="Mobile Number" className="w-full pl-10 p-3 border rounded-lg"
                onChange={e => setFormData({...formData, mobile_number: e.target.value})} />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required placeholder="Postal Code" className="w-full pl-10 p-3 border rounded-lg"
                onChange={e => setFormData({...formData, postal_code: e.target.value})} />
            </div>

            <div className="relative">
              <Home className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea required placeholder="Correspondence Address" className="w-full pl-10 p-3 border rounded-lg" rows="3"
                onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="bg-blue-50 p-3 rounded-lg">
              <label className="block text-xs font-bold text-blue-700 mb-1">Males</label>
              <input type="number" min="0" className="w-full p-1 rounded" 
                onChange={e => setFormData({...formData, male_count: parseInt(e.target.value) || 0})} />
            </div>
            <div className="bg-pink-50 p-3 rounded-lg">
              <label className="block text-xs font-bold text-pink-700 mb-1">Females</label>
              <input type="number" min="0" className="w-full p-1 rounded" 
                onChange={e => setFormData({...formData, female_count: parseInt(e.target.value) || 0})} />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <label className="block text-xs font-bold text-slate-600 mb-1">Unmarried (M)</label>
              <input type="number" min="0" className="w-full p-1 rounded" 
                onChange={e => setFormData({...formData, unmarried_male_count: parseInt(e.target.value) || 0})} />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <label className="block text-xs font-bold text-slate-600 mb-1">Unmarried (F)</label>
              <input type="number" min="0" className="w-full p-1 rounded" 
                onChange={e => setFormData({...formData, unmarried_female_count: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-800 transition-all disabled:bg-slate-300">
            {loading ? 'Processing...' : 'Submit Family Data'}
          </button>
        </form>
      </div>
    </div>
  );
}
