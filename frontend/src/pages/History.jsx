import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, ArrowRight, Trash2, Sparkles, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAnalyses(); }, []);

  const fetchAnalyses = async () => {
    try {
      const res = await api.get('/analysis/my');
      setAnalyses(res.data.analyses);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/analysis/${id}`);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
      toast.success('Analysis deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const scoreColor = (score) => score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28 }}><HistoryIcon size={26} style={{ verticalAlign: -4, marginRight: 8 }} className="grad-text" />Analysis History</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>All your past skill gap analyses.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}
        </div>
      ) : analyses.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <ScanLine size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>No analyses yet</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>Run your first scan to see results here.</p>
          <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {analyses.map((a) => (
            <div
              key={a._id}
              onClick={() => navigate(`/analysis/${a._id}`)}
              className="glass-card"
              style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16, flexWrap: 'wrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)',
                  color: scoreColor(a.result?.matchScore), border: `2px solid ${scoreColor(a.result?.matchScore)}40`,
                  background: `${scoreColor(a.result?.matchScore)}10`,
                }}>
                  {a.result?.matchScore}%
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: 15 }}>{a.jobRole}</h4>
                    {a.isPremium && <span className="badge badge-paid"><Sparkles size={10}/> Premium</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' • '}{a.result?.missingSkills?.length || 0} skills missing
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={(e) => handleDelete(a._id, e)}><Trash2 size={14} /></button>
                <ArrowRight size={18} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
