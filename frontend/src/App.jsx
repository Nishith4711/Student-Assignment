import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/Dashboard'
import StudentAssignments from './pages/student/Assignments'
import StudentGrades from './pages/student/Grades'
import StudentUpload from './pages/student/Upload'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherReview from './pages/teacher/Review'
import TeacherLateSubmissions from './pages/teacher/LateSubmissions'
import TeacherGrades from './pages/teacher/Grades'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        {user.role === 'student' ? (
          <>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/assignments" element={<StudentAssignments />} />
            <Route path="/grades" element={<StudentGrades />} />
            <Route path="/upload" element={<StudentUpload />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<TeacherDashboard />} />
            <Route path="/review" element={<TeacherReview />} />
            <Route path="/late-submissions" element={<TeacherLateSubmissions />} />
            <Route path="/grades" element={<TeacherGrades />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  )
}

export default App