import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Matches from './pages/Matches';
import MatchDetails from './pages/MatchDetails';
import PlayerDetails from './pages/PlayerDetails';
import NewPlayer from './pages/NewPlayer';
import NewMatch from './pages/NewMatch';
import Clubs from './pages/Clubs';
import Teams from './pages/Teams';
import Competitions from './pages/Competitions';
import theme from './theme';

import { useMediaQuery } from '@mui/material';
import MobileNavigation from './components/MobileNavigation';

function App() {
  // Define theme with breakpoints to use useMediaQuery inside the component
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

// Separate component to use useTheme/useMediaQuery which require ThemeProvider context
function AppContent() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
      pb: isMobile ? 7 : 0 // Add padding for bottom nav on mobile
    }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tennis Team Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Only show Sidebar on Desktop */}
        {!isMobile && <Navigation />}

        <Container component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/spelers" element={<Players />} />
            <Route path="/spelers/nieuw" element={<NewPlayer />} />
            <Route path="/spelers/:id" element={<PlayerDetails />} />
            <Route path="/wedstrijden" element={<Matches />} />
            <Route path="/wedstrijden/nieuw" element={<NewMatch />} />
            <Route path="/wedstrijden/:id" element={<MatchDetails />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/competities" element={<Competitions />} />
            <Route path="/matches" element={<Navigate to="/wedstrijden" replace />} />
            <Route path="/matches/:id" element={<Navigate to="/wedstrijden/:id" replace />} />
          </Routes>
        </Container>
      </Box>

      {/* Only show Bottom Nav on Mobile */}
      {isMobile && <MobileNavigation />}
    </Box>
  );
}

export default App;
