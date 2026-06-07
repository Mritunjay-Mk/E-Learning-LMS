# LearnHub AI LMS

LearnHub AI LMS is a production-oriented MERN learning platform with a responsive glassmorphism SaaS UI, course commerce, AI study tools, protected video learning, PDF library access, admin analytics, and deployment-ready configuration.

## Stack

- React + Vite, Tailwind CSS, Zustand, React Router, Framer Motion
- Node.js, Express.js, MongoDB Atlas, Mongoose
- JWT authentication with student/admin roles
- Razorpay checkout with UPI support and backend signature verification
- Gemini API for AI tutor, notes, lesson summaries, and quizzes
- Cloudinary for course images and PDF uploads
- Helmet, CORS, rate limiting, Mongo sanitize, XSS protection, validation

## Folder Structure

```txt
.
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   ├── routes
│   │   ├── stores
│   │   └── utils
│   └── vite.config.js
└── server
    └── src
        ├── config
        ├── controllers
        ├── middleware
        ├── models
        ├── routes
        ├── seed
        ├── services
        └── utils
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Fill `server/.env` with MongoDB Atlas, JWT, Razorpay, Gemini, Cloudinary, and optional SMTP values.

4. Seed sample content:

```bash
npm run seed
```

Seed accounts:

- Admin: `admin@learnhub.ai` / `Admin@12345`
- Student: `student@learnhub.ai` / `Student@12345`

5. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api/health`

## Deployment

### Frontend on Vercel or Netlify

- Build command: `npm --prefix client run build`
- Publish directory: `client/dist`
- Environment variables:
  - `VITE_API_URL=https://your-backend.onrender.com/api`
  - `VITE_APP_URL=https://your-frontend.vercel.app`
  - `VITE_RAZORPAY_KEY_ID=rzp_live_or_test_key`

### Backend on Render or Railway

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: copy from `server/.env.example`
- Add frontend domains to `ALLOWED_ORIGINS`

## Production Notes

- In production, the server requires real `MONGO_URI`, `JWT_SECRET`, Razorpay keys, Gemini API key, and Cloudinary keys.
- In development, missing Razorpay/Gemini/Cloudinary keys use local-safe fallbacks so UI flows remain testable.
- Razorpay payment verification happens in `server/src/controllers/paymentController.js`.
- Library access is granted by any active course enrollment or a paid library pass.
- The first registered account in a fresh database becomes an admin.
