# 🎯 TestPulse - Online Examination Platform

<div align="center">

![TestPulse Banner](./public/og-image.png)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-testpulse.vercel.app-6C63FF?style=for-the-badge)](https://testpulse.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/testpulse?style=for-the-badge&color=FFD700)](https://github.com/yourusername/testpulse/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/testpulse?style=for-the-badge)](https://github.com/yourusername/testpulse/forks)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://github.com/yourusername/testpulse)
[![Made by Antigravity](https://img.shields.io/badge/Built_at-Antigravity_Bootcamp-orange?style=for-the-badge)](https://antigravity.dev)

**A next-generation free online examination platform built with MERN Stack**

[🚀 Live Demo](https://testpulse.vercel.app) •
[📖 Documentation](https://testpulse.vercel.app/docs) •
[🐛 Report Bug](https://github.com/yourusername/testpulse/issues) •
[✨ Request Feature](https://github.com/yourusername/testpulse/issues)

</div>

---

## 🌟 What is TestPulse?

**TestPulse** is a free, open-source **online examination platform**
built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).
It enables educators, universities, and organizations to:

- ✅ Create online exams and MCQ tests
- ✅ Conduct secure online examinations with AI proctoring
- ✅ Analyze results with real-time analytics dashboards
- ✅ Auto-grade objective questions instantly
- ✅ Export results as PDF or CSV

---

## 🚀 Live Demo

> **🌐 [https://testpulse.vercel.app](https://testpulse.vercel.app)**

| Role | Email | Password |
|------|-------|----------|
| Admin/Teacher | admin@testpulse.com | Admin@123 |
| Student | student@testpulse.com | Student@123 |

---

## ✨ Features

### 📝 Exam Management
- Create online exams with multiple question types (MCQ, T/F, Short Answer, Coding)
- Question bank management and import from Excel/CSV
- Set time limits, attempt limits, and passing scores
- Schedule exams with start/end dates

### 📊 Real-Time Analytics
- Live dashboard showing active exam takers
- Question-wise performance analysis
- Student rank generation and leaderboard
- Detailed performance reports

### 🔒 Security & Proctoring
- AI-powered online proctoring
- Browser lockdown (full-screen enforcement)
- Tab-switch and window-blur detection
- Webcam monitoring and snapshots
- Plagiarism detection

### ⚡ Auto-Grading
- Instant MCQ and objective question grading
- Negative marking support
- Partial marking for multi-select questions
- Manual grading for descriptive answers

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **MongoDB** | Database | 7.x |
| **Express.js** | Backend API | 4.x |
| **React.js** | Frontend UI | 18.x |
| **Node.js** | Runtime | 20.x |
| **Vite** | Build Tool | 5.x |
| **JWT** | Authentication | - |
| **Socket.io** | Real-time features | 4.x |
| **Cloudinary** | Image storage | - |
| **Vercel** | Deployment | - |

---

## ⚡ Quick Start

### Prerequisites
```bash
node >= 20.x
npm >= 10.x
MongoDB Atlas account
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/testpulse.git
cd testpulse

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your values

# 5. Run development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# 6. Open browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

### Environment Variables

**server/.env**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/testpulse
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TestPulse
```

---

## 📁 Project Structure

```
testpulse/
├── client/                 # React Frontend
│   ├── public/
│   │   ├── index.html      # Base HTML with SEO
│   │   ├── sitemap.xml     # SEO sitemap
│   │   ├── robots.txt      # Search engine rules
│   │   └── manifest.json   # PWA manifest
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── SEO.jsx     # SEO Helmet component
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx    # Landing page
│   │   │   ├── Features.jsx
│   │   │   ├── Blog.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Node.js Backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Helper functions
│   └── server.js
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🌐 API Documentation

```
Base URL: https://testpulse.vercel.app/api

Authentication:
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user

Exams:
GET    /api/exams            - Get all exams
POST   /api/exams            - Create new exam
GET    /api/exams/:id        - Get single exam
PUT    /api/exams/:id        - Update exam
DELETE /api/exams/:id        - Delete exam

Results:
GET    /api/results          - Get all results
POST   /api/results/submit   - Submit exam
GET    /api/results/:id      - Get single result
```

---

## 📸 Screenshots

| Page | Preview |
|------|---------|
| Home | ![Home](./screenshots/home.png) |
| Create Exam | ![Create](./screenshots/create-exam.png) |
| Dashboard | ![Dashboard](./screenshots/dashboard.png) |
| Analytics | ![Analytics](./screenshots/analytics.png) |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🔗 Connect

- **Live Demo**: [testpulse.vercel.app](https://testpulse.vercel.app)
- **GitHub**: [github.com/yourusername/testpulse](https://github.com/yourusername/testpulse)
- **Email**: contact@testpulse.com

---

<div align="center">

**Built with ❤️ at Antigravity Bootcamp**

If this project helped you, please give it a ⭐ on GitHub!

`online-exam-platform` `mern-stack` `examination-system`
`quiz-maker` `online-assessment` `exam-management`
`edtech` `auto-grading` `mcq-test` `proctoring`

</div>
