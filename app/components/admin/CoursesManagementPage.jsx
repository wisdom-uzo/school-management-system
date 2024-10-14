'use client'
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid,
  Chip, IconButton, Tooltip, CircularProgress, Snackbar, Alert,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore/lite';
import AdminLayout from './AdminLayout';

const CoursesManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [newCourse, setNewCourse] = useState({
    code: '',
    title: '',
    unit: '',
    status: '',
    department: '',
    level: '',
    semester: '',
    academicYearId: '',
    description: '',
    prerequisites: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch courses
      const coursesCollection = collection(db, 'courses');
      const coursesQuery = query(coursesCollection, orderBy('createdAt', 'desc'));
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesList);

      // Fetch departments
      const departmentsCollection = collection(db, 'departments');
      const departmentsSnapshot = await getDocs(departmentsCollection);
      const departmentsList = departmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDepartments(departmentsList);

      // Fetch academic years
      const yearsCollection = collection(db, 'academic_years');
      const yearsSnapshot = await getDocs(yearsCollection);
      const yearsList = yearsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAcademicYears(yearsList);
    } catch (error) {
      console.error("Error fetching data: ", error);
      showSnackbar("Failed to fetch data", "error");
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.code = newCourse.code ? "" : "Course code is required.";
    tempErrors.title = newCourse.title ? "" : "Course title is required.";
    tempErrors.unit = newCourse.unit ? "" : "Course unit is required.";
    tempErrors.status = newCourse.status ? "" : "Course status is required.";
    tempErrors.department = newCourse.department ? "" : "Department is required.";
    tempErrors.level = newCourse.level ? "" : "Level is required.";
    tempErrors.semester = newCourse.semester ? "" : "Semester is required.";
    tempErrors.academicYearId = newCourse.academicYearId ? "" : "Academic year is required.";

    // Check if course code is unique
    if (newCourse.code && courses.some(course => course.code === newCourse.code && course.id !== editingCourse?.id)) {
      tempErrors.code = "This course code is already in use.";
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddCourse = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const courseData = {
          ...newCourse,
          createdAt: new Date()
        };
        
        if (editingCourse) {
          const courseRef = doc(db, 'courses', editingCourse.id);
          await updateDoc(courseRef, courseData);
          showSnackbar("Course updated successfully", "success");
        } else {
          await addDoc(collection(db, 'courses'), courseData);
          showSnackbar("New course added successfully", "success");
        }
        setNewCourse({
          code: '',
          title: '',
          unit: '',
          status: '',
          department: '',
          level: '',
          semester: '',
          academicYearId: '',
          description: '',
          prerequisites: []
        });
        setOpenDialog(false);
        setEditingCourse(null);
        await fetchData(); // Refresh the list
      } catch (error) {
        console.error("Error adding/updating course: ", error);
        showSnackbar("Failed to save course", "error");
      }
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    setConfirmDialog({
      open: true,
      title: "Delete Course",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteDoc(doc(db, 'courses', id));
          await fetchData(); // Refresh the list
          showSnackbar("Course deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting course: ", error);
          showSnackbar("Failed to delete course", "error");
        }
        setIsLoading(false);
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({ ...course });
    setOpenDialog(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredCourses = courses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" className='text-black' gutterBottom>
          Courses Management
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingCourse(null);
                setNewCourse({
                  code: '',
                  title: '',
                  unit: '',
                  status: '',
                  department: '',
                  level: '',
                  semester: '',
                  academicYearId: '',
                  description: '',
                  prerequisites: []
                });
                setErrors({});
                setOpenDialog(true);
              }}
            >
              Add New Course
            </Button>
          </Grid>
        </Grid>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.unit}</TableCell>
                    <TableCell>
                      <Chip 
                        label={course.status} 
                        color={course.status === 'Core' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>{course.level}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{academicYears.find(y => y.id === course.academicYearId)?.session}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditCourse(course)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteCourse(course.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Course Code"
                  fullWidth
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  error={!!errors.code}
                  helperText={errors.code}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Course Title"
                  fullWidth
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  error={!!errors.title}
                  helperText={errors.title}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Course Unit"
                  fullWidth
                  type="number"
                  value={newCourse.unit}
                  onChange={(e) => setNewCourse({ ...newCourse, unit: e.target.value })}
                  error={!!errors.unit}
                  helperText={errors.unit}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" error={!!errors.status}>
                  <InputLabel>Course Status</InputLabel>
                  <Select
                    value={newCourse.status}
                    label="Course Status"
                    onChange={(e) => setNewCourse({ ...newCourse, status: e.target.value })}
                  >
                    <MenuItem value="Core">Core</MenuItem>
                    <MenuItem value="Elective">Elective</MenuItem>
                  </Select>
                  {errors.status && <Typography color="error">{errors.status}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" error={!!errors.department}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={newCourse.department}
                    label="Department"
                    onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                  >
                    {departments.map(dept => (
                      <MenuItem value={dept.name} key={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.department && <Typography color="error">{errors.department}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" error={!!errors.level}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={newCourse.level}
                    label="Level"
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                  >
                    <MenuItem value="ND1">ND1</MenuItem>
                    <MenuItem value="ND2">ND2</MenuItem>
                    <MenuItem value="HND1">HND1</MenuItem>
                    <MenuItem value="HND2">HND2</MenuItem>
                  </Select>
                  {errors.level && <Typography color="error">{errors.level}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" error={!!errors.semester}>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={newCourse.semester}
                    label="Semester"
                    onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                  >
                    <MenuItem value="1">First Semester</MenuItem>
                    <MenuItem value="2">Second Semester</MenuItem>
                  </Select>
                  {errors.semester && <Typography color="error">{errors.semester}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" error={!!errors.academicYearId}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={newCourse.academicYearId}
                    label="Academic Year"
                    onChange={(e) => setNewCourse({ ...newCourse, academicYearId: e.target.value })}
                  >
                    {academicYears.map(year => (
                        <MenuItem value={year.id} key={year.id}>{year.session}</MenuItem>
                      ))}
                    </Select>
                    {errors.academicYearId && <Typography color="error">{errors.academicYearId}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="dense"
                    label="Course Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Prerequisites</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth>
                        <InputLabel>Prerequisites</InputLabel>
                        <Select
                          multiple
                          value={newCourse.prerequisites}
                          onChange={(e) => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={courses.find(course => course.id === value)?.code} />
                              ))}
                            </Box>
                          )}
                        >
                          {courses.filter(course => course.id !== editingCourse?.id).map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                              {course.code} - {course.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCourse} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : (editingCourse ? 'Update' : 'Add')}
              </Button>
            </DialogActions>
          </Dialog>
  
          <Dialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{confirmDialog.title}</DialogTitle>
            <DialogContent>
              <Typography id="alert-dialog-description">{confirmDialog.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
              <Button onClick={confirmDialog.onConfirm} color="error" autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
  
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </AdminLayout>
    );
  };
  
  export default CoursesManagementPage;