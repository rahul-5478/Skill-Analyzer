import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in .env file');
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function parseResumeWithAI(rawText) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume parser. Extract structured data from the resume text and return ONLY valid JSON. No explanation, no markdown, just raw JSON.'
      },
      {
        role: 'user',
        content: `Parse this resume and return JSON with fields: name, email, phone, summary, skills (array of strings), experience (array of {title, company, duration, description}), education (array of {degree, institution, year}), projects (array of {name, description, techStack}).

Resume:
${rawText.substring(0, 6000)}`
      }
    ],
    temperature: 0.1,
    max_tokens: 2000
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      skills: [],
      experience: [],
      education: [],
      projects: [],
      summary: ''
    };
  }
}

export async function analyzeSkillGap(resumeData, jobRole, isPremium = false) {
  const { parsedData, rawText } = resumeData;

  const skills = parsedData?.skills || [];
  const experience = parsedData?.experience || [];
  const projects = parsedData?.projects || [];

  const resumeSummary = `
Skills: ${skills.join(', ')}
Experience: ${experience.map(e => `${e.title} at ${e.company}`).join(', ')}
Projects: ${projects.map(p => p.name).join(', ')}
Raw Text: ${rawText || ''}
  `.trim();

  const freePrompt = `
You are an expert career coach and skill gap analyzer.

Analyze this resume for the job role: "${jobRole}"

Resume Data:
${resumeSummary}

Return ONLY a valid JSON object with exactly these fields (no markdown, no explanation):
{
  "matchScore": <number 0-100>,
  "overallAssessment": "<2-3 sentence assessment>",
  "strengthAreas": ["<area1>", "<area2>", "<area3>"],
  "weaknessAreas": ["<area1>", "<area2>", "<area3>"],
  "presentSkills": ["<skill1>", "<skill2>"],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "priority": "<critical|important|nice-to-have>",
      "reason": "<why this skill matters for the role>"
    }
  ],
  "learningRoadmap": [
    {
      "phase": 1,
      "title": "<phase title>",
      "duration": "<e.g. 2-3 weeks>",
      "description": "<what to focus on>",
      "skills": ["<skill1>", "<skill2>"]
    }
  ],
  "courses": [
    {
      "title": "<course title>",
      "platform": "<Udemy|Coursera|YouTube|freeCodeCamp|etc>",
      "url": "<real url>",
      "level": "<Beginner|Intermediate|Advanced>",
      "duration": "<e.g. 10 hours>",
      "skill": "<which skill it teaches>",
      "isFree": <true|false>
    }
  ],
  "resources": [
    {
      "title": "<resource title>",
      "url": "<real url>",
      "type": "<docs|blog|video|tool>",
      "description": "<short description>"
    }
  ]
}`;

  const premiumPrompt = `
You are an expert career coach and skill gap analyzer.

Analyze this resume for the job role: "${jobRole}"

Resume Data:
${resumeSummary}

Return ONLY a valid JSON object with exactly these fields (no markdown, no explanation):
{
  "matchScore": <number 0-100>,
  "overallAssessment": "<2-3 sentence assessment>",
  "strengthAreas": ["<area1>", "<area2>", "<area3>"],
  "weaknessAreas": ["<area1>", "<area2>", "<area3>"],
  "presentSkills": ["<skill1>", "<skill2>"],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "priority": "<critical|important|nice-to-have>",
      "reason": "<why this skill matters for the role>"
    }
  ],
  "learningRoadmap": [
    {
      "phase": 1,
      "title": "<phase title>",
      "duration": "<e.g. 2-3 weeks>",
      "description": "<what to focus on>",
      "skills": ["<skill1>", "<skill2>"]
    }
  ],
  "courses": [
    {
      "title": "<course title>",
      "platform": "<platform name>",
      "url": "<real url>",
      "level": "<Beginner|Intermediate|Advanced>",
      "duration": "<e.g. 10 hours>",
      "skill": "<which skill it teaches>",
      "isFree": <true|false>
    }
  ],
  "resources": [
    {
      "title": "<resource title>",
      "url": "<real url>",
      "type": "<docs|blog|video|tool>",
      "description": "<short description>"
    }
  ],
  "premiumSuggestions": [
    {
      "category": "<Resume|LinkedIn|Skills|Portfolio|Networking>",
      "title": "<specific suggestion title>",
      "description": "<detailed description>",
      "actionItem": "<exact action to take>",
      "impact": "<High|Medium>"
    }
  ],
  "resumeTips": [
    "<specific tip to improve resume for ${jobRole}>"
  ],
  "salaryInsight": "<India salary range for ${jobRole} at different experience levels>",
  "careerPath": ["<Junior Role>", "<Mid Role>", "<Senior Role>", "<Lead Role>"]
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach. Return ONLY valid JSON. No markdown, no backticks, no explanation. Just raw JSON.'
        },
        {
          role: 'user',
          content: isPremium ? premiumPrompt : freePrompt
        }
      ],
      temperature: 0.2,
      max_tokens: isPremium ? 4000 : 2500
    });

    const text = response.choices[0].message.content;
    console.log('🤖 AI Raw Response length:', text.length);

    // Clean response
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    console.log('✅ AI parsed successfully, matchScore:', parsed.matchScore);
    return parsed;

  } catch (err) {
    console.error('🔴 analyzeSkillGap error:', err.message);

    // Fallback response
    return {
      matchScore: 0,
      overallAssessment: 'Analysis could not be completed. Please try again.',
      strengthAreas: [],
      weaknessAreas: [],
      presentSkills: skills.slice(0, 5),
      missingSkills: [],
      learningRoadmap: [],
      courses: [],
      resources: [],
      ...(isPremium && {
        premiumSuggestions: [],
        resumeTips: [],
        salaryInsight: '',
        careerPath: []
      })
    };
  }
}