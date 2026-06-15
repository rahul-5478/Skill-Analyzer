import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobRole: { type: String, required: true },
  jobCategory: { type: String },
  isPremium: { type: Boolean, default: false },
  paymentId: { type: String },
  result: {
    matchScore: Number,
    presentSkills: [String],
    missingSkills: [{
      skill: String,
      priority: { type: String, enum: ['critical', 'important', 'nice-to-have'] },
      reason: String
    }],
    strengthAreas: [String],
    weaknessAreas: [String],
    overallAssessment: String,
    learningRoadmap: [{
      phase: Number,
      title: String,
      duration: String,
      skills: [String],
      description: String
    }],
    courses: [{
      title: String,
      platform: String,
      url: String,
      duration: String,
      level: String,
      isFree: Boolean,
      skill: String
    }],
    resources: [{
      title: String,
      type: { type: String }, // ✅ enum removed — AI jo bhi value de allow hoga
      url: String,
      description: String
    }],
    premiumSuggestions: [{
      category: String,
      title: String,
      description: String,
      actionItem: String,
      impact: String
    }],
    resumeTips: [String],
    salaryInsight: String,
    careerPath: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Analysis', analysisSchema);