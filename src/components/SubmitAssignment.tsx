import React, { useState } from 'react';
import { Upload, FileText, Calendar, Award, CheckCircle } from 'lucide-react';

const SubmitAssignment: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availableAssignments = [
    { id: '3', title: 'Algorithm Analysis Report', dueDate: '2025-01-30', points: 120 },
    { id: '4', title: 'Mobile App Prototype', dueDate: '2025-01-15', points: 200, overdue: true }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedAssignment) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Reset form after success message
      setTimeout(() => {
        setSubmitted(false);
        setSelectedFile(null);
        setSelectedAssignment('');
        setComments('');
      }, 3000);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Assignment Submitted Successfully!</h2>
          <p className="text-green-700">Your assignment has been submitted and is now under review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
        <p className="text-gray-600">Upload your completed assignment for review</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Assignment Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Assignment</h2>
          <div className="space-y-3">
            {availableAssignments.map((assignment) => (
              <label
                key={assignment.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAssignment === assignment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${assignment.overdue ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <input
                  type="radio"
                  name="assignment"
                  value={assignment.id}
                  checked={selectedAssignment === assignment.id}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{assignment.points} pts</span>
                      </div>
                    </div>
                  </div>
                  {assignment.overdue && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200"
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setSelectedFile(file);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Drop your file here, or</p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-200">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.zip,.rar,.txt"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, ZIP, RAR, TXT (Max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Comments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Comments (Optional)</h2>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes or comments about your submission..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || !selectedAssignment || isSubmitting}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Assignment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitAssignment;