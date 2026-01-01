import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
  Avatar
} from '@mui/material';
import { spelerApi, clubApi } from '../services/api';

const NewPlayer: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    niveau: 7,
    geslacht: 'Man',
    club: '',
    isActief: true,
    isCaptain: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clubs, setClubs] = useState<string[]>([]);

  useEffect(() => {
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
    fetchClubs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const name = e.target.name;
    const value = e.target.value;
    // Handle checkbox separately if needed, but for Switch usually we check checked property.
    // However, SelectChangeEvent doesn't have checked.
    // Let's type it safely.

    if (name === 'isActief' || name === 'isCaptain') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name as string]: value }));
    }
  };

  const handleClubChange = (event: any, newValue: string | null) => {
    setFormData(prev => ({ ...prev, club: newValue || '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.naam) newErrors.naam = 'Naam is verplicht';
    if (!formData.email) newErrors.email = 'Email is verplicht';
    if (!formData.telefoon) newErrors.telefoon = 'Telefoonnummer is verplicht';
    if (!formData.niveau) newErrors.niveau = 'Niveau is verplicht';

    const niveau = typeof formData.niveau === 'string' ? parseInt(formData.niveau) : formData.niveau;
    if (isNaN(niveau) || niveau < 1 || niveau > 9) {
      newErrors.niveau = 'Niveau moet tussen 1 en 9 liggen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await spelerApi.create({
        ...formData,
        niveau: typeof formData.niveau === 'string' ? parseInt(formData.niveau) : formData.niveau,
        geslacht: formData.geslacht as 'Man' | 'Vrouw'
      });
      navigate('/spelers');
    } catch (error) {
      console.error('Fout bij het aanmaken van speler:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Nieuwe Speler
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Naam"
          name="naam"
          value={formData.naam}
          onChange={handleChange}
          error={!!errors.naam}
          helperText={errors.naam}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Telefoon"
          name="telefoon"
          value={formData.telefoon}
          onChange={handleChange}
          error={!!errors.telefoon}
          helperText={errors.telefoon}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Niveau"
          name="niveau"
          type="number"
          value={formData.niveau}
          onChange={handleChange}
          error={!!errors.niveau}
          helperText={errors.niveau}
          margin="normal"
          inputProps={{ min: 1, max: 9 }}
        />

        <FormControl fullWidth margin="normal" error={!!errors.geslacht}>
          <InputLabel id="geslacht-label">Geslacht</InputLabel>
          <Select
            labelId="geslacht-label"
            id="geslacht"
            name="geslacht"
            value={formData.geslacht}
            label="Geslacht"
            onChange={handleChange}
          >
            <MenuItem value="Man">Man</MenuItem>
            <MenuItem value="Vrouw">Vrouw</MenuItem>
          </Select>
          {errors.geslacht && <Typography color="error" variant="caption">{errors.geslacht}</Typography>}
        </FormControl>

        <Autocomplete
          freeSolo
          options={clubs}
          value={formData.club}
          onChange={handleClubChange}
          onInputChange={(event, newInputValue) => {
            setFormData(prev => ({ ...prev, club: newInputValue }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="normal"
              label="Club"
              name="club"
              error={!!errors.club}
              helperText={errors.club}
            />
          )}
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.isActief}
              onChange={handleChange}
              name="isActief"
            />
          }
          label="Actief"
          sx={{ mt: 2 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.isCaptain}
              onChange={handleChange}
              name="isCaptain"
              color="secondary"
            />
          }
          label="Aanvoerder"
          sx={{ mt: 2, display: 'block' }}
        />
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            Opslaan
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/spelers')}
          >
            Annuleren
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NewPlayer; 