import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function JobSelect() {
  const [jobRoles, setJobRoles] = useState({});
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analysis/job-roles')
      .then((res) => setJobRoles(res.data.jobRoles))
      .catch(() => toast.error('Failed to load job roles'))
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async () => {
    if (!selected) return toast.error('Please select a job role');
    setAnalyzing(true);
    try {
      const res = await api.post('/analysis/analyze', { jobRole: selected });
      toast.success('Analysis complete!');
      navigate(`/analysis/${res.data.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // Group by category
  const categories = {};
  Object.entries(jobRoles).forEach(([role, cat]) => {
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(role);
  });

  const filtered = Object.entries(categories).reduce((acc, [cat, roles]) => {
    const f = roles.filter((r) => r.toLowerCase().includes(search.toLowerCase()));
    if (f.length) acc[cat] = f;
    return acc;
  }, {});

  return (
    <div className="page animate-fade">
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <Target size={32} color="var(--primary)" style={{ marginBottom: 10 }} />
        <h1 style={{ fontSize: 30 }}>Choose Your <span className="grad-text">Target Role</span></h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>We'll compare your resume against this role's requirements.</p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto 28px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
        <input className="input" style={{ paddingLeft: 42 }} placeholder="Search job roles..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, maxWidth: 900, margin: '0 auto' }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 70 }} />)}
        </div>
      ) : (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {Object.entries(filtered).map(([cat, roles]) => (
            <div key={cat} style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{cat}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelected(role)}
                    className="glass-card"
                    style={{
                      padding: '18px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      border: `1px solid ${selected === role ? 'var(--primary)' : 'var(--border)'}`,
                      background: selected === role ? 'var(--primary-glow)' : 'var(--bg-card)',
                      color: selected === role ? 'var(--primary)' : 'var(--text)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(filtered).length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No roles match "{search}"</p>
          )}
        </div>
      )}

      <div style={{ position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <button className="btn btn-accent btn-lg" onClick={handleAnalyze} disabled={!selected || analyzing} style={{ boxShadow: 'var(--shadow-glow)' }}>
          {analyzing ? <><span className="spinner" /> Analyzing your resume...</> : <>Analyze for "{selected || 'role'}" <ArrowRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}
