'use client'

import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid,
  Tabs, Tab, Chip, IconButton, Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AdminLayout from './AdminLayout';

// Mock data for classrooms
const mockClassrooms = [
  { id: 1, name: 'Room 101', capacity: 50 },
  { id: 2, name: 'Lab 1', capacity: 30 },
  { id: 3, name: 'Lecture Hall A', capacity: 100 },
];

// Mock data for departments and levels
const mockDepartments = ['Computer Science', 'Electrical Engineering', 'Business Administration'];
const levels = ['ND1', 'ND2', 'HND1', 'HND2'];

// Mock data for courses
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Programming', department: 'Computer Science', level: 'ND1', lecturer: 'Dr. Smith', duration: 2 },
  { id: 2, code: 'EE201', title: 'Circuit Theory', department: 'Electrical Engineering', level: 'ND2', lecturer: 'Prof. Johnson', duration: 3 },
  { id: 3, code: 'BA101', title: 'Principles of Management', department: 'Business Administration', level: 'ND1', lecturer: 'Dr. Brown', duration: 2 },
  { id: 4, code: 'CS301', title: 'Database Systems', department: 'Computer Science', level: 'HND1', lecturer: 'Dr. Davis', duration: 3 },
  { id: 5, code: 'EE401', title: 'Control Systems', department: 'Electrical Engineering', level: 'HND2', lecturer: 'Prof. Wilson', duration: 2 },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const ClassroomManagementPage = () => {
  const [classrooms, setClassrooms] = useState(mockClassrooms);
  const [newClassroom, setNewClassroom] = useState({ name: '', capacity: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [errors, setErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [generalTimetable, setGeneralTimetable] = useState({});

  useEffect(() => {
    generateGeneralTimetable();
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = newClassroom.name ? "" : "This field is required.";
    tempErrors.capacity = newClassroom.capacity ? "" : "This field is required.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddClassroom = () => {
    if (validateForm()) {
      if (editingClassroom) {
        setClassrooms(classrooms.map(room => 
          room.id === editingClassroom.id ? { ...newClassroom, id: room.id } : room
        ));
        setEditingClassroom(null);
      } else {
        setClassrooms([...classrooms, { ...newClassroom, id: classrooms.length + 1 }]);
      }
      setNewClassroom({ name: '', capacity: '' });
      setOpenDialog(false);
    }
  };

  const handleDeleteClassroom = (id) => {
    setClassrooms(classrooms.filter(room => room.id !== id));
  };

  const handleEditClassroom = (room) => {
    setEditingClassroom(room);
    setNewClassroom({ ...room });
    setOpenDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const generateGeneralTimetable = () => {
    let newTimetable = {};

    daysOfWeek.forEach(day => {
      newTimetable[day] = {};
      timeSlots.forEach(time => {
        newTimetable[day][time] = {};
        classrooms.forEach(room => {
          newTimetable[day][time][room.name] = null;
        });
      });
    });

    mockCourses.forEach(course => {
      let placed = false;
      for (let day of daysOfWeek) {
        if (placed) break;
        for (let i = 0; i < timeSlots.length - course.duration + 1; i++) {
          const startTime = timeSlots[i];
          const endTime = timeSlots[i + course.duration - 1];
          const availableRoom = classrooms.find(room => {
            return Array.from({ length: course.duration }, (_, index) => timeSlots[i + index]).every(time => 
              newTimetable[day][time][room.name] === null
            );
          });

          if (availableRoom) {
            for (let j = 0; j < course.duration; j++) {
              const time = timeSlots[i + j];
              newTimetable[day][time][availableRoom.name] = course;
            }
            placed = true;
            break;
          }
        }
      }
    });

    setGeneralTimetable(newTimetable);
  };

  const ClassroomList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classrooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEditClassroom(room)} size="small">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDeleteClassroom(room.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const TimetableView = () => (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {mockDepartments.map(dept => (
                <MenuItem value={dept} key={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Level</InputLabel>
            <Select
              value={selectedLevel}
              label="Level"
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              {levels.map(level => (
                <MenuItem value={level} key={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {daysOfWeek.map(day => (
                <TableCell key={day}>{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(time => (
              <TableRow key={time}>
                <TableCell>{time}</TableCell>
                {daysOfWeek.map(day => (
                  <TableCell key={`${day}-${time}`}>
                    {Object.entries(generalTimetable[day]?.[time] || {}).map(([room, course]) => {
                      if (course && 
                          (!selectedDepartment || course.department === selectedDepartment) &&
                          (!selectedLevel || course.level === selectedLevel)) {
                        return (
                          <Chip
                            key={`${course.code}-${room}`}
                            label={`${course.code} - ${room}`}
                            color="primary"
                            size="small"
                            sx={{ m: 0.5 }}
                          />
                        );
                      }
                      return null;
                    })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Classroom and Timetable Management
        </Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Classrooms" />
          <Tab label="Timetable" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingClassroom(null);
                setNewClassroom({ name: '', capacity: '' });
                setErrors({});
                setOpenDialog(true);
              }}
              sx={{ mb: 2 }}
            >
              Add New Classroom
            </Button>
            <ClassroomList />
          </>
        )}

        {tabValue === 1 && <TimetableView />}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Classroom Name"
              fullWidth
              value={newClassroom.name}
              onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              margin="dense"
              label="Capacity"
              fullWidth
              type="number"
              value={newClassroom.capacity}
              onChange={(e) => setNewClassroom({ ...newClassroom, capacity: e.target.value })}
              error={!!errors.capacity}
              helperText={errors.capacity}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddClassroom}>{editingClassroom ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default ClassroomManagementPage;