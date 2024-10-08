'use client'


import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Card, CardContent, Box
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AdminLayout from './AdminLayout';



// Mock data for students
const mockStudents = [
  { id: 1, name: 'Alice Johnson', grade: '10th', age: 16, parentName: 'Bob Johnson', contactNumber: '123-456-7890' },
  { id: 2, name: 'Charlie Brown', grade: '9th', age: 15, parentName: 'Sally Brown', contactNumber: '987-654-3210' },
  { id: 3, name: 'Diana Smith', grade: '11th', age: 17, parentName: 'John Smith', contactNumber: '456-789-0123' },
];

const StudentManagementPage = () => {
  const [students, setStudents] = useState(mockStudents);
  const [newStudent, setNewStudent] = useState({ name: '', grade: '', age: '', parentName: '', contactNumber: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleAddStudent = () => {
    setStudents([...students, { ...newStudent, id: students.length + 1 }]);
    setNewStudent({ name: '', grade: '', age: '', parentName: '', contactNumber: '' });
    setOpenDialog(false);
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  return (
    <AdminLayout>                     
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Student Management
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Add New Student
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(student)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedStudent && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedStudent.name} - Details
              </Typography>
              <Typography><strong>Grade:</strong> {selectedStudent.grade}</Typography>
              <Typography><strong>Age:</strong> {selectedStudent.age}</Typography>
              <Typography><strong>Parent Name:</strong> {selectedStudent.parentName}</Typography>
              <Typography><strong>Contact Number:</strong> {selectedStudent.contactNumber}</Typography>
            </CardContent>
          </Card>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Grade"
              fullWidth
              value={newStudent.grade}
              onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Age"
              type="number"
              fullWidth
              value={newStudent.age}
              onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Parent Name"
              fullWidth
              value={newStudent.parentName}
              onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Contact Number"
              fullWidth
              value={newStudent.contactNumber}
              onChange={(e) => setNewStudent({ ...newStudent, contactNumber: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default StudentManagementPage;