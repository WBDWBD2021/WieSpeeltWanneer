import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { spelerApi } from '../services/api';
import { Player } from '../types';

const Players: React.FC = () => {
  const [spelers, setSpelers] = useState<Player[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const laadSpelers = async () => {
      try {
        const response = await spelerApi.getAll();
        setSpelers(response.data);
      } catch (error) {
        console.error('Fout bij het laden van spelers:', error);
      }
    };

    laadSpelers();
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Spelers
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate('/spelers/nieuw')}
        sx={{ mb: 2 }}
      >
        Nieuwe Speler
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Naam</TableCell>
              <TableCell>Club</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefoon</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Geslacht</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {spelers.map((speler) => (
              <TableRow
                key={speler._id}
                hover
                onClick={() => navigate(`/spelers/${speler._id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {speler.naam}
                  {speler.isCaptain && (
                    <Chip
                      label="C"
                      color="primary"
                      size="small"
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      title="Aanvoerder"
                    />
                  )}
                </TableCell>
                <TableCell>{speler.club || '-'}</TableCell>
                <TableCell>{speler.email}</TableCell>
                <TableCell>{speler.telefoon}</TableCell>
                <TableCell>{speler.niveau}</TableCell>
                <TableCell>{speler.geslacht || 'Man'}</TableCell>
                <TableCell>{speler.isActief ? 'Actief' : 'Inactief'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Players; 