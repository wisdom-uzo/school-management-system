'use client'


import { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  CogIcon, 
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/config/Authentication';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
    { name: 'Courses', href: '/student/courses', icon: BookOpenIcon },
    { name: 'Schedule', href: '/student/schedule', icon: CalendarIcon },
    { name: 'Grades', href: '/student/grades', icon: ClipboardDocumentListIcon },
    { name: 'Settings', href: '/student/settings', icon: CogIcon },
  ];

  const handleLogout = () => {
    removeToken();
    router.push('/login/student');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={`flex flex-col h-full bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isMobile ? 'absolute z-10' : 'relative'}`}
    >
      <div className={`p-5 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
        {!isCollapsed && <h2 className="text-2xl font-semibold">Student Portal</h2>}
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-700">
          {isCollapsed ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}
                    className={`flex items-center px-5 py-3 text-sm ${
                      pathname === item.href 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-400 hover:bg-gray-700'
                    } ${isCollapsed ? 'justify-center' : ''}`}>
                <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`p-5 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={handleLogout}
          className="flex items-center text-sm text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-md transition-colors duration-200"
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;