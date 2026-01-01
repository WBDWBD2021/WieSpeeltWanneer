import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Paper,
  Grid,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { wedstrijdApi, competitionApi, teamApi } from '../services/api';
import { Match, Competition, Team } from '../types';

const NewMatch: React.FC = () => {
  const navigate = useNavigate();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wedstrijd, setWedstrijd] = useState<{
    datum: string;
    tijd: string;
    team: string; // Team ID
    isThuis: boolean;
    thuisteam: string;
    uitteam: string;
    locatie: string;
    status: 'gepland' | 'in_behandeling' | 'afgerond' | 'geannuleerd';
    competitie: string; // Competition ID
  }>({
    datum: new Date().toISOString().split('T')[0],
    tijd: '19:00',
    team: '',
    isThuis: true,
    thuisteam: '',
    uitteam: '',
    locatie: 'Oisterwijk',
    status: 'gepland' as 'gepland' | 'in_behandeling' | 'afgerond' | 'geannuleerd',
    competitie: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, teamRes] = await Promise.all([
        competitionApi.getAll(),
        teamApi.getAll()
      ]);
      setCompetitions(compRes.data);
      setTeams(teamRes.data);
    } catch (err) {
      console.error("Error fetching form data", err);
      setError("Kon gegevens niet laden.");
    } finally {
      setLoading(false);
    }
  };

  // Filter teams whenever competition changes
  useEffect(() => {
    if (wedstrijd.competitie) {
      // Show teams that belong to this competition, or show all if none found/generic
      const relevantTeams = teams.filter(t => {
        // Check if team.competitie matches the selected ID (handle object vs string)
        const compId = typeof t.competitie === 'object' ? (t.competitie as any)._id : t.competitie;
        return compId === wedstrijd.competitie;
      });
      setFilteredTeams(relevantTeams.length > 0 ? relevantTeams : teams);
    } else {
      setFilteredTeams(teams);
    }
  }, [wedstrijd.competitie, teams]);

  // Auto-fill Home/Away team when Team or isThuis changes
  useEffect(() => {
    if (wedstrijd.team) {
      const selectedTeam = teams.find(t => t._id === wedstrijd.team);
      if (selectedTeam) {
        if (wedstrijd.isThuis) {
          setWedstrijd(prev => ({ ...prev, thuisteam: selectedTeam.naam }));
          if (wedstrijd.locatie === '') setWedstrijd(prev => ({ ...prev, locatie: 'Oisterwijk' }));
        } else {
          setWedstrijd(prev => ({ ...prev, uitteam: selectedTeam.naam }));
          // Clear location if away, as it's likely different
          if (wedstrijd.locatie === 'Oisterwijk') setWedstrijd(prev => ({ ...prev, locatie: '' }));
        }
      }
    }
  }, [wedstrijd.team, wedstrijd.isThuis, teams]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await wedstrijdApi.create(wedstrijd);
      navigate('/wedstrijden');
    } catch (err) {
      setError('Er is een fout opgetreden bij het aanmaken van de wedstrijd.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setWedstrijd(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setWedstrijd(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Nieuwe Wedstrijd
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            {/* Row 1: Competition & Team Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Competitie</InputLabel>
                <Select
                  name="competitie"
                  value={wedstrijd.competitie}
                  onChange={handleSelectChange}
                  label="Competitie"
                >
                  <MenuItem value=""><em>Selecteer competitie</em></MenuItem>
                  {competitions.map(comp => (
                    <MenuItem key={comp._id} value={comp._id}>
                      {comp.naam}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!wedstrijd.competitie}>
                <InputLabel>Mijn Team</InputLabel>
                <Select
                  name="team"
                  value={wedstrijd.team}
                  onChange={handleSelectChange}
                  label="Mijn Team"
                >
                  <MenuItem value=""><em>Selecteer team</em></MenuItem>
                  {filteredTeams.map(team => (
                    <MenuItem key={team._id} value={team._id}>
                      {team.naam}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Row 2: Date & Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Datum"
                type="date"
                name="datum"
                value={wedstrijd.datum}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tijd"
                type="time"
                name="tijd"
                value={wedstrijd.tijd}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Row 3: Home/Away Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={wedstrijd.isThuis}
                    onChange={handleChange}
                    name="isThuis"
                    color="primary"
                  />
                }
                label={wedstrijd.isThuis ? "Thuiswedstrijd" : "Uitwedstrijd"}
              />
            </Grid>

            {/* Row 4: Teams Text Fields (Auto-filled but editable) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Thuisteam"
                name="thuisteam"
                value={wedstrijd.thuisteam}
                onChange={handleChange}
                required
                helperText={wedstrijd.isThuis ? "Wordt automatisch ingevuld (Jouw Team)" : "Vul hier de tegenstander in"}
                disabled={wedstrijd.isThuis}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Uitteam"
                name="uitteam"
                value={wedstrijd.uitteam}
                onChange={handleChange}
                required
                helperText={!wedstrijd.isThuis ? "Wordt automatisch ingevuld (Jouw Team)" : "Vul hier de tegenstander in"}
                disabled={!wedstrijd.isThuis}
              />
            </Grid>

            {/* Row 5: Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Locatie"
                name="locatie"
                value={wedstrijd.locatie}
                onChange={handleChange}
                placeholder="bijv. Oisterwijk"
                required
              />
            </Grid>

            {/* Row 6: Actions */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={wedstrijd.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="gepland">Gepland</MenuItem>
                  <MenuItem value="in_behandeling">In behandeling</MenuItem>
                  <MenuItem value="afgerond">Afgerond</MenuItem>
                  <MenuItem value="geannuleerd">Geannuleerd</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/wedstrijden')}
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !wedstrijd.team || !wedstrijd.competitie}
                >
                  Opslaan
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewMatch;
