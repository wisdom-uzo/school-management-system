'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaBook,
  FaChartBar
} from 'react-icons/fa';
import StudentLayout from '@/app/components/student/StudentLayout';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore/lite';
import { getToken, verifyToken } from '@/config/Authentication';

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = await getToken();
        console.log('Token in dashboard:', token);
    
        if (!token) {
          throw new Error('No authentication token found');
        }
    
        console.log('About to verify token');
        const decodedToken = await verifyToken(token);
        console.log('Decoded token:', decodedToken);
    
        if (!decodedToken) {
          throw new Error('Invalid authentication token');
        }
    
        if (!decodedToken.id) {
          console.error('Decoded token does not contain id:', decodedToken);
          throw new Error('Token missing student id');
        }
    
        const studentId = decodedToken.id;
        const studentRef = doc(db, 'students', studentId);
        const studentSnap = await getDoc(studentRef);
    
        if (!studentSnap.exists()) {
          throw new Error('Student data not found');
        }
    
        setStudentData({ id: studentSnap.id, ...studentSnap.data() });
      } catch (err) {
        console.error('Error in fetchStudentData:', err);
        setError(err.message);
        if (err.message.includes('authentication token') || err.message.includes('Token missing student id')) {
          router.push('/login/student');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, []);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="text-red-500 text-center">{error}</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome, {studentData.firstName}!</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Student Photo */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={studentData.photoUrl || '/default-photo.png'} 
                alt={`${studentData.firstName} ${studentData.surname}`} 
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  <span className="font-medium">Name:</span> {studentData.firstName} {studentData.middleName} {studentData.surname}
                </p>
                <p className="flex items-center">
                  <FaEnvelope className="mr-2 text-blue-500" />
                  <span className="font-medium">Email:</span> {studentData.email}
                </p>
                <p className="flex items-center">
                  <FaGraduationCap className="mr-2 text-blue-500" />
                  <span className="font-medium">Matric Number:</span> {studentData.matricNumber}
                </p>
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Academic Information</h2>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-center">
                  <FaBook className="mr-2 text-green-500" />
                  <span className="font-medium">Department:</span> {studentData.department}
                </p>
                <p className="flex items-center">
                  <FaGraduationCap className="mr-2 text-green-500" />
                  <span className="font-medium">Level:</span> {studentData.level}
                </p>
                <p className="flex items-center">
                  <FaChartBar className="mr-2 text-green-500" />
                  <span className="font-medium">CGPA:</span> {studentData.cgpa || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links or Recent Activities */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/student/courses')} 
              className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition duration-300"
            >
              View Courses
            </button>
            <button 
              onClick={() => router.push('/student/grades')} 
              className="bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition duration-300"
            >
              Check Grades
            </button>
            <button 
              onClick={() => router.push('/student/schedule')} 
              className="bg-purple-600 text-white rounded-lg p-4 hover:bg-purple-700 transition duration-300"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
