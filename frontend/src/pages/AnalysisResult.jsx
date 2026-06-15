import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, CheckCircle2, XCircle, BookOpen, ExternalLink,
  TrendingUp, AlertCircle, Award, Target, Lightbulb, Briefcase, IndianRupee, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => { fetchAnalysis(); }, [id]);

  const fetchAnalysis = async () => {
    try {
      const res = await api.get(`/analysis/${id}`);
      setAnalysis(res.data.analysis);
    } catch (err) {
      toast.error('Failed to load analysis');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setPayLoading(true);
    try {
      const orderRes = await api.post('/payment/create-order', { analysisId: id });
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'SkillScan AI',
        description: 'Premium Career Analysis',
        order_id: orderId,
        theme: { color: '#3b82f6' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              analysisId: id,
            });
            toast.success('Payment verified! Generating premium insights...');
            const upgradeRes = await api.post(`/analysis/upgrade/${id}`, {
              paymentId: response.razorpay_payment_id
            });
            setAnalysis(upgradeRes.data.analysis);
            toast.success('Premium analysis unlocked! 🎉');
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          } finally {
            setPayLoading(false);
          }
        },
        modal: { ondismiss: () => setPayLoading(false) },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh.');
        setPayLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPayLoading(false);
      });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start payment');
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 100, marginBottom: 20, borderRadius: 18 }} />
        <div className="skeleton" style={{ height: 300, marginBottom: 20, borderRadius: 18 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 18 }} />
      </div>
    );
  }

  if (!analysis) return null;

  // ✅ FIXED — result null hone pe crash nahi hoga
  const r = analysis.result || {};
  const matchScore = r.matchScore || 0;
  const scoreColor = matchScore >= 70 ? 'var(--success)' : matchScore >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page animate-fade">
      <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Dashboard
      </button>

      {/* Header / Score */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Analysis for
            </div>
            <h1 style={{ fontSize: 26 }}>{analysis.jobRole}</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 8, maxWidth: 500, fontSize: 14 }}>
              {r.overallAssessment || 'Analysis completed.'}
            </p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <ScoreRing score={matchScore} color={scoreColor} />
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>Match Score</div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <SectionTitle icon={<TrendingUp size={18} color="var(--success)" />} title="Strength Areas" />
          <TagList items={r.strengthAreas || []} color="success" />
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <SectionTitle icon={<AlertCircle size={18} color="var(--warning)" />} title="Areas to Improve" />
          <TagList items={r.weaknessAreas || []} color="warning" />
        </div>
      </div>

      {/* Skills Present / Missing */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <SectionTitle icon={<Target size={18} color="var(--primary)" />} title="Skill Breakdown" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} /> Skills You Have ({r.presentSkills?.length || 0})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(r.presentSkills || []).map((s, i) => (
                <span key={i} className="badge badge-free">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={15} /> Missing Skills ({r.missingSkills?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(r.missingSkills || []).map((s, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{s.skill}</span>
                    <span className={`badge badge-${s.priority === 'critical' ? 'critical' : s.priority === 'important' ? 'important' : 'nice'}`}>
                      {s.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <SectionTitle icon={<BookOpen size={18} color="var(--accent)" />} title="Your Learning Roadmap" />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(r.learningRoadmap || []).map((phase, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
                  border: '1px solid rgba(59,130,246,0.3)'
                }}>{phase.phase}</div>
                {i < (r.learningRoadmap.length - 1) && (
                  <div style={{ flex: 1, width: 2, background: 'var(--border)', minHeight: 40 }} />
                )}
              </div>
              <div style={{ paddingBottom: 24, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 16 }}>{phase.title}</h4>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '2px 10px', background: 'var(--bg-card2)', borderRadius: 12 }}>
                    {phase.duration}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>{phase.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(phase.skills || []).map((s, j) => (
                    <span key={j} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: 12 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <SectionTitle icon={<Award size={18} color="var(--primary)" />} title="Recommended Courses" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginTop: 16 }}>
          {(r.courses || []).map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="glass-card"
              style={{ padding: 16, textDecoration: 'none', color: 'inherit', background: 'var(--bg-card2)', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span className={`badge ${c.isFree ? 'badge-free' : 'badge-paid'}`}>{c.isFree ? 'FREE' : 'PAID'}</span>
                <ExternalLink size={14} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{c.title}</h4>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span>{c.platform} • {c.level}</span>
                <span>{c.duration} • For: {c.skill}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <SectionTitle icon={<Lightbulb size={18} color="var(--warning)" />} title="Resources & References" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {(r.resources || []).map((res, i) => (
            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: 10, textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{res.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{res.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{res.type}</span>
                <ExternalLink size={14} color="var(--text-muted)" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Premium Section */}
      {analysis.isPremium ? (
        <PremiumContent r={r} />
      ) : (
        <div className="glass-card" style={{
          padding: 32, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(217,119,6,0.02))',
          border: '1px solid rgba(245,158,11,0.25)'
        }}>
          <Lock size={28} color="var(--premium)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>
            Unlock Premium Career Insights — <span style={{ color: 'var(--premium)' }}>₹10</span>
          </h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: 480, margin: '0 auto 20px', fontSize: 14 }}>
            Get 10 hyper-specific suggestions, resume rewrite tips, India salary insights, and your full career progression path.
          </p>
          <button className="btn btn-premium btn-lg" onClick={handleUpgrade} disabled={payLoading}>
            {payLoading ? <span className="spinner" /> : <><IndianRupee size={16} /> Unlock for ₹10</>}
          </button>
        </div>
      )}
    </div>
  );
}

function PremiumContent({ r }) {
  return (
    <div className="glass-card" style={{ padding: 28, border: '1px solid rgba(245,158,11,0.25)' }}>
      <SectionTitle icon={<Sparkles size={18} color="var(--premium)" />} title="Premium Career Playbook" badge />

      {/* Premium Suggestions */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(r.premiumSuggestions || []).map((s, i) => (
          <div key={i} style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--premium)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                  {s.category}
                </span>
                <h4 style={{ fontSize: 14, marginTop: 2 }}>{s.title}</h4>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', background: 'var(--success)20', color: 'var(--success)', borderRadius: 10, flexShrink: 0 }}>
                {s.impact}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 }}>{s.description}</p>
            <p style={{ fontSize: 13, color: 'var(--primary)' }}><strong>Action:</strong> {s.actionItem}</p>
          </div>
        ))}
      </div>

      {/* Resume Tips */}
      {(r.resumeTips || []).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Briefcase size={15} /> Resume Improvement Tips
          </h4>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {r.resumeTips.map((t, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text-dim)' }}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Salary Insight */}
      {r.salaryInsight && (
        <div style={{ marginTop: 24, padding: 16, background: 'var(--success)10', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
          <h4 style={{ fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IndianRupee size={15} /> Salary Insight (India)
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{r.salaryInsight}</p>
        </div>
      )}

      {/* Career Path */}
      {(r.careerPath || []).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 14, marginBottom: 10 }}>Career Progression Path</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {r.careerPath.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, padding: '6px 14px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: 20, fontWeight: 600 }}>
                  {step}
                </span>
                {i < r.careerPath.length - 1 && (
                  <ArrowLeft size={14} style={{ transform: 'rotate(180deg)', color: 'var(--text-muted)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, color }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="60" y="68" textAnchor="middle" fontSize="28" fontWeight="800" fill={color}
        fontFamily="Space Grotesk, sans-serif">{score}%</text>
    </svg>
  );
}

function SectionTitle({ icon, title, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon}
      <h3 style={{ fontSize: 17 }}>{title}</h3>
      {badge && <span className="badge badge-paid" style={{ marginLeft: 4 }}>PREMIUM</span>}
    </div>
  );
}

function TagList({ items, color }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
      {items?.length > 0 ? items.map((item, i) => (
        <span key={i} style={{
          fontSize: 12, padding: '5px 12px', borderRadius: 20,
          background: `var(--${color})15`, color: `var(--${color})`,
          border: `1px solid var(--${color})30`,
        }}>{item}</span>
      )) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>None identified</span>}
    </div>
  );
}