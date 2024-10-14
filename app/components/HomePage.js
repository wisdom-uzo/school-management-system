'use client'

import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, CardMedia,
  IconButton, Box, useScrollTrigger, Fade, Fab, Divider, List, ListItem, ListItemText,
  Menu, MenuItem, SwipeableDrawer, useMediaQuery, Tab, Tabs, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { styled, alpha, ThemeProvider, createTheme } from '@mui/material/styles';
import { KeyboardArrowUp, School, Event, LibraryBooks, People, Menu as MenuIcon, ExpandMore } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore/lite';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0', // Blue
      light: '#1E88E5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#2E7D32', // Green
      light: '#43A047',
      dark: '#1B5E20',
    },
    background: {
      
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Styled components
const HeroSection = styled('div')(({ theme }) => ({
  backgroundImage: 'linear-gradient(135deg, #1565C0 0%, #2E7D32 100%)',
  height: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/hero-pattern.svg") repeat',
    opacity: 0.1,
  }
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  transition: 'background-color 0.3s ease-in-out',
  '&.scrolled': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
  }
}));

const ScrollTop = (props) => {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  );
};

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [appBarScrolled, setAppBarScrolled] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchNews();
    fetchDepartments();
    fetchPrograms();

    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      if (isScrolled !== appBarScrolled) {
        setAppBarScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [appBarScrolled]);

  const fetchNews = async () => {
    // Simulating fetching news from an API
    setNews([
      { id: 1, title: "New Computer Science Program Launched", date: "2023-05-15" },
      { id: 2, title: "Igbajo Poly Wins National Innovation Award", date: "2023-05-10" },
      { id: 3, title: "Alumni Donation Funds New Library Wing", date: "2023-05-05" },
    ]);
  };

  const fetchDepartments = async () => {
    try {
      const departmentsCollection = collection(db, 'departments');
      const departmentsSnapshot = await getDocs(departmentsCollection);
      const departmentsList = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDepartments(departmentsList);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const programsCollection = collection(db, 'programs');
      const programsSnapshot = await getDocs(programsCollection);
      const programsList = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrograms(programsList);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const menuItems = [
    { title: 'About', link: '/about' },
    { title: 'Academics', link: '/academics' },
    { title: 'Admissions', link: '/admissions' },
    { title: 'Campus Life', link: '/campus-life' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Igbajo Polytechnic
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.title} disablePadding>
            <Link href={item.link} passHref>
              <ListItemText primary={item.title} />
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider className='bg-gray-600' theme={theme}>
      <StyledAppBar position="fixed" className={appBarScrolled ? 'scrolled' : ''}>
        <Toolbar>
          <Image
            src="/images/school-logo.png"
            alt="Igbajo Polytechnic Logo"
            width={50}
            height={50}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Igbajo Polytechnic
          </Typography>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {menuItems.map((item) => (
                <Button key={item.title} color="inherit" component={Link} href={item.link}>
                  {item.title}
                </Button>
              ))}
              <Button color="secondary" variant="contained" component={Link} href="/login/student">
                Student Portal
              </Button>
            </>
          )}
        </Toolbar>
      </StyledAppBar>
      <div id="back-to-top-anchor" />
      
      {isMobile && (
        <SwipeableDrawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
        >
          {drawer}
        </SwipeableDrawer>
      )}
      
      <HeroSection>
        <Box sx={{ zIndex: 1, position: 'relative' }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
            Welcome to Igbajo Polytechnic OSUN State, Nigeria (Olivet Centre)

          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Empowering Minds, Shaping Futures
          </Typography>
          <Button variant="contained" size="large" color="secondary">
            Apply Now
          </Button>
        </Box>
      </HeroSection>

      <Container className='bg-gray-400' maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <InfoCard>
              <CardContent>
                <School fontSize="large" color="primary" />
                <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                  Academic Excellence
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Discover our wide range of programs designed to prepare you for success.
                </Typography>
              </CardContent>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <InfoCard>
              <CardContent>
                <LibraryBooks fontSize="large" color="primary" />
                <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                  State-of-the-Art Facilities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Learn in modern classrooms and labs equipped with the latest technology.
                </Typography>
              </CardContent>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <InfoCard>
              <CardContent>
                <People fontSize="large" color="primary" />
                <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                  Diverse Community
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Join a vibrant community of students from various backgrounds.
                </Typography>
              </CardContent>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <InfoCard>
              <CardContent>
                <Event fontSize="large" color="primary" />
                <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                  Campus Events
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Engage in a variety of academic, cultural, and social events throughout the year.
                </Typography>
              </CardContent>
            </InfoCard>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Our Programs
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 4 }}>
            <Tab label="National Diploma (ND)" />
            <Tab label="Higher National Diploma (HND)" />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {programs.filter(p => p.level === 'ND').map((program) => (
                  <Grid item xs={12} sm={6} md={4} key={program.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{program.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {program.duration}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            {tabValue === 1 && (
              <Grid container spacing={2}>
                {programs.filter(p => p.level === 'HND').map((program) => (
                  <Grid item xs={12} sm={6} md={4} key={program.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{program.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {program.duration}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Our Departments
          </Typography>
          {departments.map((department) => (
            <Accordion key={department.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{department.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {department.description}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Programs offered:</Typography>
                <List>
                  {programs.filter(p => p.departmentId === department.id).map((program) => (
                    <ListItem key={program.id}>
                      <ListItemText primary={program.name} secondary={`${program.level} - ${program.duration}`} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Latest News and Events
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <List>
              {news.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={item.title}
                        secondary={`Published on ${item.date}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image="/campus-image.jpg"
                  alt="Igbajo Polytechnic Campus"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Virtual Campus Tour
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore our beautiful campus from the comfort of your home. Take a virtual tour and discover what Igbajo Polytechnic has to offer.
                  </Typography>
                  <Button variant="outlined" color="primary" sx={{ mt: 2 }}>Start Tour</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2">
                P.M.B. 303, Igbajo, OSUN State, Nigeria (Olivet Centre)
              </Typography>
              <Typography variant="body2">
                Email: info@igbajopoly.edu.ng
              </Typography>
              <Typography variant="body2">
                Phone: +234 123 456 7890
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Typography variant="body2">Academic Calendar</Typography>
              <Typography variant="body2">Library Resources</Typography>
              <Typography variant="body2">Student Portal</Typography>
              <Typography variant="body2">Career Services</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Follow Us
              </Typography>
              <IconButton color="inherit"><i className="fab fa-facebook"></i></IconButton>
              <IconButton color="inherit"><i className="fab fa-twitter"></i></IconButton>
              <IconButton color="inherit"><i className="fab fa-instagram"></i></IconButton>
              <IconButton color="inherit"><i className="fab fa-linkedin"></i></IconButton>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Igbajo Polytechnic. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <ScrollTop>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </ThemeProvider>
  );
};

export default HomePage;