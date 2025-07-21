import React, { useState } from 'react';
import Navigation from './components/Navigation';
import StudentDashboard from './components/StudentDashboard';
import SubmitAssignment from './components/SubmitAssignment';
import InstructorDashboard from './components/InstructorDashboard';
import { mockUser, mockInstructor, mockAssignments, mockComments } from './data/mockData';

function App() {
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [activeView, setActiveView] = useState('assignments');

  const handleRoleSwitch = () => {
    setCurrentUser(currentUser.role === 'student' ? mockInstructor : mockUser);
    setActiveView('assignments');
  };

  const renderContent = () => {
    if (currentUser.role === 'student') {
      switch (activeView) {
        case 'submit':
          return <SubmitAssignment />;
        case 'assignments':
        default:
          return <StudentDashboard assignments={mockAssignments} comments={mockComments} />;
      }
    } else {
      switch (activeView) {
        case 'review':
          return <InstructorDashboard assignments={mockAssignments} comments={mockComments} />;
        case 'assignments':
        default:
          return <InstructorDashboard assignments={mockAssignments} comments={mockComments} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {renderContent()}
    </div>
  );
}

export default App;