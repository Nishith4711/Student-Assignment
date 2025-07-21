import { Assignment, User, Comment } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  role: 'student'
};

export const mockInstructor: User = {
  id: '2',
  name: 'Dr. Sarah Wilson',
  email: 'sarah.wilson@university.edu',
  role: 'instructor'
};

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Introduction to React Components',
    description: 'Create a basic React application demonstrating component composition, props, and state management.',
    dueDate: '2025-01-20',
    subject: 'Web Development',
    maxPoints: 100,
    status: 'submitted',
    submittedAt: '2025-01-18T14:30:00Z',
    grade: 95,
    feedback: 'Excellent work! Your component structure is clean and well-organized. Consider adding PropTypes for better type checking.',
    fileName: 'react-components-project.zip',
    fileSize: '2.3 MB'
  },
  {
    id: '2',
    title: 'Database Design Project',
    description: 'Design a normalized database schema for an e-commerce platform with proper relationships and constraints.',
    dueDate: '2025-01-25',
    subject: 'Database Systems',
    maxPoints: 150,
    status: 'submitted',
    submittedAt: '2025-01-24T16:45:00Z',
    fileName: 'ecommerce-db-schema.sql',
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    title: 'Algorithm Analysis Report',
    description: 'Analyze the time and space complexity of sorting algorithms and provide performance comparisons.',
    dueDate: '2025-01-30',
    subject: 'Algorithms',
    maxPoints: 120,
    status: 'draft'
  },
  {
    id: '4',
    title: 'Mobile App Prototype',
    description: 'Design and prototype a mobile application addressing a real-world problem using modern UI/UX principles.',
    dueDate: '2025-01-15',
    subject: 'Mobile Development',
    maxPoints: 200,
    status: 'overdue'
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    assignmentId: '1',
    author: 'Dr. Sarah Wilson',
    content: 'Great use of functional components! Your code is very readable.',
    timestamp: '2025-01-19T10:15:00Z',
    type: 'feedback'
  },
  {
    id: '2',
    assignmentId: '1',
    author: 'Alex Johnson',
    content: 'Thank you for the feedback! Should I refactor the state management?',
    timestamp: '2025-01-19T14:20:00Z',
    type: 'question'
  }
];