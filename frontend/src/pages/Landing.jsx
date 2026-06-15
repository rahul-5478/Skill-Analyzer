import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, Upload, ScanLine, Target, BookOpen, Sparkles, FileText, CheckCircle2, Zap } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      {/* HERO */}
      <section style={hero}>
        <div style={heroGrid}>
          <div className="animate-fade">
            <div style={eyebrow}>
              <Zap size={14} /> AI-Powered Career Intelligence
            </div>
            <h1 style={heroTitle}>
              Find the gap between<br />
              your resume and your<br />
              <span className="grad-text">dream job.</span>
            </h1>
            <p style={heroSub}>
              Upload your resume or build one in minutes. SkillScan AI scans it against
              real job roles, pinpoints exactly what's missing, and hands you a
              personalised roadmap — courses, projects, and resources included.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-accent btn-lg">
                Scan My Resume <ArrowRight size={18} />
              </Link>
              <Link to={isAuthenticated ? '/resume/build' : '/register'} className="btn btn-outline btn-lg">
                Build a Resume
              </Link>
            </div>
            <div style={statsRow}>
              <div><strong>25+</strong><span>Job Roles</span></div>
              <div><strong>AI</strong><span>Skill Gap Engine</span></div>
              <div><strong>₹10</strong><span>Premium Insights</span></div>
            </div>
          </div>

          {/* Signature scan visual */}
          <div className="animate-float" style={{ position: 'relative' }}>
            <div style={scanCard}>
              <div style={scanHeader}>
                <FileText size={16} color="var(--primary)" />
                <span>resume_rahul.pdf</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>Analyzing...</span>
              </div>
              <div style={scanBody}>
                <div style={scanLine}></div>
                {[
                  { label: 'React.js', match: true },
                  { label: 'Node.js', match: true },
                  { label: 'MongoDB', match: true },
                  { label: 'Docker', match: false },
                  { label: 'AWS', match: false },
                  { label: 'GraphQL', match: false },
                  { label: 'TypeScript', match: true },
                ].map((s, i) => (
                  <div key={i} style={skillRow}>
                    <span style={{ fontSize: 13 }}>{s.label}</span>
                    {s.match
                      ? <span className="badge badge-free"><CheckCircle2 size={12}/> Found</span>
                      : <span className="badge badge-critical">Missing</span>
                    }
                  </div>
                ))}
              </div>
              <div style={scanFooter}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Match Score</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)' }} className="grad-text">68%</div>
              </div>
            </div>
            <div style={floatBadge1}><Target size={14} /> Role: MERN Developer</div>
            <div style={floatBadge2}><Sparkles size={14} /> 4 gaps found</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={section}>
        <h2 style={sectionTitle}>How <span className="grad-text">SkillScan</span> works</h2>
        <p style={sectionSub}>Three steps from "where do I stand?" to "here's exactly what to do."</p>

        <div style={stepsGrid}>
          <StepCard
            num="01"
            icon={<Upload size={22} />}
            title="Upload or Build"
            desc="Drop your existing resume (PDF/DOCX) or build a fresh one with our guided form — no resume? No problem."
          />
          <StepCard
            num="02"
            icon={<Target size={22} />}
            title="Pick Your Target Role"
            desc="Choose from 25+ roles — Full Stack, Data Scientist, DevOps, ML Engineer and more. AI matches your profile instantly."
          />
          <StepCard
            num="03"
            icon={<BookOpen size={22} />}
            title="Get Your Roadmap"
            desc="See your match score, missing skills by priority, a phased learning roadmap, and curated free + paid courses."
          />
        </div>
      </section>

      {/* PREMIUM */}
      <section style={section}>
        <div style={premiumBanner}>
          <div style={{ flex: 1 }}>
            <div style={{ ...eyebrow, background: 'var(--premium-glow)', color: 'var(--premium)', borderColor: 'rgba(245,158,11,0.3)' }}>
              <Sparkles size={14} /> Premium Analysis — ₹10
            </div>
            <h2 style={{ fontSize: 28, marginTop: 12, marginBottom: 10 }}>
              Unlock the <span style={{ color: 'var(--premium)' }}>full career playbook</span>
            </h2>
            <p style={{ color: 'var(--text-dim)', maxWidth: 480 }}>
              For the price of a cup of chai — get 10 hyper-specific career suggestions,
              resume rewrite tips, salary insights for India, and a complete career
              progression path tailored to your target role.
            </p>
          </div>
          <div style={premiumList}>
            {['10 Premium Suggestions', 'Resume Improvement Tips', 'Salary Insight (India)', 'Career Progression Path'].map((f, i) => (
              <div key={i} style={premiumItem}><CheckCircle2 size={16} color="var(--premium)" /> {f}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...section, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={sectionTitle}>Ready to close the gap?</h2>
        <p style={sectionSub}>Free analysis takes under a minute. Sign up now.</p>
        <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-accent btn-lg" style={{ marginTop: 16 }}>
          <ScanLine size={18} /> Start Free Scan
        </Link>
      </section>
    </div>
  );
}

function StepCard({ num, icon, title, desc }) {
  return (
    <div className="glass-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 48, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--border-light)', lineHeight: 1 }}>{num}</div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 18, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>{desc}</p>
    </div>
  );
}

const hero = { padding: '60px 24px 40px', maxWidth: 1200, margin: '0 auto' };
const heroGrid = { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60, alignItems: 'center' };
const eyebrow = {
  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
  padding: '6px 12px', borderRadius: 20, background: 'var(--primary-glow)', color: 'var(--primary)',
  border: '1px solid rgba(59,130,246,0.3)', letterSpacing: 0.5, textTransform: 'uppercase',
};
const heroTitle = { fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.15, marginTop: 20, letterSpacing: '-0.02em' };
const heroSub = { fontSize: 16, color: 'var(--text-dim)', marginTop: 20, maxWidth: 520 };
const statsRow = { display: 'flex', gap: 36, marginTop: 44, flexWrap: 'wrap' };

const scanCard = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18,
  overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-glow)',
};
const scanHeader = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px',
  borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)',
};
const scanBody = { padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' };
const scanLine = {
  position: 'absolute', left: 0, right: 0, height: 2,
  background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
  animation: 'scan 3s linear infinite', opacity: 0.6,
};
const skillRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '8px 12px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)',
};
const scanFooter = {
  padding: '18px', borderTop: '1px solid var(--border)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const floatBadge1 = {
  position: 'absolute', top: -16, right: -10, background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 30, padding: '8px 16px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  boxShadow: 'var(--shadow)',
};
const floatBadge2 = {
  position: 'absolute', bottom: -16, left: -16, background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: 30, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6,
  boxShadow: 'var(--shadow)',
};

const section = { maxWidth: 1200, margin: '0 auto', padding: '60px 24px' };
const sectionTitle = { fontSize: 'clamp(26px, 4vw, 38px)', textAlign: 'center', letterSpacing: '-0.02em' };
const sectionSub = { textAlign: 'center', color: 'var(--text-dim)', marginTop: 12, fontSize: 15 };
const stepsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 48 };

const premiumBanner = {
  display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center',
  background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(217,119,6,0.02))',
  border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: 40,
};
const premiumList = { display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240 };
const premiumItem = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500 };
