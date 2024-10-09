'use client'
import React, { useState } from 'react';
import { Users, BookOpen, DollarSign, FileText, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();

  const menuItems = [
    { 
      name: 'User Management', 
      icon: <Users className="w-5 h-5" />,
      subItems: [
        { name: 'Student Management', path: '/admin/student_management' },
        { name: 'Teachers', path: '/admin/teachers' },
        { name: 'Staff', path: '/admin/staff' },
        { name: 'Parents', path: '/admin/parents' }
      ]
    },
    { 
      name: 'Academic Management', 
      icon: <BookOpen className="w-5 h-5" />,
      subItems: [
        { name: 'Courses Management', path: '/admin/courses_management' },
        { name: 'Classes Management', path: '/admin/classes_management' },
        { name: 'Department Management', path: '/admin/department_management' },
        { name: 'Academic Calendar Management', path: '/admin/academic_calendar_management' }
      ]
    },
    { 
      name: 'Financial Management', 
      icon: <DollarSign className="w-5 h-5" />,
      subItems: [
        { name: 'Fees', path: '/admin/fees' },
        { name: 'Expenses', path: '/admin/expenses' },
        { name: 'Payroll', path: '/admin/payroll' }
      ]
    },
    { 
      name: 'Reports', 
      icon: <FileText className="w-5 h-5" />,
      subItems: [
        { name: 'Academic', path: '/admin/academic_reports' },
        { name: 'Attendance', path: '/admin/attendance_reports' },
        { name: 'Financial', path: '/admin/financial_reports' }
      ]
    },
    { 
      name: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      subItems: [
        { name: 'System', path: '/admin/system_settings' },
        { name: 'Notifications', path: '/admin/notification_settings' },
        { name: 'Backup', path: '/admin/backup_settings' }
      ]
    },
  ];

  const handleItemClick = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div className={`bg-gray-800 text-white w-64 min-h-screen ${isOpen ? '' : 'hidden'} md:block transition-all duration-300`}>
      <div className="p-4">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      </div>
      <nav>
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-gray-700 transition-colors duration-200"
              onClick={() => handleItemClick(index)}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </div>
              {activeDropdown === index ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className={`bg-gray-700 transition-all duration-300 ${activeDropdown === index ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
              {item.subItems.map((subItem, subIndex) => (
                <Link key={subIndex} href={subItem.path}>
                  <span className={`block p-4 pl-12 hover:bg-gray-600 transition-colors duration-200 cursor-pointer ${pathname === subItem.path ? 'bg-gray-600' : ''}`}>
                    {subItem.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;