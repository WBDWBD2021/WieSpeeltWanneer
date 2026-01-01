import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { wedstrijdApi, spelerApi, beschikbaarheidApi, competitionApi } from '../services/api';
import { Match, Player, Availability, Competition } from '../types';
import { generateAvailabilityEmail } from '../utils/textGenerators';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [availability, setAvailability] = useState<{ [matchId: string]: Availability[] }>({});

  const [loading, setLoading] = useState(true);
  const [selectedCompetitieId, setSelectedCompetitieId] = useState<string>('');
  const [sortBy, setSortBy] = useState<'niveau' | 'wedstrijden'>('wedstrijden');

  // Email Dialog State
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', body: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompetitieId) {
      loadMatchesAndAvailability(selectedCompetitieId);
    }
  }, [selectedCompetitieId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [compsResponse, playersResponse] = await Promise.all([
        competitionApi.getAll(),
        spelerApi.getAll(),
      ]);

      const activeCompetitions = compsResponse.data;
      setCompetitions(activeCompetitions);
      setPlayers(playersResponse.data.filter(p => p.isActief));

      // Auto-select the most recent competition (assuming sorted or logic)
      if (activeCompetitions.length > 0) {
        // Sort by year desc, then season
        const sorted = [...activeCompetitions].sort((a, b) => {
          if (a.jaar !== b.jaar) return b.jaar - a.jaar;
          const seizoenen = ['winter', 'najaar', 'zomeravond', 'voorjaar'];
          return seizoenen.indexOf(a.seizoen) - seizoenen.indexOf(b.seizoen);
        });
        setSelectedCompetitieId(sorted[0]._id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchesAndAvailability = async (competitieId: string) => {
    try {
      // We fetch all matches and filter client-side for now, or use a query param if API supports it
      // Ideally: wedstrijdApi.getByCompetition(competitieId)
      const matchesResponse = await wedstrijdApi.getAll();

      const filteredMatches = matchesResponse.data
        .filter((match: Match) => {
          const matchCompId = typeof match.competitie === 'object' ? (match.competitie as any)._id : match.competitie;
          return matchCompId === competitieId;
        })
        .sort((a: Match, b: Match) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

      setMatches(filteredMatches);

      // Load availability for each match
      const availabilityData: { [matchId: string]: Availability[] } = {};
      await Promise.all(
        filteredMatches.map(async (match: Match) => {
          try {
            const availResponse = await beschikbaarheidApi.getWedstrijdBeschikbaarheid(match._id);
            availabilityData[match._id] = availResponse.data;
          } catch (error) {
            console.error(`Error loading availability for match ${match._id}:`, error);
            availabilityData[match._id] = [];
          }
        })
      );

      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error loading matches for competitie:', error);
    }
  };

  const handleOpenEmailDialog = () => {
    if (!selectedCompetitieId) return;

    // Get current competition name
    const comp = competitions.find(c => c._id === selectedCompetitieId);
    const compName = comp ? comp.naam : 'Competitie';

    const { subject, body } = generateAvailabilityEmail(
      compName,
      matches
    );

    setEmailData({ subject, body });
    setEmailDialogOpen(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`${emailData.subject}\n\n${emailData.body}`);
    alert('Tekst gekopieerd naar klembord!');
  };

  const handleOpenMailClient = () => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
  };

  const handleCompetitieChange = (event: SelectChangeEvent) => {
    setSelectedCompetitieId(event.target.value);
  };

  // Count how many times a player plays in a match
  const getPlayerMatchCount = (match: Match, playerId: string): number => {
    if (!match.posities) return 0;

    const count = match.posities.filter(pos => {
      if (!pos.spelerId) return false;

      // Handle both string and object spelerId
      let posSpelerId: string;
      if (typeof pos.spelerId === 'string') {
        posSpelerId = pos.spelerId;
      } else if (typeof pos.spelerId === 'object' && pos.spelerId !== null) {
        posSpelerId = (pos.spelerId as any)._id?.toString() || '';
      } else {
        return false;
      }

      return posSpelerId === playerId;
    }).length;

    return count;
  };

  // Get availability status for a player in a match
  const getAvailabilityStatus = (matchId: string, playerId: string): 'available' | 'unavailable' | 'maybe' | null => {
    const matchAvailability = availability[matchId] || [];
    const playerAvail = matchAvailability.find(a => a.player._id === playerId);
    return playerAvail?.status || null;
  };

  // Get cell color based on count and availability
  const getCellStyle = (count: number, status: 'available' | 'unavailable' | 'maybe' | null) => {
    if (count === 0) {
      // Not playing
      if (status === 'unavailable') {
        return { backgroundColor: '#ffebee', color: '#c62828', fontWeight: 'bold' }; // Red - not available
      }
      return { backgroundColor: '#f5f5f5', color: '#9e9e9e' }; // Grey - not playing
    }

    if (count === 1) {
      return { backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }; // Green - playing once
    }

    if (count === 2) {
      return { backgroundColor: '#c8e6c9', color: '#1b5e20', fontWeight: 'bold' }; // Darker green - playing twice
    }

    return { backgroundColor: '#fff3e0', color: '#e65100', fontWeight: 'bold' }; // Orange - playing more
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Sorteer spelers op basis van geselecteerde sorteer optie
  const getSortedPlayers = (): Player[] => {
    if (sortBy === 'niveau') {
      return [...players].sort((a, b) => a.niveau - b.niveau);
    } else {
      // Sorteer op aantal wedstrijden (aflopend - meest spelend eerst)
      return [...players].sort((a, b) => {
        const aMatchCount = matches.filter(m => getPlayerMatchCount(m, a._id) > 0).length;
        const bMatchCount = matches.filter(m => getPlayerMatchCount(m, b._id) > 0).length;
        return bMatchCount - aMatchCount;
      });
    }
  };

  // Calculate Quick Stats
  const activePlayersCount = players.length;
  const nextMatch = matches.find(m => new Date(m.datum) >= new Date());

  const currentCompetitionName = competitions.find(c => c._id === selectedCompetitieId)?.naam || 'Geen selectie';


  if (loading && competitions.length === 0) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      {/* 1. Header & Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '4px solid #1976d2' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">HUIDIGE COMPETITIE</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {currentCompetitionName}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '4px solid #ed6c02' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">VOLGENDE WEDSTRIJD</Typography>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                {nextMatch ? (
                  <>
                    {format(new Date(nextMatch.datum), 'd MMM', { locale: nl })}: {nextMatch.thuisteam} - {nextMatch.uitteam}
                    <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                      {nextMatch.isThuis ? (
                        <Chip label="Hapjes" size="small" color="primary" variant="outlined" />
                      ) : (
                        <Chip label="Rijden" size="small" color="secondary" variant="outlined" />
                      )}
                    </Box>
                  </>
                ) : 'Geen komende wedstrijden'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '4px solid #2e7d32' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">TEAM</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {activePlayersCount} Spelers
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 2. Control Bar */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          {/* Left: Filter/Select */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Competitie</InputLabel>
              <Select
                value={selectedCompetitieId}
                onChange={handleCompetitieChange}
                label="Competitie"
              >
                {competitions.length === 0 && <MenuItem disabled>Geen competities gevonden</MenuItem>}
                {competitions.map(comp => (
                  <MenuItem key={comp._id} value={comp._id}>{comp.naam}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={(e, newValue) => newValue && setSortBy(newValue)}
              size="small"
            >
              <ToggleButton value="wedstrijden">Aantal</ToggleButton>
              <ToggleButton value="niveau">Niveau</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Right: Actions */}
          <Box>
            {selectedCompetitieId && (
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={handleOpenEmailDialog}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Beschikbaarheid Opvragen
              </Button>
            )}
          </Box>
        </Box>

        {/* Legend inline */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>LEGENDA:</Typography>
          <Chip label="Speelt 1x" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 500, height: 24 }} />
          <Chip label="Speelt 2x" size="small" sx={{ bgcolor: '#c8e6c9', color: '#1b5e20', fontWeight: 600, height: 24 }} />
          <Chip label="Speelt niet" size="small" variant="outlined" sx={{ height: 24, borderColor: '#ddd' }} />
          <Chip label="Niet beschikbaar" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', height: 24 }} />
          <Chip label="Misschien" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', height: 24 }} />
        </Box>
      </Paper>

      {/* 3. Main Data Table */}
      {matches.length === 0 ? (
        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          Geen wedstrijden gevonden voor deze competitie. Selecteer een andere competitie of begin met plannen!
        </Alert>
      ) : (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Sticky Match Info Columns */}
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', zIndex: 10, minWidth: 50 }}>Wk</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', zIndex: 10, minWidth: 100, position: 'sticky', left: 0 }}>Datum</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', zIndex: 9, minWidth: 140 }}>Thuisteam</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', zIndex: 9, minWidth: 140 }}>Uitteam</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', zIndex: 9, minWidth: 120 }}>Locatie</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', zIndex: 9, minWidth: 100 }}>Taken</TableCell>

                  {/* Players */}
                  {getSortedPlayers().map(player => {
                    const matchCount = matches.filter(m => getPlayerMatchCount(m, player._id) > 0).length;
                    return (
                      <TableCell
                        key={player._id}
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: '#f5f5f5',
                          color: 'text.primary',
                          borderBottom: '2px solid #e0e0e0',
                          minWidth: 40,
                          px: 1
                        }}
                      >
                        <Tooltip title={`${player.naam} (${player.niveau}) - ${matchCount}x`}>
                          <Box sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{player.naam.split(' ')[0]}</span>
                            {sortBy === 'niveau' && <span style={{ fontSize: '0.7em', color: '#666' }}>({player.niveau})</span>}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match) => {
                  const matchDate = new Date(match.datum);
                  const weekNummer = getWeekNumber(matchDate);
                  return (
                    <TableRow key={match._id} hover onClick={() => navigate(`/wedstrijden/${match._id}`)} sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{weekNummer}</TableCell>
                      <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', fontWeight: 500, boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}>
                        {format(matchDate, 'd MMM', { locale: nl }).replace('.', '')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: match.isThuis ? 'bold' : 'normal' }}>
                        {match.thuisteam}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: !match.isThuis ? 'bold' : 'normal' }}>
                        {match.uitteam}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{match.locatie}</TableCell>
                      <TableCell>
                        {match.isThuis ? (
                          <Tooltip title="Hapjes verzorgen">
                            <Chip label="Hapjes" size="small" variant="outlined" color="primary" sx={{ height: 24, fontSize: '0.7em' }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Rijden">
                            <Chip label="Rijden" size="small" variant="outlined" color="secondary" sx={{ height: 24, fontSize: '0.7em' }} />
                          </Tooltip>
                        )}
                      </TableCell>

                      {getSortedPlayers().map(player => {
                        const count = getPlayerMatchCount(match, player._id);
                        const status = getAvailabilityStatus(match._id, player._id);
                        const cellStyle = getCellStyle(count, status);
                        return (
                          <TableCell key={player._id} align="center" sx={{ ...cellStyle, borderLeft: '1px solid #f0f0f0' }}>
                            {count > 0 ? count : (status === 'unavailable' || status === 'maybe' ? '' : '')}
                            {status === 'unavailable' && '❌'}
                            {status === 'maybe' && '❓'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 4. Collapsible Statistics Section (Optional, could be a separate component but keeping here for now) */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom color="text.secondary">Statistieken</Typography>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Speler</TableCell>
                <TableCell align="center">Niveau</TableCell>
                <TableCell align="center">Wedstrijden</TableCell>
                <TableCell align="center">Partijen</TableCell>
                <TableCell align="center">Gemiddeld</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedPlayers().map(player => {
                const totalMatches = matches.filter(m => getPlayerMatchCount(m, player._id) > 0).length;
                const totalGames = matches.reduce((sum, m) => sum + getPlayerMatchCount(m, player._id), 0);
                const average = totalMatches > 0 ? (totalGames / totalMatches).toFixed(2) : '0.00';

                return (
                  <TableRow key={player._id}>
                    <TableCell>{player.naam}</TableCell>
                    <TableCell align="center">{player.niveau}</TableCell>
                    <TableCell align="center">{totalMatches}</TableCell>
                    <TableCell align="center">{totalGames}</TableCell>
                    <TableCell align="center">{average}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {matches.length === 0 && !loading && selectedCompetitieId && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Geen wedstrijden gevonden voor deze competitie.
          </Typography>
        </Paper>
      )}

      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Beschikbaarheid Uitvragen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Kopieer onderstaande tekst of open direct je mailprogramma.
          </Typography>
          <TextField
            label="Onderwerp"
            fullWidth
            value={emailData.subject}
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Bericht"
            fullWidth
            multiline
            rows={10}
            value={emailData.body}
            margin="dense"
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Sluiten</Button>
          <Button startIcon={<ContentCopyIcon />} onClick={handleCopyEmail}>
            Kopieer
          </Button>
          <Button variant="contained" startIcon={<EmailIcon />} onClick={handleOpenMailClient}>
            Open Mail
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

export default Dashboard;
