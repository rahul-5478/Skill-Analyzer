import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String },
  fileType: { type: String, enum: ['pdf', 'docx', 'manual'] },
  rawText: { type: String, required: true },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: [{ 
      title: String, 
      company: String, 
      duration: String, 
      description: String 
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    projects: [{
      name: String,
      description: String,
      techStack: [String]
    }],
    summary: String
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', resumeSchema);
