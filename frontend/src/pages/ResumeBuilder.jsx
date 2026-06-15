import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, ArrowLeft, User, Briefcase, GraduationCap, Code2, FileEdit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const emptyExp = { title: '', company: '', duration: '', description: '' };
const emptyEdu = { degree: '', institution: '', year: '' };
const emptyProj = { name: '', description: '', techStack: '' };

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', summary: '',
    skillsInput: '',
    experience: [],
    education: [],
    projects: [],
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateArrayItem = (field, index, key, value) => {
    setForm((f) => {
      const arr = [...f[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...f, [field]: arr };
    });
  };

  const addItem = (field, empty) => setForm((f) => ({ ...f, [field]: [...f[field], { ...empty }] }));
  const removeItem = (field, index) => setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    const skills = form.skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!form.name.trim()) return toast.error('Name is required');
    if (skills.length === 0) return toast.error('Add at least one skill');

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        summary: form.summary,
        skills,
        experience: form.experience,
        education: form.education,
        projects: form.projects.map((p) => ({ ...p, techStack: typeof p.techStack === 'string' ? p.techStack.split(',').map((t) => t.trim()).filter(Boolean) : p.techStack })),
      };
      await api.post('/resume/manual', payload);
      toast.success('Resume created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resume');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Basic Info', icon: <User size={16} /> },
    { id: 2, label: 'Skills', icon: <Code2 size={16} /> },
    { id: 3, label: 'Experience', icon: <Briefcase size={16} /> },
    { id: 4, label: 'Education & Projects', icon: <GraduationCap size={16} /> },
  ];

  return (
    <div className="page animate-fade" style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28 }}><FileEdit size={26} style={{ verticalAlign: -4, marginRight: 8 }} className="grad-text" />Build Your Resume</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>Fill in the details — we'll structure it for AI analysis.</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {steps.map((s) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20,
            fontSize: 13, fontWeight: 600,
            background: step === s.id ? 'var(--primary-glow)' : 'var(--bg-card)',
            color: step === s.id ? 'var(--primary)' : step > s.id ? 'var(--success)' : 'var(--text-muted)',
            border: `1px solid ${step === s.id ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
          }}>
            {s.icon} {s.label}
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Basic Information</h3>
            <FieldGrid>
              <Field label="Full Name *">
                <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Rahul Kumar" />
              </Field>
              <Field label="Email">
                <input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="rahul@example.com" />
              </Field>
              <Field label="Phone">
                <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" />
              </Field>
            </FieldGrid>
            <Field label="Professional Summary">
              <textarea className="input" rows={4} value={form.summary} onChange={(e) => update('summary', e.target.value)}
                placeholder="A short summary about yourself, your goals, and strengths..." style={{ resize: 'vertical' }} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Your Skills</h3>
            <Field label="Skills (comma separated) *">
              <textarea className="input" rows={4} value={form.skillsInput} onChange={(e) => update('skillsInput', e.target.value)}
                placeholder="React.js, Node.js, Express, MongoDB, JavaScript, Git, REST APIs" style={{ resize: 'vertical' }} />
            </Field>
            {form.skillsInput && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {form.skillsInput.split(',').map((s) => s.trim()).filter(Boolean).map((skill, i) => (
                  <span key={i} style={{ fontSize: 12, padding: '5px 12px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: 20 }}>{skill}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Work Experience</h3>
              <button className="btn btn-outline" onClick={() => addItem('experience', emptyExp)}><Plus size={14} /> Add</button>
            </div>
            {form.experience.length === 0 && <EmptyHint text="No experience added. Skip if you're a fresher, or click Add." />}
            {form.experience.map((exp, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, marginBottom: 14, background: 'var(--bg-card2)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => removeItem('experience', i)}><Trash2 size={13} /></button>
                </div>
                <FieldGrid>
                  <Field label="Job Title"><input className="input" value={exp.title} onChange={(e) => updateArrayItem('experience', i, 'title', e.target.value)} placeholder="Full Stack Developer" /></Field>
                  <Field label="Company"><input className="input" value={exp.company} onChange={(e) => updateArrayItem('experience', i, 'company', e.target.value)} placeholder="Sensation Software Solutions" /></Field>
                  <Field label="Duration"><input className="input" value={exp.duration} onChange={(e) => updateArrayItem('experience', i, 'duration', e.target.value)} placeholder="Jan 2024 - Present" /></Field>
                </FieldGrid>
                <Field label="Description">
                  <textarea className="input" rows={3} value={exp.description} onChange={(e) => updateArrayItem('experience', i, 'description', e.target.value)} placeholder="What you did, technologies used, achievements..." style={{ resize: 'vertical' }} />
                </Field>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Education</h3>
              <button className="btn btn-outline" onClick={() => addItem('education', emptyEdu)}><Plus size={14} /> Add</button>
            </div>
            {form.education.length === 0 && <EmptyHint text="No education added yet." />}
            {form.education.map((edu, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, marginBottom: 14, background: 'var(--bg-card2)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => removeItem('education', i)}><Trash2 size={13} /></button>
                </div>
                <FieldGrid>
                  <Field label="Degree"><input className="input" value={edu.degree} onChange={(e) => updateArrayItem('education', i, 'degree', e.target.value)} placeholder="BCA in Full Stack Development" /></Field>
                  <Field label="Institution"><input className="input" value={edu.institution} onChange={(e) => updateArrayItem('education', i, 'institution', e.target.value)} placeholder="GNA University" /></Field>
                  <Field label="Year"><input className="input" value={edu.year} onChange={(e) => updateArrayItem('education', i, 'year', e.target.value)} placeholder="2022 - 2025" /></Field>
                </FieldGrid>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 28 }}>
              <h3>Projects</h3>
              <button className="btn btn-outline" onClick={() => addItem('projects', emptyProj)}><Plus size={14} /> Add</button>
            </div>
            {form.projects.length === 0 && <EmptyHint text="No projects added yet." />}
            {form.projects.map((proj, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, marginBottom: 14, background: 'var(--bg-card2)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => removeItem('projects', i)}><Trash2 size={13} /></button>
                </div>
                <FieldGrid>
                  <Field label="Project Name"><input className="input" value={proj.name} onChange={(e) => updateArrayItem('projects', i, 'name', e.target.value)} placeholder="HireAI - Job Portal" /></Field>
                  <Field label="Tech Stack (comma separated)"><input className="input" value={proj.techStack} onChange={(e) => updateArrayItem('projects', i, 'techStack', e.target.value)} placeholder="React, Node.js, MongoDB" /></Field>
                </FieldGrid>
                <Field label="Description">
                  <textarea className="input" rows={2} value={proj.description} onChange={(e) => updateArrayItem('projects', i, 'description', e.target.value)} placeholder="What the project does..." style={{ resize: 'vertical' }} />
                </Field>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button className="btn btn-outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            <ArrowLeft size={16} /> Back
          </button>
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep((s) => Math.min(4, s + 1))}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="spinner" /> : <>Create Resume <ArrowRight size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

function FieldGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>{children}</div>;
}

function EmptyHint({ text }) {
  return <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, fontStyle: 'italic' }}>{text}</p>;
}
