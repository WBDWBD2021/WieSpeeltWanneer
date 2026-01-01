import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Navigation from './components/Navigation';
import Players from './pages/Players';
import Matches from './pages/Matches';
import MatchDetails from './pages/MatchDetails';
import PlayerDetails from './pages/PlayerDetails';
import NewPlayer from './pages/NewPlayer';
import NewMatch from './pages/NewMatch';
import Clubs from './pages/Clubs';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Tennis Team Manager
              </Typography>
            </Toolbar>
          </AppBar>
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Navigation />
            <Container component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={<Matches />} />
                <Route path="/spelers" element={<Players />} />
                <Route path="/spelers/nieuw" element={<NewPlayer />} />
                <Route path="/spelers/:id" element={<PlayerDetails />} />
                <Route path="/wedstrijden" element={<Matches />} />
                <Route path="/wedstrijden/nieuw" element={<NewMatch />} />
                <Route path="/wedstrijden/:id" element={<MatchDetails />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/matches" element={<Navigate to="/wedstrijden" replace />} />
                <Route path="/matches/:id" element={<Navigate to="/wedstrijden/:id" replace />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
