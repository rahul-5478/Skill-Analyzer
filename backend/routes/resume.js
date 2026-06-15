import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import { parseResumeFile } from '../utils/resumeParser.js';
import { parseResumeWithAI } from '../utils/groqAI.js';

const router = express.Router();

// Setup multer
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files allowed'));
  }
});

// Upload resume file
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const rawText = await parseResumeFile(req.file.path, req.file.mimetype);
    if (!rawText || rawText.trim().length < 50) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Could not extract text from file. Try a different format.' });
    }

    const parsedData = await parseResumeWithAI(rawText);

    // Deactivate old resumes
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase().replace('.', ''),
      rawText,
      parsedData
    });

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ resume });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
});

// Create resume manually
router.post('/manual', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, summary, skills, experience, education, projects } = req.body;

    if (!name || !skills?.length) 
      return res.status(400).json({ message: 'Name and at least one skill are required' });

    const parsedData = { name, email, phone, summary, skills, experience: experience || [], education: education || [], projects: projects || [] };
    
    // Build raw text for AI
    const rawText = `
Name: ${name}
Email: ${email || ''}
Phone: ${phone || ''}
Summary: ${summary || ''}
Skills: ${skills.join(', ')}
Experience: ${(experience || []).map(e => `${e.title} at ${e.company} (${e.duration}): ${e.description}`).join('\n')}
Education: ${(education || []).map(e => `${e.degree} from ${e.institution} (${e.year})`).join('\n')}
Projects: ${(projects || []).map(p => `${p.name}: ${p.description} - Tech: ${p.techStack?.join(', ')}`).join('\n')}
    `.trim();

    // Deactivate old resumes
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });

    const resume = await Resume.create({
      userId: req.user._id,
      fileType: 'manual',
      rawText,
      parsedData
    });

    res.status(201).json({ resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's active resume
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all user resumes
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set active resume
router.patch('/:id/activate', authMiddleware, async (req, res) => {
  try {
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: true },
      { new: true }
    );
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete resume
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
