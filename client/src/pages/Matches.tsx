import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ImportDialog from '../components/ImportDialog';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  SelectChangeEvent,
  Chip,
  Alert,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListIcon from '@mui/icons-material/FilterList';
import { wedstrijdApi } from '../services/api';
import { Match, getCompetitieName, getCompetitieId } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`competition-tabpanel-${index}`}
      aria-labelledby={`competition-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

const Matches: React.FC = () => {
  const [wedstrijden, setWedstrijden] = useState<Match[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [wedstrijdToDelete, setWedstrijdToDelete] = useState<Match | null>(null);
  const [wedstrijdToEdit, setWedstrijdToEdit] = useState<Match | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string[]>(['gepland', 'in_behandeling']);
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Bulk functionality state
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Genereer competitie opties voor meerdere jaren
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const competitieOptions = years.flatMap(year => [
    { value: `voorjaar-${year}`, label: `Voorjaarscompetitie ${year}` },
    { value: `zomeravond-${year}`, label: `Zomeravondcompetitie ${year}` },
    { value: `najaar-${year}`, label: `Najaarscompetitie ${year}` },
    { value: `winter-${year}`, label: `Wintercompetitie ${year}/${year + 1}` }
  ]);

  useEffect(() => {
    console.log('Matches component mounted');
    laadWedstrijden();
  }, []);

  const laadWedstrijden = async () => {
    try {
      console.log('Laden van wedstrijden gestart');
      const response = await wedstrijdApi.getAll();
      console.log('Wedstrijden opgehaald:', response.data);
      setWedstrijden(response.data);
      // Reset selection when reloading
      setSelectedMatches([]);
    } catch (error) {
      console.error('Fout bij het laden van wedstrijden:', error);
      alert('Fout bij laden wedstrijden. Check console.');
    }
  };

  const isWedstrijdInVerleden = (datum: string): boolean => {
    const wedstrijdDatum = new Date(datum);
    const vandaag = new Date();
    vandaag.setHours(0, 0, 0, 0);
    return wedstrijdDatum < vandaag;
  };

  const heeftVerkeerdStatus = (wedstrijd: Match): boolean => {
    return isWedstrijdInVerleden(wedstrijd.datum) &&
      (wedstrijd.status === 'gepland' || wedstrijd.status === 'in_behandeling');
  };

  const updateVerouderdeStatussen = async () => {
    try {
      const teUpdatenWedstrijden = wedstrijden.filter(heeftVerkeerdStatus);

      if (teUpdatenWedstrijden.length === 0) {
        alert('Alle wedstrijden hebben de juiste status');
        return;
      }

      const updates = teUpdatenWedstrijden.map(wedstrijd =>
        wedstrijdApi.update(wedstrijd._id, { status: 'afgerond' })
      );

      await Promise.all(updates);
      await laadWedstrijden();
      alert(`✅ ${teUpdatenWedstrijden.length} wedstrijd${teUpdatenWedstrijden.length > 1 ? 'en' : ''} bijgewerkt naar status "afgerond"`);
    } catch (error) {
      console.error('Fout bij het bijwerken van statussen:', error);
      alert('Er is een fout opgetreden bij het bijwerken van de statussen');
    }
  };

  const handleDeleteClick = (wedstrijd: Match, e: React.MouseEvent) => {
    e.stopPropagation();
    setWedstrijdToDelete(wedstrijd);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (wedstrijd: Match, e: React.MouseEvent) => {
    e.stopPropagation();
    setWedstrijdToEdit(wedstrijd);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (wedstrijdToDelete) {
      try {
        await wedstrijdApi.delete(wedstrijdToDelete._id);
        setDeleteDialogOpen(false);
        setWedstrijdToDelete(null);
        laadWedstrijden();
      } catch (error) {
        console.error('Fout bij het verwijderen van wedstrijd:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWedstrijdToDelete(null);
  };

  // Bulk actions
  const handleSelectMatch = (id: string) => {
    setSelectedMatches(prev => {
      if (prev.includes(id)) {
        return prev.filter(matchId => matchId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (filteredMatches: Match[]) => {
    if (selectedMatches.length === filteredMatches.length && filteredMatches.length > 0) {
      setSelectedMatches([]); // Unselect all
    } else {
      setSelectedMatches(filteredMatches.map(m => m._id)); // Select all visible
    }
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      // Execute all deletes
      await Promise.all(selectedMatches.map(id => wedstrijdApi.delete(id)));
      setBulkDeleteDialogOpen(false);
      setSelectedMatches([]);
      await laadWedstrijden();
      alert(`${selectedMatches.length} wedstrijden verwijderd.`);
    } catch (error) {
      console.error('Fout bij verwijderen wedstrijden:', error);
      alert('Er is een fout opgetreden bij het verwijderen van de wedstrijden.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wedstrijdToEdit) {
      try {
        await wedstrijdApi.update(wedstrijdToEdit._id, wedstrijdToEdit);
        setEditDialogOpen(false);
        setWedstrijdToEdit(null);
        laadWedstrijden();
      } catch (error) {
        console.error('Fout bij het bijwerken van wedstrijd:', error);
      }
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setWedstrijdToEdit(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (wedstrijdToEdit) {
      setWedstrijdToEdit({
        ...wedstrijdToEdit,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleEditSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (wedstrijdToEdit && name) {
      setWedstrijdToEdit({
        ...wedstrijdToEdit,
        [name]: value
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSelectedMatches([]); // Clear selection on tab change
  };

  const handleStatusFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string[],
  ) => {
    if (newFilter.length > 0) {
      setStatusFilter(newFilter);
      setSelectedMatches([]); // Clear selection on filter change
    }
  };

  const filterWedstrijden = (competitie: 'voorjaar' | 'najaar' | 'winter' | 'zomeravond' | 'alle') => {
    let filtered = wedstrijden;

    // Filter op competitie
    if (competitie !== 'alle') {
      filtered = filtered.filter(w => {
        const comp = w.competitie;
        if (!comp) return false;
        if (typeof comp === 'string') return comp.startsWith(competitie);
        return comp.seizoen === competitie;
      });
    }

    // Filter op status
    if (statusFilter.length > 0) {
      filtered = filtered.filter(w => statusFilter.includes(w.status));
    }

    // Sorteer op datum (nieuwste eerst voor gepland, oudste eerst voor afgerond)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.datum).getTime();
      const dateB = new Date(b.datum).getTime();
      return dateB - dateA;
    });
  };

  const getCompetitieLabel = (competitie?: string | any) => {
    if (!competitie) return <Chip label="Geen competitie" size="small" />;

    let seizoen = '';
    let jaar = 0;

    if (typeof competitie === 'object' && competitie.seizoen) {
      seizoen = competitie.seizoen;
      jaar = competitie.jaar;
    } else if (typeof competitie === 'string') {
      const parts = competitie.split('-');
      seizoen = parts[0];
      jaar = parseInt(parts[1]);
    } else {
      return <Chip label="Onbekend" size="small" />;
    }

    const jaarNummer = jaar;

    let label = `${seizoen} ${jaar}`;
    let color: 'success' | 'primary' | 'info' | 'warning' | 'default' = 'default';

    if (seizoen === 'voorjaar') {
      label = `Voorjaar ${jaar}`;
      color = 'success';
    } else if (seizoen === 'najaar') {
      label = `Najaar ${jaar}`;
      color = 'primary';
    } else if (seizoen === 'winter') {
      label = `Winter ${jaar}/${jaarNummer + 1}`;
      color = 'info';
    } else if (seizoen === 'zomeravond') {
      label = `Zomeravond ${jaar}`;
      color = 'warning';
    }

    return (
      <Chip
        label={label}
        size="small"
        color={color}
      />
    );
  };

  const renderWedstrijdTable = (competitie: 'voorjaar' | 'najaar' | 'winter' | 'zomeravond' | 'alle') => {
    const gefilterdWedstrijden = filterWedstrijden(competitie);
    const verkeerdStatussenCount = gefilterdWedstrijden.filter(heeftVerkeerdStatus).length;

    const allSelected = gefilterdWedstrijden.length > 0 && selectedMatches.length === gefilterdWedstrijden.length;
    const indeterminate = selectedMatches.length > 0 && selectedMatches.length < gefilterdWedstrijden.length;

    return (
      <>
        {verkeerdStatussenCount > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<UpdateIcon />}
                onClick={updateVerouderdeStatussen}
              >
                Update Statussen
              </Button>
            }
          >
            Er {verkeerdStatussenCount === 1 ? 'is' : 'zijn'} {verkeerdStatussenCount} wedstrijd{verkeerdStatussenCount > 1 ? 'en' : ''} in het verleden met status "gepland" of "in behandeling"
          </Alert>
        )}

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <FilterListIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Filter status:
            </Typography>
            <ToggleButtonGroup
              value={statusFilter}
              onChange={handleStatusFilterChange}
              size="small"
            >
              <ToggleButton value="gepland">Gepland</ToggleButton>
              <ToggleButton value="in_behandeling">Bezig</ToggleButton>
              <ToggleButton value="afgerond">Afgerond</ToggleButton>
              <ToggleButton value="geannuleerd">X</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {selectedMatches.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDeleteClick}
            >
              Verwijder Selectie ({selectedMatches.length})
            </Button>
          )}
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={() => handleSelectAll(gefilterdWedstrijden)}
                  />
                </TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Tijd</TableCell>
                <TableCell>Thuisteam</TableCell>
                <TableCell>Uitteam</TableCell>
                <TableCell>Locatie</TableCell>
                {competitie === 'alle' && <TableCell>Competitie</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell>Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gefilterdWedstrijden.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={competitie === 'alle' ? 9 : 8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Geen wedstrijden gevonden voor deze filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                gefilterdWedstrijden.map((wedstrijd) => {
                  const statusNietCorrect = heeftVerkeerdStatus(wedstrijd);
                  const isSelected = selectedMatches.includes(wedstrijd._id);

                  return (
                    <TableRow
                      key={wedstrijd._id}
                      hover
                      selected={isSelected}
                      onClick={() => navigate(`/wedstrijden/${wedstrijd._id}`)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: statusNietCorrect ? 'warning.light' : 'inherit',
                        '&:hover': {
                          backgroundColor: statusNietCorrect ? 'warning.main' : undefined
                        }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectMatch(wedstrijd._id);
                          }}
                        />
                      </TableCell>
                      <TableCell>{new Date(wedstrijd.datum).toLocaleDateString('nl-NL')}</TableCell>
                      <TableCell>{wedstrijd.tijd}</TableCell>
                      <TableCell>{wedstrijd.thuisteam}</TableCell>
                      <TableCell>{wedstrijd.uitteam}</TableCell>
                      <TableCell>{wedstrijd.locatie}</TableCell>
                      {competitie === 'alle' && (
                        <TableCell>{getCompetitieLabel(wedstrijd.competitie)}</TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {statusNietCorrect && (
                            <WarningIcon color="warning" fontSize="small" />
                          )}
                          <Chip
                            label={wedstrijd.status}
                            size="small"
                            color={statusNietCorrect ? 'warning' : 'default'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={(e) => handleEditClick(wedstrijd, e)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => handleDeleteClick(wedstrijd, e)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  const verkeerdStatussenCount = wedstrijden.filter(heeftVerkeerdStatus).length;

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Wedstrijden
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/wedstrijden/nieuw')}
          >
            Nieuwe Wedstrijd
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CloudDownloadIcon />}
            onClick={() => setImportDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Importeren
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<OpenInNewIcon />}
            href="https://mijnknltb.nl/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mr: 1 }}
          >
            MijnKNLTB
          </Button>

          {verkeerdStatussenCount > 0 && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<UpdateIcon />}
              onClick={updateVerouderdeStatussen}
            >
              Update Statussen ({verkeerdStatussenCount})
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Alle Wedstrijden" />
          <Tab label="Voorjaarscompetitie" />
          <Tab label="Zomeravondcompetitie" />
          <Tab label="Najaarscompetitie" />
          <Tab label="Wintercompetitie" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderWedstrijdTable('alle')}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderWedstrijdTable('voorjaar')}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderWedstrijdTable('zomeravond')}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {renderWedstrijdTable('najaar')}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {renderWedstrijdTable('winter')}
      </TabPanel>

      {/* Single Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Wedstrijd verwijderen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je deze wedstrijd wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuleren</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
      >
        <DialogTitle>Meerdere wedstrijden verwijderen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je {selectedMatches.length} wedstrijden wilt verwijderen?
            Dit kan niet ongedaan worden gemaakt.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>Annuleren</Button>
          <Button onClick={handleBulkDeleteConfirm} color="error" autoFocus>
            Verwijderen ({selectedMatches.length})
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Wedstrijd bewerken</DialogTitle>
        <DialogContent>
          {wedstrijdToEdit && (
            <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Datum"
                type="date"
                name="datum"
                value={wedstrijdToEdit.datum.split('T')[0]}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Tijd"
                type="time"
                name="tijd"
                value={wedstrijdToEdit.tijd}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thuisteam"
                    name="thuisteam"
                    value={wedstrijdToEdit.thuisteam || ''}
                    onChange={handleEditChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Uitteam"
                    name="uitteam"
                    value={wedstrijdToEdit.uitteam || ''}
                    onChange={handleEditChange}
                    margin="normal"
                    required
                  />
                </Grid>
              </Grid>
              <FormControlLabel
                control={
                  <Switch
                    checked={wedstrijdToEdit.isThuis}
                    onChange={handleEditChange}
                    name="isThuis"
                  />
                }
                label="Thuiswedstrijd"
                sx={{ mt: 2, mb: 1 }}
              />
              <TextField
                fullWidth
                label="Locatie"
                name="locatie"
                value={wedstrijdToEdit.locatie}
                onChange={handleEditChange}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Competitie</InputLabel>
                <Select
                  name="competitie"
                  value={(() => {
                    // Logic to match the Option values ("voorjaar-2025")
                    if (!wedstrijdToEdit.competitie) return '';
                    if (typeof wedstrijdToEdit.competitie === 'string') return wedstrijdToEdit.competitie;
                    // If object, reconstruct the key
                    const c = wedstrijdToEdit.competitie;
                    return `${c.seizoen}-${c.jaar}`;
                  })()}
                  onChange={handleEditSelectChange}
                  label="Competitie"
                >
                  <MenuItem value="">Geen competitie</MenuItem>
                  {competitieOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={wedstrijdToEdit.status}
                  onChange={handleEditSelectChange}
                  label="Status"
                >
                  <MenuItem value="gepland">Gepland</MenuItem>
                  <MenuItem value="in_behandeling">In behandeling</MenuItem>
                  <MenuItem value="afgerond">Afgerond</MenuItem>
                  <MenuItem value="geannuleerd">Geannuleerd</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Annuleren</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={laadWedstrijden}
      />
    </Container>
  );
};

export default Matches;
