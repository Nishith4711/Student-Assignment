import React, { useState } from 'react'
import { Plus, Calendar, Award, FileText, Save, X } from 'lucide-react'
import { assignmentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AssignAssignment = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        maxPoints: '',
        dueDate: '',
        instructions: '',
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        maxFileSize: 10485760 // 10MB in bytes
    })
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const fileTypeOptions = [
        { value: 'pdf', label: 'PDF' },
        { value: 'doc', label: 'DOC' },
        { value: 'docx', label: 'DOCX' },
        { value: 'txt', label: 'TXT' },
        { value: 'zip', label: 'ZIP' },
        { value: 'rar', label: 'RAR' }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFileTypeChange = (fileType) => {
        setFormData(prev => ({
            ...prev,
            allowedFileTypes: prev.allowedFileTypes.includes(fileType)
                ? prev.allowedFileTypes.filter(type => type !== fileType)
                : [...prev.allowedFileTypes, fileType]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('Assignment title is required')
            return
        }

        if (!formData.description.trim()) {
            toast.error('Assignment description is required')
            return
        }

        if (!formData.subject.trim()) {
            toast.error('Subject is required')
            return
        }

        if (!formData.maxPoints || formData.maxPoints <= 0) {
            toast.error('Max points must be greater than 0')
            return
        }

        if (!formData.dueDate) {
            toast.error('Due date is required')
            return
        }

        // Check if due date is in the future
        const dueDate = new Date(formData.dueDate)
        const now = new Date()
        if (dueDate <= now) {
            toast.error('Due date must be in the future')
            return
        }

        if (formData.allowedFileTypes.length === 0) {
            toast.error('At least one file type must be allowed')
            return
        }

        setLoading(true)

        try {
            const assignmentData = {
                ...formData,
                maxPoints: parseInt(formData.maxPoints),
                dueDate: new Date(formData.dueDate).toISOString()
            }

            await assignmentsAPI.create(assignmentData)

            setShowSuccess(true)
            toast.success('Assignment created successfully!')

            // Reset form after success
            setTimeout(() => {
                setShowSuccess(false)
                setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    maxPoints: '',
                    dueDate: '',
                    instructions: '',
                    allowedFileTypes: ['pdf', 'doc', 'docx'],
                    maxFileSize: 10485760
                })
            }, 3000)

        } catch (error) {
            console.error('Error creating assignment:', error)
            const errorMessage = error.response?.data?.message || 'Failed to create assignment'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const clearForm = () => {
        setFormData({
            title: '',
            description: '',
            subject: '',
            maxPoints: '',
            dueDate: '',
            instructions: '',
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            maxFileSize: 10485760
        })
        toast.success('Form cleared')
    }

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    if (showSuccess) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="card bg-green-50 border-green-200 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-green-100 rounded-full p-3">
                            <Plus className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-green-900 mb-2">Assignment Created Successfully!</h2>
                    <p className="text-green-700 mb-4">The assignment has been created and is now available to students.</p>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Assignment Details:</h3>
                        <div className="text-left space-y-1 text-sm text-gray-700">
                            <p><span className="font-medium">Title:</span> {formData.title}</p>
                            <p><span className="font-medium">Subject:</span> {formData.subject}</p>
                            <p><span className="font-medium">Max Points:</span> {formData.maxPoints}</p>
                            <p><span className="font-medium">Due Date:</span> {new Date(formData.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="animate-pulse text-green-600">Redirecting in 3 seconds...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Assign New Assignment</h1>
                <p className="text-gray-600">Create a new assignment for students to complete</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Assignment Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter assignment title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Mathematics, Computer Science"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="input-field"
                            placeholder="Provide a detailed description of the assignment"
                            required
                        />
                    </div>
                </div>

                {/* Assignment Details */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="maxPoints" className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Points *
                            </label>
                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    id="maxPoints"
                                    name="maxPoints"
                                    value={formData.maxPoints}
                                    onChange={handleChange}
                                    min="1"
                                    max="1000"
                                    className="input-field pl-10"
                                    placeholder="100"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="datetime-local"
                                    id="dueDate"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Instructions (Optional)
                        </label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            rows={3}
                            className="input-field"
                            placeholder="Any additional instructions or requirements for students"
                        />
                    </div>
                </div>

                {/* File Requirements */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">File Requirements</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Allowed File Types *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {fileTypeOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${formData.allowedFileTypes.includes(option.value)
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.allowedFileTypes.includes(option.value)}
                                        onChange={() => handleFileTypeChange(option.value)}
                                        className="sr-only"
                                    />
                                    <FileText className="h-5 w-5 text-gray-600 mr-2" />
                                    <span className="font-medium text-gray-900">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum File Size
                        </label>
                        <select
                            id="maxFileSize"
                            name="maxFileSize"
                            value={formData.maxFileSize}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value={5242880}>5 MB</option>
                            <option value={10485760}>10 MB</option>
                            <option value={20971520}>20 MB</option>
                            <option value={52428800}>50 MB</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={clearForm}
                        className="btn-secondary"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear Form
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Assignment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AssignAssignment