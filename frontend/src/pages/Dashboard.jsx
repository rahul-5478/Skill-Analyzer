import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, PenLine, ArrowRight, Trash2, RefreshCw, CheckCircle2, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => { fetchResume(); }, []);

  const fetchResume = async () => {
    try {
      const res = await api.get('/resume/my');
      setResume(res.data.resume);
    } catch (err) {
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error('Only PDF or DOCX files allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File must be under 5MB');
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(res.data.resume);
      toast.success('Resume uploaded & parsed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveResume = async () => {
    if (!resume) return;
    try {
      await api.delete(`/resume/${resume._id}`);
      setResume(null);
      toast.success('Resume removed');
    } catch (err) {
      toast.error('Failed to remove resume');
    }
  };

  return (
    <div className="page animate-fade">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
          Welcome, <span className="grad-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>
          Manage your resume and run a skill gap scan against any job role.
        </p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 220, borderRadius: 18 }} />
      ) : resume ? (
        <ResumeCard resume={resume} onRemove={handleRemoveResume} navigate={navigate} fileInputRef={fileInputRef} uploading={uploading} onFileSelect={handleFileSelect} />
      ) : (
        <EmptyState navigate={navigate} fileInputRef={fileInputRef} uploading={uploading} onFileSelect={handleFileSelect} />
      )}

      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" style={{ display: 'none' }} onChange={handleFileSelect} />
    </div>
  );
}

function EmptyState({ navigate, fileInputRef, uploading, onFileSelect }) {
  return (
    <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
        <FileText size={28} />
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>No resume yet</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 28, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        Upload an existing resume (PDF/DOCX) or build one from scratch with our guided form — either way, we'll get you ready for analysis.
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-accent btn-lg" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <span className="spinner" /> : <><Upload size={18} /> Upload Resume</>}
        </button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate('/resume/build')}>
          <PenLine size={18} /> Build Resume
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>Supports PDF & DOCX • Max 5MB</p>
    </div>
  );
}

function ResumeCard({ resume, onRemove, navigate, fileInputRef, uploading, onFileSelect }) {
  const data = resume.parsedData || {};
  return (
    <div>
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--success)20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}>RESUME READY</div>
              <h3 style={{ fontSize: 18 }}>{data.name || 'Your Resume'}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {resume.fileType === 'manual' ? 'Built manually' : resume.fileName} • {data.skills?.length || 0} skills detected
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <span className="spinner" /> : <><RefreshCw size={14} /> Replace</>}
            </button>
            <button className="btn btn-danger" onClick={onRemove}><Trash2 size={14} /> Remove</button>
          </div>
        </div>

        {data.skills?.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.skills.slice(0, 12).map((skill, i) => (
              <span key={i} style={{ fontSize: 12, padding: '5px 12px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-dim)' }}>
                {skill}
              </span>
            ))}
            {data.skills.length > 12 && (
              <span style={{ fontSize: 12, padding: '5px 12px', color: 'var(--text-muted)' }}>+{data.skills.length - 12} more</span>
            )}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: 32, textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(6,182,212,0.02))', border: '1px solid rgba(59,130,246,0.2)' }}>
        <ScanLine size={32} color="var(--primary)" style={{ marginBottom: 12 }} />
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Ready to scan</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Pick your target job role and let AI analyze your skill gaps.</p>
        <button className="btn btn-accent btn-lg" onClick={() => navigate('/job-select')}>
          Choose Job Role & Analyze <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
