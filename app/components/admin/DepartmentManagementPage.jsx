'use client'
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid,
  Chip, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore/lite'; 
import AdminLayout from './AdminLayout';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '', level: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const departmentsCollection = collection(db, 'departments');
      const departmentSnapshot = await getDocs(departmentsCollection);
      const departmentList = departmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDepartments(departmentList);
    } catch (error) {
      console.error("Error fetching departments: ", error);
      // You might want to show an error message to the user here
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = newDepartment.name ? "" : "This field is required.";
    tempErrors.code = newDepartment.code ? "" : "This field is required.";
    tempErrors.level = newDepartment.level ? "" : "This field is required.";
    
    // Check if code is unique
    if (newDepartment.code && departments.some(dept => dept.code === newDepartment.code && dept.id !== editingDepartment?.id)) {
      tempErrors.code = "This code is already in use.";
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddDepartment = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        if (editingDepartment) {
          const departmentRef = doc(db, 'departments', editingDepartment.id);
          await updateDoc(departmentRef, newDepartment);
        } else {
          await addDoc(collection(db, 'departments'), newDepartment);
        }
        setNewDepartment({ name: '', code: '', level: '' });
        setOpenDialog(false);
        setEditingDepartment(null);   
        await fetchDepartments(); // Refresh the list
      } catch (error) {
        console.error("Error adding/updating department: ", error);
        // You might want to show an error message to the user here
      }
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'departments', id));
      await fetchDepartments(); // Refresh the list
    } catch (error) {
      console.error("Error deleting department: ", error);
      // You might want to show an error message to the user here
    }
    setIsLoading(false);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setNewDepartment({ name: department.name, code: department.code, level: department.level });
    setOpenDialog(true);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" className='text-black' gutterBottom>
          Department Management
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingDepartment(null);
            setNewDepartment({ name: '', code: '', level: '' });
            setErrors({});
            setOpenDialog(true);
          }}
          sx={{ mb: 2 }}
        >
          Add New Department
        </Button>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>
                      <Chip 
                        label={department.level} 
                        color={department.level === 'ND' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditDepartment(department)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteDepartment(department.id)} size="small" color="error">
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Department Name"
              fullWidth
              value={newDepartment.name}
              onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              margin="dense"
              label="Department Code"
              fullWidth
              value={newDepartment.code}
              onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value.toUpperCase() })}
              error={!!errors.code}
              helperText={errors.code}
            />
            <FormControl fullWidth margin="dense" error={!!errors.level}>
              <InputLabel>Level</InputLabel>
              <Select
                value={newDepartment.level}
                label="Level"
                onChange={(e) => setNewDepartment({ ...newDepartment, level: e.target.value })}
              >
                <MenuItem value="ND">ND</MenuItem>
                <MenuItem value="HND">HND</MenuItem>
              </Select>
              {errors.level && <Typography color="error">{errors.level}</Typography>}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddDepartment} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : (editingDepartment ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default DepartmentManagementPage;