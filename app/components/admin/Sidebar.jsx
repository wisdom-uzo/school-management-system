'use clinet'
import React, { useState } from 'react';
import { Menu, X, ChevronDown, Users, BookOpen, DollarSign, FileText, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const menuItems = [
    { 
      name: 'User Management', 
      icon: <Users className="w-5 h-5" />,
      subItems: ['student_management', 'Teachers', 'Staff', 'Parents']
    },
    { 
      name: 'Academic Management', 
      icon: <BookOpen className="w-5 h-5" />,
      subItems: ['Courses_Management', 'Classes_Management', 'Attendance_Management', 'Grades_Management', 'Department_Management']
    },
    { 
      name: 'Financial Management', 
      icon: <DollarSign className="w-5 h-5" />,
      subItems: ['Fees', 'Expenses', 'Payroll']
    },
    { 
      name: 'Reports', 
      icon: <FileText className="w-5 h-5" />,
      subItems: ['Academic', 'Attendance', 'Financial']
    },
    { 
      name: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      subItems: ['System', 'Notifications', 'Backup']
    },
  ];

  return (
    <div className={`bg-gray-800 text-white w-64 min-h-screen ${isOpen ? '' : 'hidden'} md:block`}>
      <div className="p-4">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      </div>
      <nav>
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-gray-700"
              onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === index && (
              <div className="bg-gray-700">
                {item.subItems.map((subItem, subIndex) => (
                  <a key={subIndex} href={subItem} className="block p-4 pl-12 hover:bg-gray-600">
                    {subItem}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};


export default Sidebar