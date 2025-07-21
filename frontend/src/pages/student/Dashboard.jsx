import React, { useState, useEffect } from 'react'
import { FileText, Clock, Award, AlertCircle, Calendar } from 'lucide-react'
import { assignmentsAPI, submissionsAPI, gradesAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    submittedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  })
  const [recentAssignments, setRecentAssignments] = useState([])
  const [recentGrades, setRecentGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [assignmentsRes, submissionsRes, gradesRes] = await Promise.all([
        assignmentsAPI.getStudentAssignments(),
        submissionsAPI.getMySubmissions(),
        gradesAPI.getMyGrades()
      ])

      const assignments = assignmentsRes.data
      const submissions = submissionsRes.data
      const grades = gradesRes.data

      // Calculate stats
      const totalAssignments = assignments.length
      const submittedAssignments = assignments.filter(a => a.submission).length
      const pendingAssignments = assignments.filter(a => !a.submission && new Date() <= new Date(a.dueDate)).length
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum, grade) => sum + (grade.points / grade.assignment.maxPoints * 100), 0) / grades.length
        : 0

      setStats({
        totalAssignments,
        submittedAssignments,
        pendingAssignments,
        averageGrade: Math.round(averageGrade)
      })

      // Get recent assignments (upcoming due dates)
      const upcomingAssignments = assignments
        .filter(a => !a.submission && new Date() <= new Date(a.dueDate))
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)

      setRecentAssignments(upcomingAssignments)

      // Get recent grades
      setRecentGrades(grades.slice(0, 5))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your academic overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              <p className="text-gray-600">Total Assignments</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.submittedAssignments}</p>
              <p className="text-gray-600">Submitted</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</p>
              <p className="text-gray-600">Average Grade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
          {recentAssignments.length > 0 ? (
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">{assignment.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-500">{assignment.maxPoints} pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming assignments</p>
          )}
        </div>

        {/* Recent Grades */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Grades</h2>
          {recentGrades.length > 0 ? (
            <div className="space-y-3">
              {recentGrades.map((grade) => (
                <div key={grade._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{grade.assignment.title}</h3>
                    <p className="text-sm text-gray-600">{grade.assignment.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {grade.points}/{grade.assignment.maxPoints}
                    </div>
                    <p className="text-sm text-gray-500">
                      {Math.round((grade.points / grade.assignment.maxPoints) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No grades available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard