# SkillScan AI 🚀

SkillScan AI is a full-stack MERN application that helps users identify skill gaps between their current resume and their desired job role. Users can upload a resume or create one manually, select a target role, and receive an AI-powered analysis with personalized learning recommendations.

The project uses Groq's LLaMA 3.3 70B model for resume parsing and skill gap analysis.

---

## Why I Built This

Many students and job seekers know the role they want but don't know which skills they are missing.

SkillScan AI solves this problem by:

* Extracting skills from a resume
* Comparing them with industry requirements
* Highlighting missing skills
* Creating a learning roadmap
* Suggesting courses and resources
* Providing premium career guidance

---

## Tech Stack

### Frontend

* React (Vite)
* React Router DOM
* Zustand
* Axios
* React Hot Toast
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication

### AI Integration

* Groq API
* LLaMA 3.3 70B Model

### File Processing

* pdf-parse
* mammoth

### Payments

* Razorpay

---

## Main Features

### Resume Upload

Users can upload:

* PDF Resume
* DOCX Resume

The system automatically extracts:

* Skills
* Education
* Experience
* Projects

---

### Resume Builder

Users can create a resume manually using a multi-step form if they don't already have one.

---

### Job Role Selection

Users can choose from multiple career paths such as:

* Frontend Developer
* Backend Developer
* Full Stack Developer
* Data Analyst
* Data Scientist
* DevOps Engineer
* Mobile App Developer
* UI/UX Designer
* AI/ML Engineer

and many more.

---

### AI Skill Gap Analysis

After selecting a role, the AI generates:

* Match Score
* Existing Skills
* Missing Skills
* Skill Priorities
* Strength Areas
* Weakness Areas
* Career Readiness Insights

---

### Learning Roadmap

The system creates a structured roadmap divided into:

#### Phase 1

Foundation Skills

#### Phase 2

Intermediate Skills

#### Phase 3

Advanced Skills & Projects

---

### Course Recommendations

Recommended learning resources include:

* Free Courses
* Paid Courses
* Documentation
* YouTube Resources
* Practice Platforms

---

### Premium Features (₹10)

After successful Razorpay payment, users unlock:

* Resume Improvement Suggestions
* Career Growth Plan
* Salary Insights
* Career Progression Path
* 10 Personalized Career Recommendations

---

## Project Structure

```bash
skill-analyzer
│
├── backend
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   └── server.js
│
└── frontend
    └── src
        ├── components
        ├── pages
        ├── store
        └── utils
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd skill-analyzer
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GROQ_API_KEY=your_groq_api_key

RAZORPAY_KEY_ID=your_razorpay_key_id

RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start backend server:

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## User Flow

### Step 1

Create an account or log in.

### Step 2

Upload a resume or build one manually.

### Step 3

Select your target job role.

### Step 4

Receive AI-generated skill gap analysis.

### Step 5

Explore recommended courses and learning roadmap.

### Step 6

Unlock premium insights through Razorpay.

### Step 7

Track previous analyses in the History section.

---

## Authentication

The application uses JWT-based authentication.

Features include:

* Registration
* Login
* Protected Routes
* Persistent Sessions

---

## Database Collections

### Users

Stores:

* Name
* Email
* Password

### Resumes

Stores:

* Resume Data
* Extracted Skills
* Education
* Experience

### Analyses

Stores:

* Analysis Results
* Match Score
* Recommendations

### Payments

Stores:

* Razorpay Transaction Details
* Payment Status

---

## Future Improvements

Planned features:

* ATS Score Checker
* LinkedIn Profile Analysis
* Job Recommendation Engine
* AI Interview Preparation
* Cover Letter Generator
* Resume Templates
* Multi-language Support

---

## Challenges Faced

Some challenges during development included:

* Handling PDF and DOCX parsing reliably
* Managing AI response formatting
* Solving ESM and CommonJS compatibility issues
* Integrating Razorpay payments
* Designing meaningful skill-gap prompts for the AI model

---

## Author

Rahul Kumar

Built as a learning project to help students and job seekers understand where they stand and what they need to learn next in order to reach their target career goals.
