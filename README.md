<div align="center">
  <img src="https://img.shields.io/badge/IMPLEXEDU-Learning%20Management%20System-6c63ff?style=for-the-badge&logo=education&logoColor=white" alt="IMPLEXEDU Logo"/>
  <h1>ImplexEdu LMS Platform</h1>
  <p><strong>A Next-Generation, Glassmorphic Learning Management System.</strong></p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
    <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D%2014.0.0-success" />
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white" />
    <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white" />
  </p>
</div>

---

## 🌟 Overview

**ImplexEdu LMS** is a full-stack learning management platform designed with an ultra-premium **dark glassmorphism aesthetic**. It provides an end-to-end ecosystem for managing students, teachers, trial classes, and enrollments, all while delivering a stunning, frictionless user experience across mobile and desktop.

### ✨ Key Features

- **🛡️ Admin Command Center**: A centralized hub for reviewing student payment proofs, approving/rejecting enrollment requests, and viewing advanced platform analytics.
- **📱 Demo Management Panel**: A dedicated, isolated portal for the sales/onboarding team to monitor incoming trial class requests and instantly contact leads via WhatsApp.
- **👨‍🏫 Teacher Dashboard**: Empower instructors to manage their assigned courses, schedule live sessions, and track their students.
- **🎓 Student Portal**: A secure dashboard for students to view their enrolled courses, track progress, and securely submit payment proofs.
- **💎 Premium UI/UX**: Built with an app-wide frosted glass (glassmorphism) design, floating theme toggles, dynamic grid layouts, and micro-animations. Fully fluid and mobile-responsive.

---

## 🏗️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Glassmorphism, CSS Variables, Flexbox/Grid)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT (JSON Web Tokens) for stateless authentication, Bcrypt for password hashing.
- **Deployment Ready**: Optimized environment variable injection for seamless deployment to platforms like Render, Vercel, or Heroku.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

### 2. Installation & Setup

Clone the repository and install the backend dependencies:
```bash
git clone https://github.com/AyushPrad2907/LMS.git
cd LMS/backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory and configure your secrets:

```env
# Server
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# Security
JWT_SECRET=your_super_secret_jwt_key

# Default Demo Manager Credentials (Auto-seeded on startup)
DEMO_MANAGER_EMAIL=manager@demo.com
DEMO_MANAGER_PASSWORD=demo_secure_pass_123
```

### 4. Running the Application

Start the backend server. The server will automatically serve the frontend static files.
```bash
# From the backend directory
npm start
```
The platform will be live at: `http://localhost:5000`

---

## 🎨 Theme Architecture

The platform features a global **Light/Dark Mode** engine controlled by CSS variables located in `frontend/style.css`.
- Defaults to a clean, bright Light Mode.
- Can be toggled globally via the floating smart button located on the Admin Dashboard.
- User preference is persistently saved in browser `localStorage`.

---

## 🔒 Security Posture

- **Role-Based Access Control (RBAC)**: Strict API middleware ensuring that Students, Teachers, Admins, and Demo Managers cannot access each other's endpoints.
- **Password Protection**: Plaintext passwords are NEVER saved. All credentials undergo heavy salt/hash cycles via `bcrypt`.
- **Stateless Sessions**: JWT tokens ensure high-performance, scalable session validation without heavy server memory loads.

<br />
<div align="center">
  <i>Engineered for the future of digital education.</i>
</div>
