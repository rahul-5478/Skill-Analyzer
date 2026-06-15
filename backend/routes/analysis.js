import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import Analysis from '../models/Analysis.js';
import { analyzeSkillGap } from '../utils/groqAI.js';

const router = express.Router();

const JOB_ROLES = {
  "Frontend Developer": "Web & Mobile",
  "Backend Developer": "Web & Mobile",
  "Full Stack Developer": "Web & Mobile",
  "React Developer": "Web & Mobile",
  "Node.js Developer": "Web & Mobile",
  "MERN Stack Developer": "Web & Mobile",
  "Python Developer": "Programming",
  "Java Developer": "Programming",
  "Data Scientist": "Data & AI",
  "Data Analyst": "Data & AI",
  "Machine Learning Engineer": "Data & AI",
  "AI/ML Engineer": "Data & AI",
  "DevOps Engineer": "Infrastructure",
  "Cloud Engineer (AWS)": "Infrastructure",
  "Cloud Engineer (Azure)": "Infrastructure",
  "Android Developer": "Mobile",
  "iOS Developer": "Mobile",
  "React Native Developer": "Mobile",
  "Flutter Developer": "Mobile",
  "UI/UX Designer": "Design",
  "Product Manager": "Management",
  "QA Engineer": "Testing",
  "Cybersecurity Engineer": "Security",
  "Blockchain Developer": "Emerging Tech",
  "Game Developer": "Gaming"
};

// Get available job roles
router.get('/job-roles', (req, res) => {
  res.json({ jobRoles: JOB_ROLES });
});

// Start analysis (free)
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { jobRole, resumeId } = req.body;
    console.log('📊 Analyze request:', { jobRole, resumeId, userId: req.user._id });

    if (!jobRole) return res.status(400).json({ message: 'Job role is required' });

    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      resume = await Resume.findOne({ userId: req.user._id, isActive: true });
    }

    console.log('📄 Resume found:', !!resume);
    if (!resume) return res.status(404).json({ message: 'No resume found. Please upload or create a resume first.' });

    console.log('🤖 Calling AI...');
    const result = await analyzeSkillGap(
      { parsedData: resume.parsedData, rawText: resume.rawText.substring(0, 3000) },
      jobRole,
      false
    );
    console.log('✅ AI result received, matchScore:', result?.matchScore);

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobRole,
      jobCategory: JOB_ROLES[jobRole] || 'General',
      isPremium: false,
      result
    });

    console.log('✅ Analysis saved:', analysis._id);
    res.status(201).json({ analysis });

  } catch (err) {
    console.error('🔴 Analyze error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
});

// Upgrade analysis to premium
router.post('/upgrade/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.body;
    console.log('💎 Upgrade request:', req.params.analysisId);

    const analysis = await Analysis.findOne({ _id: req.params.analysisId, userId: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    if (analysis.isPremium) return res.status(400).json({ message: 'Already premium' });

    const resume = await Resume.findById(analysis.resumeId);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    console.log('🤖 Calling AI for premium...');
    const result = await analyzeSkillGap(
      { parsedData: resume.parsedData, rawText: resume.rawText.substring(0, 3000) },
      analysis.jobRole,
      true
    );
    console.log('✅ Premium AI result received');

    analysis.result = result;
    analysis.isPremium = true;
    analysis.paymentId = paymentId;
    await analysis.save();

    console.log('✅ Premium analysis saved');
    res.json({ analysis });

  } catch (err) {
    console.error('🔴 Upgrade error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
});

// Get all analyses for user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .populate('resumeId', 'fileName fileType parsedData.name')
      .sort({ createdAt: -1 });
    res.json({ analyses });
  } catch (err) {
    console.error('🔴 Get analyses error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get single analysis
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId', 'fileName fileType parsedData');
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ analysis });
  } catch (err) {
    console.error('🔴 Get analysis error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Delete analysis
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Analysis deleted' });
  } catch (err) {
    console.error('🔴 Delete error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;