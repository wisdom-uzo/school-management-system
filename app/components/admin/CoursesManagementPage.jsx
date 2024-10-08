'use client'
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid,
  Chip, IconButton, Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import AdminLayout from './AdminLayout';

// Assuming AdminLayout is a custom component you've created

// Mock data for courses
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Programming', unit: 3, status: 'Core', department: 'Computer Science', level: 'ND', section: 'Year 1', semester: 1, session: '2023/2024' },
  { id: 2, code: 'EE201', title: 'Circuit Theory', unit: 4, status: 'Core', department: 'Electrical Engineering', level: 'HND', section: 'Year 2', semester: 1, session: '2023/2024' },
  { id: 3, code: 'BA101', title: 'Principles of Management', unit: 3, status: 'Core', department: 'Business Administration', level: 'ND', section: 'Year 1', semester: 2, session: '2023/2024' },
  { id: 4, code: 'ME301', title: 'Thermodynamics', unit: 4, status: 'Core', department: 'Mechanical Engineering', level: 'HND', section: 'Year 1', semester: 1, session: '2023/2024' },
];

const CoursesManagementPage = () => {
  const [courses, setCourses] = useState(mockCourses);
  const [newCourse, setNewCourse] = useState({ code: '', title: '', unit: '', status: '', department: '', level: '', section: '', semester: '', session: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ department: '', level: '', section: '', semester: '', session: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const validateForm = () => {
    let tempErrors = {};
    Object.keys(newCourse).forEach(key => {
      tempErrors[key] = newCourse[key] ? "" : "This field is required.";
    });
    
    // Check if code is unique
    if (newCourse.code && courses.some(course => course.code === newCourse.code && course.id !== editingCourse?.id)) {
      tempErrors.code = "This code is already in use.";
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddCourse = () => {
    if (validateForm()) {
      if (editingCourse) {
        setCourses(courses.map(course => 
          course.id === editingCourse.id ? { ...newCourse, id: course.id } : course
        ));
        setEditingCourse(null);
      } else {
        setCourses([...courses, { ...newCourse, id: courses.length + 1 }]);
      }
      setNewCourse({ code: '', title: '', unit: '', status: '', department: '', level: '', section: '', semester: '', session: '' });
      setOpenDialog(false);
    }
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({ ...course });
    setOpenDialog(true);
  };

  const filteredCourses = courses.filter(course => {
    return Object.keys(filters).every(key => 
      !filters[key] || course[key].toString().toLowerCase().includes(filters[key].toLowerCase())
    ) && (
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Courses Management
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Course Code or Title"
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
                setNewCourse({ code: '', title: '', unit: '', status: '', department: '', level: '', section: '', semester: '', session: '' });
                setErrors({});
                setOpenDialog(true);
              }}
            >
              Add New Course
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {['department', 'level', 'section', 'semester', 'session'].map((filter) => (
            <Grid item xs={12} sm={6} md={2} key={filter}>
              <FormControl fullWidth>
                <InputLabel>{filter.charAt(0).toUpperCase() + filter.slice(1)}</InputLabel>
                <Select
                  value={filters[filter]}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                  onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {[...new Set(courses.map(course => course[filter]))].map((value) => (
                    <MenuItem value={value} key={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>

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
                <TableCell>Section</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Session</TableCell>
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
                  <TableCell>{course.section}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.session}</TableCell>
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {['code', 'title', 'unit', 'status', 'department', 'level', 'section', 'semester', 'session'].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  {field === 'status' || field === 'level' || field === 'semester' ? (
                    <FormControl fullWidth margin="dense" error={!!errors[field]}>
                      <InputLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</InputLabel>
                      <Select
                        value={newCourse[field]}
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        onChange={(e) => setNewCourse({ ...newCourse, [field]: e.target.value })}
                      >
                        {field === 'status' && ['Core', 'Elective'].map(option => (
                          <MenuItem value={option} key={option}>{option}</MenuItem>
                        ))}
                        {field === 'level' && ['ND', 'HND'].map(option => (
                          <MenuItem value={option} key={option}>{option}</MenuItem>
                        ))}
                        {field === 'semester' && [1, 2].map(option => (
                          <MenuItem value={option} key={option}>{option}</MenuItem>
                        ))}
                      </Select>
                      {errors[field] && <Typography color="error">{errors[field]}</Typography>}
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      margin="dense"
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={newCourse[field]}
                      onChange={(e) => setNewCourse({ ...newCourse, [field]: e.target.value })}
                      error={!!errors[field]}
                      helperText={errors[field]}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>{editingCourse ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default CoursesManagementPage;