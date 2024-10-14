'use client'

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, CircularProgress, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, Select, MenuItem, IconButton, Tooltip, Snackbar,
  Alert, TablePagination, TableSortLabel, Checkbox, Accordion,
  AccordionSummary, AccordionDetails, Chip, Card, CardContent,
  CardMedia, Tabs, Tab, AppBar, Toolbar, Avatar, Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { db, storage } from '@/config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy as firestoreOrderBy, limit, writeBatch } from 'firebase/firestore/lite';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';    
import AdminLayout from './AdminLayout';

// Styled components for a cooler look
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(TextField)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    middleName: '',
    surname: '',
    gender: '',
    dob: null,
    email: '',
    phoneNumber: '',
    maritalStatus: '',
    permanentAddress: '',
    department: '',
    academicYearId: '',
    level: '',
    programType: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [orderByField, setOrderByField] = useState('surname');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    academicYear: '',
    level: '',
    searchTerm: '',
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);

  useEffect(() => {
    fetchDepartmentsAndAcademicYears();
    fetchStudents();
  }, [page, rowsPerPage, orderByField, orderDirection, filters]);

  const fetchDepartmentsAndAcademicYears = async () => {
    try {
      const departmentsSnapshot = await getDocs(collection(db, 'departments'));
      const departmentsData = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDepartments(departmentsData);

      const academicYearsSnapshot = await getDocs(collection(db, 'academic_years'));
      const academicYearsData = academicYearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAcademicYears(academicYearsData);
    } catch (error) {
      console.error("Error fetching departments and academic years:", error);
      showSnackbar("Failed to fetch departments and academic years", "error");
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      let studentsQuery = query(
        collection(db, 'students'),
        firestoreOrderBy(orderByField, orderDirection),
        limit(rowsPerPage)
      );

      if (filters.department) {
        studentsQuery = query(studentsQuery, where('department', '==', filters.department));
      }
      if (filters.academicYear) {
        studentsQuery = query(studentsQuery, where('academicYearId', '==', filters.academicYear));
      }
      if (filters.level) {
        studentsQuery = query(studentsQuery, where('level', '==', filters.level));
      }
      if (filters.searchTerm) {
        studentsQuery = query(studentsQuery, where('searchableIndex', 'array-contains', filters.searchTerm.toLowerCase()));
      }

      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);

      const totalSnapshot = await getDocs(collection(db, 'students'));
      setTotalStudents(totalSnapshot.size);
    } catch (error) {
      console.error("Error fetching students:", error);
      showSnackbar("Failed to fetch students", "error");
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (date) => {
    setNewStudent(prev => ({ ...prev, dob: date }));
    setErrors(prev => ({ ...prev, dob: '' }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.firstName = newStudent.firstName ? "" : "First Name is required";
    tempErrors.surname = newStudent.surname ? "" : "Surname is required";
    tempErrors.gender = newStudent.gender ? "" : "Gender is required";
    tempErrors.dob = newStudent.dob ? "" : "Date of Birth is required";
    tempErrors.email = /\S+@\S+\.\S+/.test(newStudent.email) ? "" : "Email is invalid";
    tempErrors.phoneNumber = /^\d{11}$/.test(newStudent.phoneNumber) ? "" : "Phone Number must be 11 digits";
    tempErrors.maritalStatus = newStudent.maritalStatus ? "" : "Marital Status is required";
    tempErrors.permanentAddress = newStudent.permanentAddress ? "" : "Permanent Address is required";
    tempErrors.department = newStudent.department ? "" : "Department is required";
    tempErrors.academicYearId = newStudent.academicYearId ? "" : "Academic Year is required";
    tempErrors.level = newStudent.level ? "" : "Level is required";
    tempErrors.programType = newStudent.programType ? "" : "Program Type is required";

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddStudent = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const matricNumber = generateMatricNumber(newStudent.department, newStudent.academicYearId, newStudent.level);
        const defaultPassword = newStudent.surname.toLowerCase();
        const searchableIndex = [
          newStudent.firstName.toLowerCase(),
          newStudent.middleName.toLowerCase(),
          newStudent.surname.toLowerCase(),
          matricNumber.toLowerCase(),
          newStudent.email.toLowerCase()
        ];
        
        let photoUrl = null;
        if (photoFile) {
          photoUrl = await uploadStudentPhoto(photoFile, matricNumber);
        }
        
        const studentData = { 
          ...newStudent, 
          matricNumber, 
          password: defaultPassword, 
          searchableIndex,
          photoUrl,
        };

        await addDoc(collection(db, 'students'), studentData);
        showSnackbar("Student added successfully", "success");
        setOpenDialog(false);
        fetchStudents();
      } catch (error) {
        console.error("Error adding student:", error);
        showSnackbar(error.message || "Failed to add student", "error");
      }
      setIsLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const studentRef = doc(db, 'students', selectedStudent.id);
        const updatedData = { ...newStudent };
        
        if (photoFile) {
          const photoUrl = await uploadStudentPhoto(photoFile, newStudent.matricNumber);
          updatedData.photoUrl = photoUrl;
        }

        await updateDoc(studentRef, updatedData);
        showSnackbar("Student updated successfully", "success");
        setOpenDialog(false);
        fetchStudents();
      } catch (error) {
        console.error("Error updating student:", error);
        showSnackbar("Failed to update student", "error");
      }
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      showSnackbar("Student deleted successfully", "success");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      showSnackbar("Failed to delete student", "error");
    }
  };

  const generateMatricNumber = (departmentId, academicYearId, level) => {
    const deptCode = departments.find(d => d.id === departmentId)?.code || 'UNK';
    const yearCode = academicYears.find(y => y.id === academicYearId)?.session.slice(-2) || 'XX';
    const levelCode = level.includes('ND') ? 'ND' : 'HND';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${yearCode}/${deptCode}/${levelCode}/${randomNum}`;
  };

  const uploadStudentPhoto = async (file, matricNumber) => {
    const storageRef = ref(storage, `student_photos/${matricNumber}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column) => {
    const isAsc = orderByField === column && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderByField(column);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = students.map((n) => n.id);
      setSelectedStudents(newSelected);
      return;
    }
    setSelectedStudents([]);
  };

  const handleSelectStudent = (id) => {
    const selectedIndex = selectedStudents.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStudents, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStudents.slice(1));
    } else if (selectedIndex === selectedStudents.length - 1) {
      newSelected = newSelected.concat(selectedStudents.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedStudents.slice(0, selectedIndex),
        selectedStudents.slice(selectedIndex + 1),
      );
    }

    setSelectedStudents(newSelected);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
      setIsLoading(true);
      const batch = writeBatch(db);
      selectedStudents.forEach((studentId) => {
        const studentRef = doc(db, 'students', studentId);
        batch.delete(studentRef);
      });

      try {
        await batch.commit();
        showSnackbar(`Successfully deleted ${selectedStudents.length} students`, 'success');
        setSelectedStudents([]);
        fetchStudents();
      } catch (error) {
        console.error("Error performing bulk delete:", error);
        showSnackbar("Failed to delete students", "error");
      }
      setIsLoading(false);
    }
  };

  const handleViewProfile = (student) => {
    setSelectedProfileStudent(student);
    setOpenProfileDialog(true);
  };

  const AdvancedSearchAndFilter = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Advanced Search and Filters</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => handleFilterChange({...filters, department: e.target.value})}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={filters.academicYear}
                onChange={(e) => handleFilterChange({...filters, academicYear: e.target.value})}
                label="Academic Year"
              >
                <MenuItem value="">All Academic Years</MenuItem>
                {academicYears.map(year => (
                  <MenuItem key={year.id} value={year.id}>{year.session}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level}
                onChange={(e) => handleFilterChange({...filters, level: e.target.value})}
                label="Level"
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="ND1">ND1</MenuItem>
                <MenuItem value="ND2">ND2</MenuItem>
                <MenuItem value="HND1">HND1</MenuItem>
                <MenuItem value="HND2">HND2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              onClick={() => handleFilterChange({department: '', academicYear: '', level: '', searchTerm: ''})}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
        <Box mt={2}>
          {Object.entries(filters).map(([key, value]) => 
            value && key !== 'searchTerm' && (
              <Chip 
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => handleFilterChange({...filters, [key]: ''})}
                style={{ margin: '0 4px 4px 0' }}
              />
            )
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const StudentProfileView = ({ student, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
      <Dialog open={openProfileDialog} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5">Student Profile</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={student.photoUrl || '/placeholder-avatar.jpg'}
                  alt={`${student.firstName} ${student.surname}`}
                />
                <CardContent>
                  <Typography variant="h6">{`${student.firstName} ${student.middleName} ${student.surname}`}</Typography>
                  <Typography variant="body2" color="textSecondary">{student.matricNumber}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Personal Info" />
                <Tab label="Academic Info" />
              </Tabs>
              <Box mt={2}>
                {activeTab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography><strong>Gender:</strong> {student.gender}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Date of Birth:</strong> {new Date(student.dob).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Email:</strong> {student.email}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Phone Number:</strong> {student.phoneNumber}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Marital Status:</strong> {student.maritalStatus}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography><strong>Permanent Address:</strong> {student.permanentAddress}</Typography>
                    </Grid>
                  </Grid>
                )}
                {activeTab === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography><strong>Department:</strong> {student.department}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Academic Year:</strong> {academicYears.find(y => y.id === student.academicYearId)?.session}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Level:</strong> {student.level}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Program Type:</strong> {student.programType}</Typography>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderStudentForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          name="firstName"
          label="First Name"
          value={newStudent.firstName}
          onChange={handleInputChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
          required
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          name="middleName"
          label="Middle Name"
          value={newStudent.middleName}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          name="surname"
          label="Surname"
          value={newStudent.surname}
          onChange={handleInputChange}
          error={!!errors.surname}
          helperText={errors.surname}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.gender}>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={newStudent.gender}
            onChange={handleInputChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          {errors.gender && <Typography color="error">{errors.gender}</Typography>}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth"
            value={newStudent.dob}
            onChange={handleDateChange}
            renderInput={(params) => 
              <TextField 
                {...params} 
                fullWidth 
                required 
                error={!!errors.dob}
                helperText={errors.dob}
              />
            }
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={newStudent.email}
          onChange={handleInputChange}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="phoneNumber"
          label="Phone Number"
          value={newStudent.phoneNumber}
          onChange={handleInputChange}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.maritalStatus}>
          <InputLabel>Marital Status</InputLabel>
          <Select
            name="maritalStatus"
            value={newStudent.maritalStatus}
            onChange={handleInputChange}
          >
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Married">Married</MenuItem>
            <MenuItem value="Divorced">Divorced</MenuItem>
            <MenuItem value="Widowed">Widowed</MenuItem>
          </Select>
          {errors.maritalStatus && <Typography color="error">{errors.maritalStatus}</Typography>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          name="permanentAddress"
          label="Permanent Address"
          multiline
          rows={3}
          value={newStudent.permanentAddress}
          onChange={handleInputChange}
          error={!!errors.permanentAddress}
          helperText={errors.permanentAddress}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.department}>
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            value={newStudent.department}
            onChange={handleInputChange}
          >
            {departments.map(dept => (
              <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
            ))}
          </Select>
          {errors.department && <Typography color="error">{errors.department}</Typography>}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.academicYearId}>
          <InputLabel>Academic Year</InputLabel>
          <Select
            name="academicYearId"
            value={newStudent.academicYearId}
            onChange={handleInputChange}
          >
            {academicYears.map(year => (
              <MenuItem key={year.id} value={year.id}>{year.session}</MenuItem>
            ))}
          </Select>
          {errors.academicYearId && <Typography color="error">{errors.academicYearId}</Typography>}
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.level}>
          <InputLabel>Level</InputLabel>
          <Select
            name="level"
            value={newStudent.level}
            onChange={handleInputChange}
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
        <FormControl fullWidth required error={!!errors.programType}>
          <InputLabel>Program Type</InputLabel>
          <Select
            name="programType"
            value={newStudent.programType}
            onChange={handleInputChange}
          >
            <MenuItem value="FullTime">Full Time</MenuItem>
            <MenuItem value="PartTime">Part Time</MenuItem>
            <MenuItem value="Distance">Distance Learning</MenuItem>
          </Select>
          {errors.programType && <Typography color="error">{errors.programType}</Typography>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handlePhotoChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span">
            Upload Photo
          </Button>
        </label>
        {photoFile && <span style={{ marginLeft: 10 }}>{photoFile.name}</span>}
        {selectedStudent && selectedStudent.photoUrl && !photoFile && (
          <img src={selectedStudent.photoUrl} alt="Student" style={{ width: 100, height: 100, objectFit: 'cover', marginLeft: 10 }} />
        )}
      </Grid>
    </Grid>
  );

  return (
    <AdminLayout>
      <Box>
        <StyledAppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Student Management
            </Typography>
            <StyledSearch>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange({...filters, searchTerm: e.target.value})}
              />
            </StyledSearch>
          </Toolbar>
        </StyledAppBar>

        <Box p={3}>
          <AdvancedSearchAndFilter />

          <Box my={2} display="flex" justifyContent="space-between" alignItems="center">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedStudent(null);
                setNewStudent({
                  firstName: '',
                  middleName: '',
                  surname: '',
                  gender: '',
                  dob: null,
                  email: '',
                  phoneNumber: '',
                  maritalStatus: '',
                  permanentAddress: '',
                  department: '',
                  academicYearId: '',
                  level: '',
                  programType: '',
                });
                setPhotoFile(null);
                setErrors({});
                setOpenDialog(true);
              }}
            >
              Add New Student
            </Button>
            {selectedStudents.length > 0 && (
              <Box>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  sx={{ mr: 1 }}
                >
                  Delete Selected ({selectedStudents.length})
                </Button>
                <Button
                  variant="outlined"startIcon={<FileDownloadIcon />}
                  onClick={() => {/* Implement export functionality */}}
                >
                  Export Selected
                </Button>
              </Box>
            )}
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                          checked={students.length > 0 && selectedStudents.length === students.length}
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderByField === 'matricNumber'}
                          direction={orderByField === 'matricNumber' ? orderDirection : 'asc'}
                          onClick={() => handleSort('matricNumber')}
                        >
                          Matric Number
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderByField === 'surname'}
                          direction={orderByField === 'surname' ? orderDirection : 'asc'}
                          onClick={() => handleSort('surname')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Academic Year</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.indexOf(student.id) !== -1}
                            onChange={() => handleSelectStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell>{student.matricNumber}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={student.photoUrl} sx={{ mr: 2 }} />
                            {`${student.surname}, ${student.firstName} ${student.middleName}`}
                          </Box>
                        </TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>{academicYears.find(y => y.id === student.academicYearId)?.session}</TableCell>
                        <TableCell>
                          <Tooltip title="View Profile">
                            <IconButton onClick={() => handleViewProfile(student)}>
                              <SearchIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => {
                              setSelectedStudent(student);
                              setNewStudent({...student});
                              setPhotoFile(null);
                              setErrors({});
                              setOpenDialog(true);
                            }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeleteStudent(student.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalStudents}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
            <DialogContent>
              <Box my={2}>
                {renderStudentForm()}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button 
                onClick={selectedStudent ? handleEditStudent : handleAddStudent} 
                disabled={isLoading}
                variant="contained"
                color="primary"
              >
                {isLoading ? <CircularProgress size={24} /> : (selectedStudent ? 'Update' : 'Add')}
              </Button>
            </DialogActions>
          </Dialog>

          {selectedProfileStudent && (
            <StudentProfileView
              student={selectedProfileStudent}
              onClose={() => {
                setOpenProfileDialog(false);
                setSelectedProfileStudent(null);
              }}
            />
          )}

          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default StudentManagementPage;