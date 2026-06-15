import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapper}>
      <div className="glass-card animate-fade" style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Radar size={32} color="#3b82f6" style={{ marginBottom: 10 }} />
          <h2>Welcome back</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 6 }}>Log in to continue your skill analysis</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label"><Mail size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Email</label>
            <input className="input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label"><Lock size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Password</label>
            <input className="input" type="password" required placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner" /> : <>Login <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-dim)', marginTop: 20 }}>
          New here? <Link to="/register" style={{ color: 'var(--primary)' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

const wrapper = { minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
const card = { width: '100%', maxWidth: 420, padding: 36 };
