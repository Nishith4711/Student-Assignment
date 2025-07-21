export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  maxPoints: number;
  status: 'draft' | 'submitted' | 'graded' | 'overdue';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  fileName?: string;
  fileSize?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  avatar?: string;
}

export interface Comment {
  id: string;
  assignmentId: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'feedback' | 'question' | 'note';
}