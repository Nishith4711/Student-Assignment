import React, { useState, useEffect } from 'react'
import { Award, Calendar, FileText } from 'lucide-react'
import { gradesAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const StudentGrades = () => {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await gradesAPI.getMyGrades()
      setGrades(response.data)
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallGPA = () => {
    if (grades.length === 0) return 0
    const totalPercentage = grades.reduce((sum, grade) => {
      return sum + (grade.points / grade.assignment.maxPoints * 100)
    }, 0)
    return (totalPercentage / grades.length).toFixed(1)
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
        <p className="text-gray-600">View your assignment grades and overall performance</p>
      </div>

      {/* Overall GPA Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Overall Performance</h2>
            <p className="text-gray-600">Based on {grades.length} graded assignments</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{calculateOverallGPA()}%</div>
            <div className="text-lg font-medium text-gray-700">
              Grade: {getGradeLetter(calculateOverallGPA())}
            </div>
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="space-y-4">
        {grades.map((grade) => {
          const percentage = Math.round((grade.points / grade.assignment.maxPoints) * 100)
          
          return (
            <div key={grade._id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {grade.assignment.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{grade.assignment.subject}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Graded: {new Date(grade.gradedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {grade.feedback && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Feedback:</h4>
                      <p className="text-gray-700 text-sm">{grade.feedback}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-6">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900">
                      {grade.points}/{grade.assignment.maxPoints}
                    </span>
                  </div>
                  <div className={`text-lg font-semibold ${getGradeColor(percentage)}`}>
                    {percentage}% ({getGradeLetter(percentage)})
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {grades.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grades available</h3>
          <p className="text-gray-600">Your grades will appear here once assignments are graded.</p>
        </div>
      )}
    </div>
  )
}

export default StudentGrades