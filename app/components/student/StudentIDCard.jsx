'use client'

import React, { useState, useEffect, useRef } from 'react';
import StudentLayout from '@/app/components/student/StudentLayout';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore/lite';
import { getToken, verifyToken } from '@/config/Authentication';
import { Button, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import QRCode from 'qrcode';

const StudentIDCard = () => {
  const [studentData, setStudentData] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [schoolLogo, setSchoolLogo] = useState('/images/school-logo.png');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (studentData) {
      generateQRCode();
    }
  }, [studentData]);

  useEffect(() => {
    if (studentData && photoURL && schoolLogo) {
      generateIDCard();
    }
  }, [studentData, photoURL, schoolLogo]);

  const fetchStudentData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const decodedToken = await verifyToken(token);
      if (!decodedToken || !decodedToken.id) {
        throw new Error('Invalid authentication token');
      }

      const studentId = decodedToken.id;
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        throw new Error('Student data not found');
      }

      const student = { id: studentSnap.id, ...studentSnap.data() };
      setStudentData(student);

      if (student.photoUrl) {
        setPhotoURL(student.photoUrl);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (studentData && qrCanvasRef.current) {
      const qrData = JSON.stringify({
        name: `${studentData.surname}, ${studentData.firstName} ${studentData.middleName}`,
        matricNumber: studentData.matricNumber,
        department: studentData.department,
        level: studentData.level,
      });
      
      try {
        await QRCode.toCanvas(qrCanvasRef.current, qrData, { width: 256, height: 256 });
      } catch (err) {
        console.error("Error generating QR code", err);
      }
    }
  };

  const generateIDCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 1000;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
    gradient.addColorStop(0, '#f3e7e9');
    gradient.addColorStop(1, '#e3eeff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 600);

    // Header
    ctx.fillStyle = '#003366';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1000, 0);
    ctx.lineTo(1000, 100);
    ctx.lineTo(800, 150);
    ctx.lineTo(0, 100);
    ctx.closePath();
    ctx.fill();

    // School Logo
    const logo = new Image();
    logo.onload = () => {
      ctx.drawImage(logo, 20, 10, 80, 80);
      
      // School Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('IGBAJO POLYTECHNIC', 120, 60);
      ctx.font = '18px Arial';
      ctx.fillText('P.M.B. 303, Igbajo, OSUN State, Nigeria (Olivet Centre)', 120, 90);

      // Student Photo
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, 270, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 30, 170, 200, 200);
        ctx.restore();

        // Student Information
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${studentData.surname}, ${studentData.firstName} ${studentData.middleName}`, 250, 180);
        
        ctx.font = '18px Arial';
        const addField = (label, value, y) => {
          ctx.fillStyle = '#555555';
          ctx.fillText(label, 250, y);
          ctx.fillStyle = '#000000';
          ctx.fillText(`: ${value}`, 400, y);
        };

        addField('Matric Number', studentData.matricNumber, 220);
        addField('Department', studentData.department, 250);
        addField('Level', studentData.level, 280);
        addField('Program Type', studentData.programType, 310);
        addField('Gender', studentData.gender, 340);
        addField('Email', studentData.email, 400);
        addField('Phone Number', studentData.phoneNumber, 430);

        // QR Code
        ctx.drawImage(qrCanvasRef.current, 800, 400, 180, 180);

        // Expiration Date
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        ctx.fillStyle = '#003366';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Expires: ${expirationDate.toLocaleDateString()}`, 20, 570);

        // Footer
        ctx.fillStyle = '#003366';
        ctx.fillRect(0, 580, 1000, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('This ID card remains the property of Igbajo Polytechnic and must be surrendered upon request.', 20, 594);
      };
      img.src = photoURL || '/placeholder-avatar.jpg';
    };
    logo.src = schoolLogo;
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Student ID</title>
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100vh; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close()">
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <Typography color="error">{error}</Typography>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Box sx={{ maxWidth: 1000, margin: 'auto', mt: 4 }}>
        <Typography variant="h4" gutterBottom>Student ID Card</Typography>
        <Card>
          <CardContent>
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto' }} />
            <Box mt={2} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print ID Card
              </Button>
            </Box>
            <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
          </CardContent>
        </Card>
      </Box>
    </StudentLayout>
  );
};

export default StudentIDCard;