import React, { useState, useEffect } from 'react';
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  TablePagination,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { clubApi, wedstrijdApi } from '../services/api';
import { Club, Match } from '../types';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Club;
  label: string;
}

const headCells: HeadCell[] = [
  { id: 'naam', label: 'Clubnaam' },
  { id: 'plaats', label: 'Plaats' },
];

const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Pagination
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Club>('naam');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      console.log('Fetching clubs...');
      const response = await clubApi.getAll();
      console.log('Fetched clubs response:', response);
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    naam: '',
    plaats: '',
  });

  const handleOpenDialog = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      setFormData({
        naam: club.naam,
        plaats: club.plaats,
      });
    } else {
      setEditingClub(null);
      setFormData({
        naam: '',
        plaats: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClub(null);
    setFormData({
      naam: '',
      plaats: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClub) {
        await clubApi.update(editingClub._id, {
          naam: formData.naam,
          plaats: formData.plaats
        });
      } else {
        await clubApi.create({
          naam: formData.naam,
          plaats: formData.plaats
        });
      }
      fetchClubs();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving club:', error);
    }
  };

  const handleDelete = async (clubId: string) => {
    if (window.confirm('Weet je zeker dat je deze club wilt verwijderen?')) {
      try {
        await clubApi.delete(clubId);
        fetchClubs();
      } catch (error) {
        console.error('Error deleting club:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Import functionality
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [availableClubs, setAvailableClubs] = useState<{ naam: string; team: string }[]>([]);
  const [selectedImportClubs, setSelectedImportClubs] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (property: keyof Club) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and Sort logic
  const filteredClubs = clubs.filter(club =>
    club.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.plaats.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedClubs = filteredClubs.sort((a, b) => {
    const isAsc = order === 'asc';
    const aValue = a[orderBy] || '';
    const bValue = b[orderBy] || '';

    // Check if property is string before using localeCompare
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredClubs.length) : 0;
  const visibleClubs = sortedClubs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  // Import Logic (Existing logic preserved)
  const handleOpenImportDialog = async () => {
    setImportLoading(true);
    try {
      const matchesResponse = await wedstrijdApi.getAll();
      const matches = matchesResponse.data;
      const foundClubs = new Map<string, string>();

      matches.forEach((match: Match) => {
        const potentialNames = [match.thuisteam, match.uitteam].filter(Boolean);
        potentialNames.forEach(rawName => {
          if (rawName.includes('Team 1')) return;
          let cleanName = rawName.replace(/ \d+$/, '').trim();
          cleanName = cleanName.replace(/ [H|D|G|J|M]\d+$/, '').trim();
          const exists = clubs.some(c => c.naam.toLowerCase() === cleanName.toLowerCase());
          if (!exists && cleanName.length > 2) {
            if (!foundClubs.has(cleanName)) {
              foundClubs.set(cleanName, rawName);
            }
          }
        });
      });

      const newClubs = Array.from(foundClubs.entries()).map(([naam, team]) => ({ naam, team }));
      console.log('Potential clubs found for import:', newClubs);
      setAvailableClubs(newClubs);
      setSelectedImportClubs(newClubs.map(c => c.naam));
      setImportDialogOpen(true);
    } catch (error) {
      console.error('Fout bij zoeken naar clubs:', error);
      alert('Kon geen clubs ophalen uit wedstrijden.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportClubs = async () => {
    setImportLoading(true);
    try {
      let importedCount = 0;
      for (const clubNaam of selectedImportClubs) {
        await clubApi.create({
          naam: clubNaam,
          plaats: 'Onbekend (vul aan)'
        });
        importedCount++;
      }
      alert(`${importedCount} clubs geïmporteerd!`);
      fetchClubs();
      setImportDialogOpen(false);
    } catch (error) {
      console.error('Fout bij importeren:', error);
      alert('Er ging iets mis met importeren.');
    } finally {
      setImportLoading(false);
    }
  };

  const toggleImportSelection = (naam: string) => {
    setSelectedImportClubs(prev =>
      prev.includes(naam) ? prev.filter(c => c !== naam) : [...prev, naam]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Clubs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Zoeken..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<SystemUpdateAltIcon />}
            onClick={handleOpenImportDialog}
          >
            Importeer
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nieuwe Club
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    <strong>{headCell.label}</strong>
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right"><strong>Acties</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleClubs.map((club) => (
              <TableRow key={club._id} hover>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {club.naam}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5, fontSize: 18 }} />
                    {club.plaats || '-'}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Bewerken">
                    <IconButton size="small" onClick={() => handleOpenDialog(club)} sx={{ mr: 1, color: 'primary.main' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Verwijderen">
                    <IconButton size="small" onClick={() => handleDelete(club._id)} sx={{ color: 'error.main' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={3} align="center">Laden...</TableCell>
              </TableRow>
            )}
            {!loading && visibleClubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">Geen clubs gevonden.</TableCell>
              </TableRow>
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={3} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredClubs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rijen per pagina:"
        />
      </TableContainer>

      {/* Helper Dialogs (Edit/Create & Import) */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClub ? 'Club Bewerken' : 'Nieuwe Club'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            name="naam"
            label="Clubnaam"
            fullWidth
            variant="outlined"
            value={formData.naam}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="plaats"
            label="Plaats"
            fullWidth
            variant="outlined"
            value={formData.plaats}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Annuleren</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.naam}>Opslaan</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Importeer Clubs</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            De volgende clubs zijn gevonden in je wedstrijdprogramma, maar staan nog niet in je clublijst:
          </Typography>
          {/* Same import list logic as before, abbreviated for brevity in this full-write but functionality kept */}
          {availableClubs.length === 0 ? (
            <Typography sx={{ py: 2, fontStyle: 'italic' }}>Geen nieuwe clubs gevonden.</Typography>
          ) : (
            <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>Clubnaam (geschat)</TableCell>
                    <TableCell>Gevonden via</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableClubs.map((club) => (
                    <TableRow key={club.naam} hover onClick={() => toggleImportSelection(club.naam)} sx={{ cursor: 'pointer' }}>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedImportClubs.includes(club.naam)}
                          onChange={() => { }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{club.naam}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{club.team}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setImportDialogOpen(false)}>Sluiten</Button>
          {availableClubs.length > 0 && (
            <Button
              onClick={handleImportClubs}
              variant="contained"
              disabled={selectedImportClubs.length === 0 || importLoading}
            >
              {importLoading ? 'Bezig...' : `Importeer (${selectedImportClubs.length})`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Clubs;
