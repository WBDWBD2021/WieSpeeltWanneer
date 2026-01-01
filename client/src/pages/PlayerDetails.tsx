import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  IconButton
} from '@mui/material';
import { spelerApi, wedstrijdApi, clubApi } from '../services/api';
import { Player, Match } from '../types';
import { SelectChangeEvent } from '@mui/material/Select';

const PlayerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Partial<Player>>({});
  const [clubs, setClubs] = useState<string[]>([]);

  useEffect(() => {
    loadPlayer();
    fetchClubs();
  }, [id]);

  const fetchClubs = async () => {
    try {
      const response = await clubApi.getAll();
      const clubList = response.data
        .map(c => c.naam)
        .sort();
      setClubs(clubList);
    } catch (error) {
      console.error('Fout bij ophalen clubs:', error);
    }
  };

  const loadPlayer = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const [playerResponse, matchesResponse] = await Promise.all([
        spelerApi.getById(id),
        wedstrijdApi.getBySpelerId(id),
      ]);
      setPlayer(playerResponse.data);
      setMatches(matchesResponse.data);
    } catch (err) {
      setError('Er is een fout opgetreden bij het laden van de speler.');
      console.error('Error loading player:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (player) {
      setEditedPlayer({
        naam: player.naam,
        email: player.email,
        telefoon: player.telefoon,
        niveau: player.niveau,
        geslacht: player.geslacht || 'Man',
        club: player.club || '',
        isCaptain: player.isCaptain || false
      });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditedPlayer({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'niveau') {
      const numValue = parseInt(value);
      if (numValue >= 1 && numValue <= 9) {
        setEditedPlayer(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setEditedPlayer(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await spelerApi.update(id, editedPlayer);
      setPlayer(response.data);
      handleClose();
    } catch (err) {
      setError('Er is een fout opgetreden bij het bijwerken van de speler.');
      console.error('Error updating player:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Weet je zeker dat je deze speler wilt verwijderen?')) return;

    try {
      setLoading(true);
      setError(null);
      await spelerApi.delete(id);
      navigate('/players');
    } catch (err) {
      setError('Er is een fout opgetreden bij het verwijderen van de speler.');
      console.error('Error deleting player:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/players')}
          sx={{ mt: 2 }}
        >
          Terug naar spelers
        </Button>
      </Container>
    );
  }

  if (!player) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Speler niet gevonden</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/players')}
          sx={{ mt: 2 }}
        >
          Terug naar spelers
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/spelers')}
          sx={{ mr: 2 }}
        >
          Terug
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Speler Details
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ mr: 1 }}
          >
            Bewerken
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Verwijderen
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {player.naam}
          </Typography>
          {player.isCaptain && <Chip label="Aanvoerder" color="primary" size="small" />}
          {!player.isActief && <Chip label="Inactief" color="default" size="small" />}
        </Box>
        <Typography variant="body1" paragraph>
          Email: {player.email}
        </Typography>
        <Typography variant="body1" paragraph>
          Telefoon: {player.telefoon}
        </Typography>
        <Typography variant="body1">
          Niveau: {player.niveau}
        </Typography>
        <Typography variant="body1">
          Geslacht: {player.geslacht || 'Man'}
        </Typography>
        <Typography variant="body1">
          Club: {player.club || '-'}
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Wedstrijd Geschiedenis
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Datum</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Locatie</TableCell>
              <TableCell>Positie</TableCell>
              <TableCell>Rol</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match) => {
              const position = match.posities?.find(p => p.spelerId === player._id);
              return (
                <TableRow key={match._id}>
                  <TableCell>{new Date(match.datum).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {typeof match.team === 'string' ? match.team : match.team.naam}
                  </TableCell>
                  <TableCell>{match.locatie}</TableCell>
                  <TableCell>{position?.positie || '-'}</TableCell>
                  <TableCell>{position?.rol || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contactgegevens
              </Typography>
              <Typography>Email: {player.email}</Typography>
              <Typography>Telefoon: {player.telefoon}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Voorkeuren
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Niveau {player.niveau} | {player.geslacht} {player.club && `| ${player.club}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Speler Bewerken</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="naam"
            label="Naam"
            type="text"
            fullWidth
            value={editedPlayer.naam || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={editedPlayer.email || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="telefoon"
            label="Telefoon"
            type="text"
            fullWidth
            value={editedPlayer.telefoon || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="niveau"
            label="Niveau"
            type="number"
            fullWidth
            value={editedPlayer.niveau || 1}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: 9 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Geslacht</InputLabel>
            <Select
              value={editedPlayer.geslacht || 'Man'}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, geslacht: e.target.value as 'Man' | 'Vrouw' })}
              label="Geslacht"
            >
              <MenuItem value="Man">Man</MenuItem>
              <MenuItem value="Vrouw">Vrouw</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete
            freeSolo
            options={clubs}
            value={editedPlayer.club || ''}
            onChange={(event, newValue) => {
              setEditedPlayer(prev => ({ ...prev, club: newValue || '' }));
            }}
            onInputChange={(_, newInputValue) => {
              setEditedPlayer(prev => ({ ...prev, club: newInputValue }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Club"
                name="club"
                fullWidth
              />
            )}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editedPlayer.isCaptain || false}
                onChange={(e) => setEditedPlayer({ ...editedPlayer, isCaptain: e.target.checked })}
                color="secondary"
              />
            }
            label="Aanvoerder"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuleren</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

export default PlayerDetails; 