import React from 'react';
import { User, GraduationCap, FileText, Settings, Bell } from 'lucide-react';
import { User as UserType } from '../types';

interface NavigationProps {
  currentUser: UserType;
  onRoleSwitch: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  onRoleSwitch,
  activeView,
  onViewChange
}) => {
  const studentViews = [
    { id: 'assignments', label: 'My Assignments', icon: FileText },
    { id: 'submit', label: 'Submit Assignment', icon: GraduationCap }
  ];

  const instructorViews = [
    { id: 'review', label: 'Review Dashboard', icon: FileText },
    { id: 'assignments', label: 'All Assignments', icon: GraduationCap }
  ];

  const views = currentUser.role === 'student' ? studentViews : instructorViews;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduReview</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {views.map((view) => {
                const IconComponent = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeView === view.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <Bell className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <Settings className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <button
              onClick={onRoleSwitch}
              className="ml-4 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              Switch to {currentUser.role === 'student' ? 'Instructor' : 'Student'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;