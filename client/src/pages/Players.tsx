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
  Chip,
  Card,
  CardContent,
  Avatar,
  Box,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { spelerApi } from '../services/api';
import { Player } from '../types';

const Players: React.FC = () => {
  const [spelers, setSpelers] = useState<Player[]>([]);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Spelers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/spelers/nieuw')}
        >
          Nieuwe Speler
        </Button>
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {spelers.map((speler) => (
            <Card
              key={speler._id}
              onClick={() => navigate(`/spelers/${speler._id}`)}
              sx={{ cursor: 'pointer', '&:active': { bgcolor: 'action.hover' } }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  {getInitials(speler.naam)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {speler.naam}
                    </Typography>
                    {speler.isCaptain && (
                      <Chip label="C" color="primary" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {speler.club || 'Geen club'}
                  </Typography>
                  <Typography variant="body2" color={speler.isActief ? 'success.main' : 'error.main'}>
                    {speler.isActief ? '● Actief' : '● Inactief'}
                  </Typography>
                </Box>
                <ChevronRightIcon color="action" />
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
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
      )}
    </Container>
  );
};

export default Players; 