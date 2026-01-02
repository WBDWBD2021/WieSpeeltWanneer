import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    Box,
    Chip,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { teamApi, competitionApi, clubApi, spelerApi } from '../services/api';
import { Team, Competition, Club, Player } from '../types';

const Teams: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);

    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedIds(teams.map((n) => n._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        const selectedIndex = selectedIds.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedIds, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedIds.slice(1));
        } else if (selectedIndex === selectedIds.length - 1) {
            newSelected = newSelected.concat(selectedIds.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedIds.slice(0, selectedIndex),
                selectedIds.slice(selectedIndex + 1),
            );
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Weet je zeker dat je ${selectedIds.length} teams wilt verwijderen?`)) {
            try {
                await Promise.all(selectedIds.map(id => teamApi.delete(id)));
                setSelectedIds([]);
                loadData();
            } catch (err) {
                console.error('Error deleting teams', err);
                setError('Kon niet alle teams verwijderen.');
            }
        }
    };

    // Form Data
    const [formData, setFormData] = useState<{
        naam: string;
        club: string;
        competitie: string;
        captain: string;
        spelers: string[];
    }>({
        naam: '',
        club: '',
        competitie: '',
        captain: '',
        spelers: []
    });

    const [error, setError] = useState<string | null>(null);

    const [orderBy, setOrderBy] = useState<keyof Team>('naam');
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        loadData();
    }, []);

    const handleRequestSort = (property: keyof Team) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getNameValue = (obj: any) => {
        if (!obj) return '';
        return typeof obj === 'object' ? obj.naam : obj;
    };

    const getSortedTeams = () => {
        return [...teams].sort((a, b) => {
            let valueA: any = a[orderBy];
            let valueB: any = b[orderBy];

            if (orderBy === 'club') {
                valueA = getNameValue(a.club);
                valueB = getNameValue(b.club);
            } else if (orderBy === 'competitie') {
                valueA = getNameValue(a.competitie);
                valueB = getNameValue(b.competitie);
            }

            if (valueA === undefined || valueA === null) return 1;
            if (valueB === undefined || valueB === null) return -1;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return orderDirection === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            if (valueA < valueB) return orderDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return orderDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const loadData = async () => {
        try {
            const [teamsRes, compsRes, clubsRes, playersRes] = await Promise.all([
                teamApi.getAll(),
                competitionApi.getAll(),
                clubApi.getAll(),
                spelerApi.getAll()
            ]);
            setTeams(teamsRes.data);
            setCompetitions(compsRes.data);
            setClubs(clubsRes.data);
            setPlayers(playersRes.data.filter(p => p.isActief));
        } catch (err) {
            console.error('Error loading data', err);
            setError('Kon data niet laden.');
        }
    };

    const handleOpen = (team?: Team) => {
        if (team) {
            setEditMode(true);
            setSelectedTeam(team);
            // Ensure we handle populated objects vs strings
            setFormData({
                naam: team.naam,
                club: typeof team.club === 'object' ? (team.club as any)._id : team.club,
                competitie: typeof team.competitie === 'object' ? (team.competitie as any)._id : team.competitie,
                captain: team.captain ? (typeof team.captain === 'string' ? team.captain : (team.captain as any)._id) : '',
                spelers: (team.spelers || []).map((s: any) => typeof s === 'string' ? s : s._id)
            });
        } else {
            setEditMode(false);
            setSelectedTeam(null);
            setFormData({
                naam: '',
                club: '',
                competitie: '',
                captain: '',
                spelers: []
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                captain: formData.captain || undefined, // Send undefined if empty string
            };

            if (editMode && selectedTeam) {
                await teamApi.update(selectedTeam._id, payload);
            } else {
                await teamApi.create(payload as any);
            }
            handleClose();
            loadData(); // Reload to refresh populated fields
        } catch (err) {
            console.error('Error saving team', err);
            setError('Er ging iets mis bij het opslaan.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Weet je zeker dat je dit team wilt verwijderen?')) {
            try {
                await teamApi.delete(id);
                loadData();
            } catch (err) {
                console.error('Error deleting team', err);
                setError('Kon team niet verwijderen.');
            }
        }
    };

    const getName = (obj: any) => typeof obj === 'object' ? obj?.naam : obj;
    const getPlayerName = (id: string) => {
        const p = players.find(player => player._id === id);
        return p ? p.naam : 'Onbekend';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Actions Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Teams
                    </Typography>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            size="small"
                        >
                            Verwijder ({selectedIds.length})
                        </Button>
                    )}
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Nieuw Team
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < teams.length}
                                    checked={teams.length > 0 && selectedIds.length === teams.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell onClick={() => handleRequestSort('naam')} sx={{ cursor: 'pointer' }}><strong>Naam {orderBy === 'naam' && (orderDirection === 'asc' ? '↑' : '↓')}</strong></TableCell>
                            <TableCell onClick={() => handleRequestSort('club')} sx={{ cursor: 'pointer' }}><strong>Club {orderBy === 'club' && (orderDirection === 'asc' ? '↑' : '↓')}</strong></TableCell>
                            <TableCell onClick={() => handleRequestSort('competitie')} sx={{ cursor: 'pointer' }}><strong>Competitie {orderBy === 'competitie' && (orderDirection === 'asc' ? '↑' : '↓')}</strong></TableCell>
                            <TableCell><strong>Spelers</strong></TableCell>
                            <TableCell align="right"><strong>Acties</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getSortedTeams().map((team) => {
                            const isSelected = selectedIds.indexOf(team._id) !== -1;
                            return (
                                <TableRow
                                    key={team._id}
                                    hover
                                    selected={isSelected}
                                    sx={{ '&.Mui-selected': { bgcolor: 'primary.lighter' } }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isSelected}
                                            onChange={() => handleSelectOne(team._id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{team.naam}</TableCell>
                                    <TableCell>{getName(team.club)}</TableCell>
                                    <TableCell>{getName(team.competitie)}</TableCell>
                                    <TableCell>
                                        {team.spelers && team.spelers.length > 0 ? (
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {team.spelers.slice(0, 3).map((s: any) => (
                                                    <Chip key={s._id || s} label={getName(s)} size="small" />
                                                ))}
                                                {team.spelers.length > 3 && <Chip label={`+${team.spelers.length - 3}`} size="small" variant="outlined" />}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpen(team)} sx={{ mr: 1, color: 'primary.main' }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(team._id)} sx={{ color: 'error.main' }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {teams.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    Geen teams gevonden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Team Bewerken' : 'Nieuw Team'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Team Naam"
                        variant="outlined"
                        margin="normal"
                        value={formData.naam}
                        onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                        placeholder="bijv. Heren 1"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Club"
                        variant="outlined"
                        margin="normal"
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    >
                        {clubs.map(c => (
                            <MenuItem key={c._id} value={c._id}>{c.naam}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Competitie"
                        variant="outlined"
                        margin="normal"
                        value={formData.competitie}
                        onChange={(e) => setFormData({ ...formData, competitie: e.target.value })}
                    >
                        {competitions.map(c => (
                            <MenuItem key={c._id} value={c._id}>{c.naam}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Captain"
                        variant="outlined"
                        margin="normal"
                        value={formData.captain}
                        onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
                    >
                        <MenuItem value="">Geen captain</MenuItem>
                        {players.map(p => (
                            <MenuItem key={p._id} value={p._id}>{p.naam}</MenuItem>
                        ))}
                    </TextField>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="spelers-select-label">Selecteer Spelers</InputLabel>
                        <Select
                            labelId="spelers-select-label"
                            id="spelers-select"
                            multiple
                            value={formData.spelers}
                            onChange={(e) => setFormData({ ...formData, spelers: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                            input={<OutlinedInput label="Selecteer Spelers" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={getPlayerName(value)} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {players.map((p) => (
                                <MenuItem key={p._id} value={p._id}>
                                    <Checkbox checked={formData.spelers.indexOf(p._id) > -1} />
                                    <ListItemText primary={p.naam} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} color="inherit">Annuleren</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.naam || !formData.club || !formData.competitie}>Opslaan</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Teams;
