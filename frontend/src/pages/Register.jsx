import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome to SkillScan AI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapper}>
      <div className="glass-card animate-fade" style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Radar size={32} color="#3b82f6" style={{ marginBottom: 10 }} />
          <h2>Create your account</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 6 }}>Start scanning your resume against any job role</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label"><User size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Full Name</label>
            <input className="input" required placeholder="Rahul Kumar"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label"><Mail size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Email</label>
            <input className="input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label"><Lock size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Password</label>
            <input className="input" type="password" required placeholder="At least 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-dim)', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const wrapper = { minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
const card = { width: '100%', maxWidth: 420, padding: 36 };
