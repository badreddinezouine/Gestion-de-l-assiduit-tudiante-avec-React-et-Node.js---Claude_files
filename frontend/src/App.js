import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';

// Pages d'authentification
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages professeur
import ProfessorDashboard from './pages/professor/Dashboard';
import CourseManagement from './pages/professor/CourseManagement';
import AttendanceQR from './pages/professor/AttendanceQR';
import StudentProfile from './pages/professor/StudentProfile';
import GradeAdaptation from './pages/professor/GradeAdaptation';
import Statistics from './pages/professor/Statistics';
import ChatBotDecisions from './pages/professor/ChatBotDecisions';

// Pages étudiant
import StudentDashboard from './pages/student/Dashboard';
import ScanQR from './pages/student/ScanQR';
import MyAbsences from './pages/student/MyAbsences';
import MyGrades from './pages/student/MyGrades';
import MyCalendar from './pages/student/MyCalendar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées - Professeur */}
          <Route path="/professor" element={
            <PrivateRoute allowedRoles={['PROFESSEUR', 'ADMIN']}>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<ProfessorDashboard />} />
            <Route path="dashboard" element={<ProfessorDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="attendance" element={<AttendanceQR />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="grades" element={<GradeAdaptation />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="chatbot" element={<ChatBotDecisions />} />
          </Route>
          
          {/* Routes protégées - Étudiant */}
          <Route path="/student" element={
            <PrivateRoute allowedRoles={['ETUDIANT']}>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="absences" element={<MyAbsences />} />
            <Route path="grades" element={<MyGrades />} />
            <Route path="calendar" element={<MyCalendar />} />
          </Route>
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;