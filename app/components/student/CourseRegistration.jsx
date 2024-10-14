'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/app/components/student/StudentLayout';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore/lite';
import { getToken, verifyToken } from '@/config/Authentication';
import { 
  Box, Typography, Paper, Checkbox, Button, 
  CircularProgress, Alert, Divider, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Tooltip, IconButton
} from '@mui/material';
import { Print as PrintIcon, Edit as EditIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';

export default function CourseRegistration() {
  const [studentData, setStudentData] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUnits, setTotalUnits] = useState(0);
  const [coreUnits, setCoreUnits] = useState(0);
  const [electiveUnits, setElectiveUnits] = useState(0);
  const router = useRouter();
  const printRef = useRef();

  const MAX_UNITS = 24; // Maximum allowed units

  useEffect(() => {
    fetchStudentDataAndCourses();
  }, []);

  useEffect(() => {
    calculateUnitSummary();
  }, [selectedCourses, availableCourses]);

  const fetchStudentDataAndCourses = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const decodedToken = await verifyToken(token);
      if (!decodedToken || !decodedToken.id) {
        throw new Error('Invalid authentication token');
      }

      // Fetch student data
      const studentId = decodedToken.id;
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        throw new Error('Student data not found');
      }

      const student = { id: studentSnap.id, ...studentSnap.data() };
      setStudentData(student);

      // Fetch active semester
      const academicYearRef = doc(db, 'academic_years', student.academicYearId);
      const academicYearSnap = await getDoc(academicYearRef);
      if (!academicYearSnap.exists()) {
        throw new Error('Academic year data not found');
      }
      const academicYearData = academicYearSnap.data();
      const activeSem = academicYearData.ndActiveSemester || academicYearData.hndActiveSemester;
      setActiveSemester(activeSem);

      // Fetch available courses
      const coursesQuery = query(
        collection(db, 'courses'),
        where('department', '==', student.department),
        where('level', '==', student.level),
        where('academicYearId', '==', student.academicYearId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableCourses(courses);

      // Fetch current registration
      const registrationsQuery = query(
        collection(db, 'courseRegistrations'),
        where('studentId', '==', studentId),
        where('academicYearId', '==', student.academicYearId),
        where('semester', '==', activeSem)
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);
      if (!registrationsSnapshot.empty) {
        const registration = registrationsSnapshot.docs[0];
        setCurrentRegistration({ id: registration.id, ...registration.data() });
        setSelectedCourses(registration.data().courses);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelection = (courseId) => {
    const course = availableCourses.find(c => c.id === courseId);
    const newSelectedCourses = selectedCourses.includes(courseId)
      ? selectedCourses.filter(id => id !== courseId)
      : [...selectedCourses, courseId];
    
    const newTotalUnits = newSelectedCourses.reduce((total, id) => {
      const course = availableCourses.find(c => c.id === id);
      return total + (course ? parseInt(course.unit) : 0);
    }, 0);

    if (newTotalUnits <= MAX_UNITS) {
      setSelectedCourses(newSelectedCourses);
    } else {
      alert(`Cannot add course. Maximum of ${MAX_UNITS} units allowed.`);
    }
  };

  const handleSubmitRegistration = async () => {
    setConfirmDialogAction(() => async () => {
      try {
        if (selectedCourses.length === 0) {
          throw new Error('Please select at least one course');
        }

        const registrationData = {
          studentId: studentData.id,
          courses: selectedCourses,
          semester: activeSemester,
          academicYearId: studentData.academicYearId,
          registrationDate: new Date()
        };

        if (currentRegistration) {
          // Update existing registration
          await updateDoc(doc(db, 'courseRegistrations', currentRegistration.id), registrationData);
        } else {
          // Create new registration
          await addDoc(collection(db, 'courseRegistrations'), registrationData);
        }

        alert('Course registration successful!');
        fetchStudentDataAndCourses(); // Refresh the data
      } catch (error) {
        console.error('Registration error:', error);
        setError(error.message);
      }
    });
    setConfirmDialogOpen(true);
  };

  const handleEditRegistration = () => {
    setConfirmDialogAction(() => () => {
      setCurrentRegistration(null);
      setSelectedCourses([]);
    });
    setConfirmDialogOpen(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printableArea');
    const originalContents = document.body.innerHTML;
  
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
  };

  const calculateUnitSummary = () => {
    let total = 0;
    let core = 0;
    let elective = 0;

    selectedCourses.forEach(courseId => {
      const course = availableCourses.find(c => c.id === courseId);
      if (course) {
        const units = parseInt(course.unit);
        total += units;
        if (course.status === 'Core') {
          core += units;
        } else {
          elective += units;
        }
      }
    });

    setTotalUnits(total);
    setCoreUnits(core);
    setElectiveUnits(elective);
  };

  const filteredCourses = availableCourses.filter(course =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Alert severity="error">{error}</Alert>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Box id="printableArea" p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Course Registration</Typography>
          <Box>
            {currentRegistration && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditRegistration}
                sx={{ mr: 2 }}
              >
                Edit Registration
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print Registration
            </Button>
          </Box>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Student Information</Typography>
          <Typography>Name: {studentData.firstName} {studentData.surname}</Typography>
          <Typography>Department: {studentData.department}</Typography>
          <Typography>Level: {studentData.level}</Typography>
          <Typography>Semester: {activeSemester}</Typography>
        </Paper>

        <Box mb={2}>
          <Typography variant="h6" gutterBottom>Course Summary</Typography>
          <Typography>Total Units: {totalUnits}/{MAX_UNITS}</Typography>
          <Typography>Core Units: {coreUnits}</Typography>
          <Typography>Elective Units: {electiveUnits}</Typography>
        </Box>

        <TextField
          fullWidth
          label="Search Courses"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography variant="h5" gutterBottom>Available Courses</Typography>
        {filteredCourses.length === 0 ? (
          <Alert severity="info">No courses available for registration.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S/N</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Title</TableCell>
                  <TableCell>Course Unit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Select</TableCell>
                  <TableCell>Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course, index) => (
                  <TableRow key={course.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.unit}</TableCell>
                    <TableCell>
                      <Chip 
                        label={course.status} 
                        color={course.status === 'Core' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseSelection(course.id)}
                        disabled={currentRegistration !== null}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={course.description || 'No description available'}>
                        <IconButton size="small">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitRegistration}
            disabled={selectedCourses.length === 0 || currentRegistration !== null}
          >
            Submit Registration
          </Button>
        </Box>
      </Box>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to proceed with this action?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            confirmDialogAction();
            setConfirmDialogOpen(false);
          }} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </StudentLayout>
  );
}