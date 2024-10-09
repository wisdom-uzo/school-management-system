// 'use client'
// import React, { useState, useEffect } from 'react';
// import {
//   Box, Grid, Paper, Typography, CircularProgress, Table, TableBody, 
//   TableCell, TableContainer, TableHead, TableRow, Card, CardContent,
//   CardHeader, Avatar, List, ListItem, ListItemText, Divider,
//   Chip, Button
// } from '@mui/material';
// import { 
//   School as SchoolIcon, 
//   Class as ClassIcon, 
//   Assessment as AssessmentIcon,
//   CalendarToday as CalendarIcon,
//   Announcement as AnnouncementIcon
// } from '@mui/icons-material';
// import { db, auth } from '@/config/firebase';
// import { collection, query, where, getDocs } from 'firebase/firestore/lite';

// const StudentDashboard = () => {
//   const [studentData, setStudentData] = useState(null);
//   const [courses, setCourses] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchStudentData = async () => {
//       setIsLoading(true);
//       try {
//         const user = auth.currentUser;
//         if (user) {
//           // Fetch student data
//           const studentQuery = query(collection(db, 'students'), where('userId', '==', user.uid));
//           const studentSnapshot = await getDocs(studentQuery);
//           if (!studentSnapshot.empty) {
//             const studentDoc = studentSnapshot.docs[0];
//             setStudentData({ id: studentDoc.id, ...studentDoc.data() });

//             // Fetch courses for the student
//             const coursesQuery = query(collection(db, 'enrollments'), where('studentId', '==', studentDoc.id));
//             const coursesSnapshot = await getDocs(coursesQuery);
//             const coursesData = await Promise.all(coursesSnapshot.docs.map(async (doc) => {
//               const courseRef = await getDocs(query(collection(db, 'courses'), where('id', '==', doc.data().courseId)));
//               return { id: doc.id, ...courseRef.docs[0].data() };
//             }));
//             setCourses(coursesData);

//             // Fetch announcements
//             const announcementsQuery = query(collection(db, 'announcements'), where('department', '==', studentDoc.data().department));
//             const announcementsSnapshot = await getDocs(announcementsQuery);
//             setAnnouncements(announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching student data:", error);
//       }
//       setIsLoading(false);
//     };

//     fetchStudentData();
//   }, []);

//   if (isLoading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!studentData) {
//     return (
//       <Box p={3}>
//         <Typography variant="h5">No student data found. Please contact the administrator.</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box p={3}>
//       <Grid container spacing={3}>
//         {/* Student Information Card */}
//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardHeader
//               avatar={
//                 <Avatar sx={{ bgcolor: 'primary.main' }}>
//                   <SchoolIcon />
//                 </Avatar>
//               }
//               title={<Typography variant="h5">{studentData.name}</Typography>}
//               subheader={`ID: ${studentData.studentId}`}
//             />
//             <CardContent>
//               <Typography variant="body1">Department: {studentData.department}</Typography>
//               <Typography variant="body1">Level: {studentData.level}</Typography>
//               <Typography variant="body1">CGPA: {studentData.cgpa || 'N/A'}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Current Courses */}
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ p: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               <ClassIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//               Current Courses
//             </Typography>
//             <TableContainer>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Course Code</TableCell>
//                     <TableCell>Course Title</TableCell>
//                     <TableCell>Credits</TableCell>
//                     <TableCell>Status</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {courses.map((course) => (
//                     <TableRow key={course.id}>
//                       <TableCell>{course.code}</TableCell>
//                       <TableCell>{course.title}</TableCell>
//                       <TableCell>{course.unit}</TableCell>
//                       <TableCell>
//                         <Chip 
//                           label={course.status} 
//                           color={course.status === 'Core' ? 'primary' : 'secondary'} 
//                           size="small" 
//                         />
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Paper>
//         </Grid>

//         {/* Academic Calendar */}
//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//               Academic Calendar
//             </Typography>
//             <List>
//               <ListItem>
//                 <ListItemText primary="Current Semester" secondary="First Semester 2023/2024" />
//               </ListItem>
//               <Divider />
//               <ListItem>
//                 <ListItemText primary="Exam Period" secondary="August 15 - September 2, 2023" />
//               </ListItem>
//               <Divider />
//               <ListItem>
//                 <ListItemText primary="Next Semester Start" secondary="October 1, 2023" />
//               </ListItem>
//             </List>
//           </Paper>
//         </Grid>

//         {/* Announcements */}
//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               <AnnouncementIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//               Announcements
//             </Typography>
//             <List>
//               {announcements.map((announcement) => (
//                 <React.Fragment key={announcement.id}>
//                   <ListItem>
//                     <ListItemText 
//                       primary={announcement.title} 
//                       secondary={
//                         <>
//                           <Typography component="span" variant="body2" color="text.primary">
//                             {new Date(announcement.date.seconds * 1000).toLocaleDateString()}
//                           </Typography>
//                           {" — "}{announcement.content}
//                         </>
//                       }
//                     />
//                   </ListItem>
//                   <Divider />
//                 </React.Fragment>
//               ))}
//             </List>
//           </Paper>
//         </Grid>

//         {/* Quick Links */}
//         <Grid item xs={12}>
//           <Paper sx={{ p: 2 }}>
//             <Typography variant="h6" gutterBottom>Quick Links</Typography>
//             <Box display="flex" justifyContent="space-around" flexWrap="wrap">
//               <Button startIcon={<AssessmentIcon />}>View Grades</Button>
//               <Button startIcon={<CalendarIcon />}>Full Calendar</Button>
//               <Button startIcon={<SchoolIcon />}>Course Registration</Button>
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default StudentDashboard;


import React from 'react'

export const page = () => {
  return (
    <div>page</div>
  )
}
