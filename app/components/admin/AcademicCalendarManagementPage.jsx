'use client'
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Box, FormControl, InputLabel, Select, MenuItem, Grid,
  IconButton, Tooltip, CircularProgress, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails,
  Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore/lite'; 
import AdminLayout from './AdminLayout';

const AcademicYearManagementPage = () => { 
  const [academicYears, setAcademicYears] = useState([]);
  const [newYear, setNewYear] = useState({ 
    session: '', 
    startDate: null, 
    endDate: null,
    ndActiveSemester: null,
    hndActiveSemester: null,
    ndCurrentLevel: 'ND1',
    hndCurrentLevel: 'HND1'
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchData();
  }, []);
console.log(academicYears)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const yearsCollection = collection(db, 'academic_years');
      const yearsSnapshot = await getDocs(yearsCollection);
      const yearsList = yearsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate()
      }));
      setAcademicYears(yearsList);
    } catch (error) {
      console.error("Error fetching data: ", error);
      showSnackbar("Failed to fetch academic years", "error");
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.session = newYear.session ? "" : "This field is required.";
    tempErrors.startDate = newYear.startDate ? "" : "This field is required.";
    tempErrors.endDate = newYear.endDate ? "" : "This field is required.";
    
    if (newYear.startDate && newYear.endDate && newYear.startDate >= newYear.endDate) {
      tempErrors.endDate = "End date must be after start date.";
    }

    const overlapping = academicYears.some(year => 
      year.id !== editingYear?.id && 
      ((newYear.startDate >= year.startDate && newYear.startDate <= year.endDate) ||
       (newYear.endDate >= year.startDate && newYear.endDate <= year.endDate))
    );
    if (overlapping) {
      tempErrors.date = "This year overlaps with an existing academic year.";
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleAddYear = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        if (editingYear) {
          const yearRef = doc(db, 'academic_years', editingYear.id);
          await updateDoc(yearRef, newYear);
          showSnackbar("Academic year updated successfully", "success");
        } else {
          await addDoc(collection(db, 'academic_years'), newYear);
          showSnackbar("New academic year added successfully", "success");
        }
        setNewYear({ 
          session: '', 
          startDate: null, 
          endDate: null,
          ndActiveSemester: null,
          hndActiveSemester: null,
          ndCurrentLevel: 'ND1',
          hndCurrentLevel: 'HND1'
        });
        setOpenDialog(false);
        setEditingYear(null);
        await fetchData(); // Refresh the list
      } catch (error) {
        console.error("Error adding/updating year: ", error);
        showSnackbar("Failed to save academic year", "error");
      }
      setIsLoading(false);
    }
  };

  const handleDeleteYear = async (id) => {
    setConfirmDialog({
      open: true,
      title: "Delete Academic Year",
      message: "Are you sure you want to delete this academic year? This action cannot be undone.",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteDoc(doc(db, 'academic_years', id));
          await fetchData(); // Refresh the list
          showSnackbar("Academic year deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting year: ", error);
          showSnackbar("Failed to delete academic year", "error");
        }
        setIsLoading(false);
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const handleEditYear = (year) => {
    setEditingYear(year);
    setNewYear({ ...year });
    setOpenDialog(true);
  };

  const handleActiveSemesterChange = (program, value) => {
    setNewYear(prev => ({
      ...prev,
      [program === 'ND' ? 'ndActiveSemester' : 'hndActiveSemester']: value
    }));
  };

  const handlePromoteLevel = async (yearId, program) => {
    const year = academicYears.find(y => y.id === yearId);
    if (!year) return;

    let newLevel;
    if (program === 'ND') {
      newLevel = year.ndCurrentLevel === 'ND1' ? 'ND2' : 'ND1';
    } else {
      newLevel = year.hndCurrentLevel === 'HND1' ? 'HND2' : 'HND1';
    }

    setConfirmDialog({
      open: true,
      title: `Promote ${program} Students`,
      message: `Are you sure you want to promote ${program} students to ${newLevel}?`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const yearRef = doc(db, 'academic_years', yearId);
          await updateDoc(yearRef, {
            [`${program.toLowerCase()}CurrentLevel`]: newLevel
          });
          showSnackbar(`${program} students promoted to ${newLevel} successfully`, "success");
          await fetchData(); // Refresh the list
        } catch (error) {
          console.error("Error promoting students: ", error);
          showSnackbar(`Failed to promote ${program} students`, "error");
        }
        setIsLoading(false);
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredYears = academicYears.filter(year => 
    year.session.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" className='text-black' gutterBottom>
            Academic Year Management
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Academic Years"
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
                  setEditingYear(null);
                  setNewYear({ 
                    session: '', 
                    startDate: null, 
                    endDate: null,
                    ndActiveSemester: null,
                    hndActiveSemester: null,
                    ndCurrentLevel: 'ND1',
                    hndCurrentLevel: 'HND1'
                  });
                  setErrors({});
                  setOpenDialog(true);
                }}
              >
                Add New Academic Year
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
                    <TableCell>Session</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>ND Active Semester</TableCell>
                    <TableCell>HND Active Semester</TableCell>
                    <TableCell>ND Current Level</TableCell>
                    <TableCell>HND Current Level</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell>{year.session}</TableCell>
                      <TableCell>{year.startDate.toLocaleDateString()}</TableCell>
                      <TableCell>{year.endDate.toLocaleDateString()}</TableCell>
                      <TableCell>{year.ndActiveSemester || 'Not set'}</TableCell>
                      <TableCell>{year.hndActiveSemester || 'Not set'}</TableCell>
                      <TableCell>
                        {year.ndCurrentLevel}
                        <Button 
                          size="small" 
                          onClick={() => handlePromoteLevel(year.id, 'ND')}
                          sx={{ ml: 1 }}
                        >
                          Promote
                        </Button>
                      </TableCell>
                      <TableCell>
                        {year.hndCurrentLevel}
                        <Button 
                          size="small" 
                          onClick={() => handlePromoteLevel(year.id, 'HND')}
                          sx={{ ml: 1 }}
                        >
                          Promote
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditYear(year)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteYear(year.id)} size="small" color="error">
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
            <DialogTitle>{editingYear ? 'Edit' : 'Add New'} Academic Year</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Session (e.g., 2024/2025)"
                fullWidth
                value={newYear.session}
                onChange={(e) => setNewYear({ ...newYear, session: e.target.value })}
                error={!!errors.session}
                helperText={errors.session}
              />
              <DatePicker
                label="Start Date"
                value={newYear.startDate}
                onChange={(date) => setNewYear({ ...newYear, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="dense" error={!!errors.startDate} helperText={errors.startDate} />}
              />
              <DatePicker
                label="End Date"
                value={newYear.endDate}
                onChange={(date) => setNewYear({ ...newYear, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="dense" error={!!errors.endDate} helperText={errors.endDate} />}
              />
              {errors.date && <Typography color="error">{errors.date}</Typography>}

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Active Semesters</Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>ND Active Semester</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup
                    value={newYear.ndActiveSemester}
                    onChange={(e) => handleActiveSemesterChange('ND', e.target.value)}
                  >
                    <FormControlLabel value="1st Semester" control={<Radio />} label="1st Semester" />
                    <FormControlLabel value="2nd Semester" control={<Radio />} label="2nd Semester" />
                  </RadioGroup>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>HND Active Semester</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup
                    value={newYear.hndActiveSemester}
                    onChange={(e) => handleActiveSemesterChange('HND', e.target.value)}
                  >
                    <FormControlLabel value="1st Semester" control={<Radio />} label="1st Semester" />
                    <FormControlLabel value="2nd Semester" control={<Radio />} label="2nd Semester" />
                  </RadioGroup>
                </AccordionDetails>
              </Accordion>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleAddYear} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : (editingYear ? 'Update' : 'Add')}
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
            <Button onClick={confirmDialog.onConfirm} color="primary" variant="contained">Confirm</Button>
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

export default AcademicYearManagementPage;