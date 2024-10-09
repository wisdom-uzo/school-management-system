'use client'
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid,
  IconButton, Tooltip, CircularProgress, Snackbar, Alert, Calendar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { db, auth } from '@/config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore/lite'; 
import AdminLayout from './AdminLayout';

const AcademicCalendarManagementPage = () => { 
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [newPeriod, setNewPeriod] = useState({ name: '', session: '', startDate: null, endDate: null });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    fetchData();
    //checkUserRole();
  }, []);

//   const checkUserRole = async () => {
//     // This is a placeholder. In a real app, you'd check the user's role from your authentication system
//     // For example, you might have a 'roles' collection in Firestore
//     const user = auth.currentUser;
//     if (user) {
//       // Assuming you have a 'roles' collection where documents are keyed by user ID
//       const roleDoc = await getDocs(query(collection(db, 'roles'), where('userId', '==', user.uid)));
//       if (!roleDoc.empty) {
//         setUserRole(roleDoc.docs[0].data().role);
//       }
//     }
//   };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const periodsCollection = collection(db, 'academic_periods');
      const periodsSnapshot = await getDocs(periodsCollection);
      const periodsList = periodsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate()
      }));
      setAcademicPeriods(periodsList);
    } catch (error) {
      console.error("Error fetching data: ", error);
      showSnackbar("Failed to fetch academic periods", "error");
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = newPeriod.name ? "" : "This field is required.";
    tempErrors.session = newPeriod.session ? "" : "This field is required.";
    tempErrors.startDate = newPeriod.startDate ? "" : "This field is required.";
    tempErrors.endDate = newPeriod.endDate ? "" : "This field is required.";
    
    if (newPeriod.startDate && newPeriod.endDate && newPeriod.startDate >= newPeriod.endDate) {
      tempErrors.endDate = "End date must be after start date.";
    }

    // Check for overlapping periods
    const overlapping = academicPeriods.some(period => 
      period.id !== editingPeriod?.id && 
      ((newPeriod.startDate >= period.startDate && newPeriod.startDate <= period.endDate) ||
       (newPeriod.endDate >= period.startDate && newPeriod.endDate <= period.endDate))
    );
    if (overlapping) {
      tempErrors.date = "This period overlaps with an existing period.";
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddPeriod = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        if (editingPeriod) {
          const periodRef = doc(db, 'academic_periods', editingPeriod.id);
          await updateDoc(periodRef, newPeriod);
          showSnackbar("Academic period updated successfully", "success");
        } else {
          await addDoc(collection(db, 'academic_periods'), newPeriod);
          showSnackbar("New academic period added successfully", "success");
        }
        setNewPeriod({ name: '', session: '', startDate: null, endDate: null });
        setOpenDialog(false);
        setEditingPeriod(null);
        await fetchData(); // Refresh the list
      } catch (error) {
        console.error("Error adding/updating period: ", error);
        showSnackbar("Failed to save academic period", "error");
      }
      setIsLoading(false);
    }
  };

  const handleDeletePeriod = async (id) => {
    setConfirmDialog({
      open: true,
      title: "Delete Academic Period",
      message: "Are you sure you want to delete this academic period? This action cannot be undone.",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteDoc(doc(db, 'academic_periods', id));
          await fetchData(); // Refresh the list
          showSnackbar("Academic period deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting period: ", error);
          showSnackbar("Failed to delete academic period", "error");
        }
        setIsLoading(false);
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleEditPeriod = (period) => {
    setEditingPeriod(period);
    setNewPeriod({ 
      name: period.name, 
      session: period.session, 
      startDate: period.startDate, 
      endDate: period.endDate 
    });
    setOpenDialog(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredPeriods = academicPeriods.filter(period => 
    period.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    period.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = true
  //userRole === 'admin' || userRole === 'academic_officer';

  return (
    <AdminLayout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" className='text-black' gutterBottom>
            Academic Calendar Management
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Academic Periods"
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
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingPeriod(null);
                    setNewPeriod({ name: '', session: '', startDate: null, endDate: null });
                    setErrors({});
                    setOpenDialog(true);
                  }}
                >
                  Add New Academic Period
                </Button>
              )}
            </Grid>
          </Grid>

          {isLoading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    {canEdit && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>{period.name}</TableCell>
                      <TableCell>{period.session}</TableCell>
                      <TableCell>{period.startDate.toLocaleDateString()}</TableCell>
                      <TableCell>{period.endDate.toLocaleDateString()}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEditPeriod(period)} size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeletePeriod(period.id)} size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>{editingPeriod ? 'Edit' : 'Add New'} Academic Period</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Name (e.g., First Semester)"
                fullWidth
                value={newPeriod.name}
                onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                margin="dense"
                label="Session (e.g., 2024/2025)"
                fullWidth
                value={newPeriod.session}
                onChange={(e) => setNewPeriod({ ...newPeriod, session: e.target.value })}
                error={!!errors.session}
                helperText={errors.session}
              />
              <DatePicker
                label="Start Date"
                value={newPeriod.startDate}
                onChange={(date) => setNewPeriod({ ...newPeriod, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="dense" error={!!errors.startDate} helperText={errors.startDate} />}
              />
              <DatePicker
                label="End Date"
                value={newPeriod.endDate}
                onChange={(date) => setNewPeriod({ ...newPeriod, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="dense" error={!!errors.endDate} helperText={errors.endDate} />}
              />
              {errors.date && <Typography color="error">{errors.date}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleAddPeriod} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : (editingPeriod ? 'Update' : 'Add')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogContent>{confirmDialog.message}</DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
              <Button onClick={confirmDialog.onConfirm} color="error">Confirm</Button>
            </DialogActions>
          </Dialog>

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
      </LocalizationProvider>
    </AdminLayout>
  );
};

export default AcademicCalendarManagementPage;