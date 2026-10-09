import { useState, useEffect } from 'react';
import { User } from './types';
import { authApi } from './services/api';
import { Login } from './pages/Login';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { StudentDashboard } from './pages/StudentDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  useEffect(() => {
    const checkActiveSession = async () => {
      const token = localStorage.getItem('midtrack_jwt_token');
      if (!token) {
        setCurrentUser(null);
        setIsLoadingSession(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        setCurrentUser(res.user);
      } catch (err) {
        console.error('Session expired or invalid:', err);
        setCurrentUser(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkActiveSession();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#F0F6FD] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-[#146EF5] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#0A2566] tracking-wider uppercase">Loading MID TRACK...</p>
      </div>
    );
  }

  // 1. Logged-in Faculty Portal
  if (currentUser && currentUser.role === 'FACULTY') {
    return <FacultyDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // 2. Logged-in Student Portal (Module 7)
  if (currentUser && currentUser.role === 'STUDENT') {
    return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // 3. Public Login Screen
  return (
    <Login
      currentUser={currentUser}
      onLoginSuccess={handleLoginSuccess}
      onLogout={handleLogout}
    />
  );
}
