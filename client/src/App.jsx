import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ChatbotWidget from './components/ai/ChatbotWidget';
import { PageLoader } from './components/common/Skeleton';
import AdminRoute from './routes/AdminRoute';
import EducatorRoute from './routes/EducatorRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import ScrollToTop from './routes/ScrollToTop';
import { useAuthStore } from './stores/authStore';

const Home = lazy(() => import('./pages/public/Home'));
const Courses = lazy(() => import('./pages/courses/Courses'));
const CourseDetails = lazy(() => import('./pages/courses/CourseDetails'));
const WatchCourse = lazy(() => import('./pages/courses/WatchCourse'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const EducatorDashboard = lazy(() => import('./pages/dashboard/EducatorDashboard'));
const Library = lazy(() => import('./pages/library/Library'));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/payment/PaymentFailed'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-[calc(100vh-var(--nav-height))]">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route
              path="/watch/:slug"
              element={
                <ProtectedRoute>
                  <WatchCourse />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/educator"
              element={
                <EducatorRoute>
                  <EducatorDashboard />
                </EducatorRoute>
              }
            />
            <Route path="/library" element={<Library />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <ChatbotWidget />
      <Footer />
    </>
  );
}
