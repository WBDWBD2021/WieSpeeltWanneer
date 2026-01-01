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
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { competitionApi } from '../services/api';
import { Competition } from '../types';

const Competitions: React.FC = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
    const [formData, setFormData] = useState<Partial<Competition>>({
        naam: '',
        seizoen: 'voorjaar',
        jaar: new Date().getFullYear(),
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCompetitions();
    }, []);

    const loadCompetitions = async () => {
        try {
            const response = await competitionApi.getAll();
            setCompetitions(response.data);
        } catch (err) {
            console.error('Error loading competitions', err);
            setError('Kon competities niet laden.');
        }
    };

    const handleOpen = (competition?: Competition) => {
        if (competition) {
            setEditMode(true);
            setSelectedCompetition(competition);
            setFormData({
                naam: competition.naam,
                seizoen: competition.seizoen,
                jaar: competition.jaar,
            });
        } else {
            setEditMode(false);
            setSelectedCompetition(null);
            setFormData({
                naam: '',
                seizoen: 'voorjaar',
                jaar: new Date().getFullYear(),
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
            if (editMode && selectedCompetition) {
                await competitionApi.update(selectedCompetition._id, formData);
            } else {
                await competitionApi.create(formData as Competition);
            }
            handleClose();
            loadCompetitions();
        } catch (err) {
            console.error('Error saving competition', err);
            setError('Er ging iets mis bij het opslaan.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Weet je zeker dat je deze competitie wilt verwijderen?')) {
            try {
                await competitionApi.delete(id);
                loadCompetitions();
            } catch (err) {
                console.error('Error deleting competition', err);
                setError('Kon competitie niet verwijderen.');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Competities
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Nieuwe Competitie
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell><strong>Naam</strong></TableCell>
                            <TableCell><strong>Seizoen</strong></TableCell>
                            <TableCell><strong>Jaar</strong></TableCell>
                            <TableCell align="right"><strong>Acties</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {competitions.map((comp) => (
                            <TableRow key={comp._id} hover>
                                <TableCell>{comp.naam}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{comp.seizoen}</TableCell>
                                <TableCell>{comp.jaar}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(comp)} sx={{ mr: 1, color: 'primary.main' }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(comp._id)} sx={{ color: 'error.main' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {competitions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    Geen competities gevonden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Competitie Bewerken' : 'Nieuwe Competitie'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Naam"
                        variant="outlined"
                        margin="normal"
                        value={formData.naam}
                        onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                        placeholder="bijv. Voorjaarscompetitie 2025"
                    />
                    <TextField
                        select
                        fullWidth
                        label="Seizoen"
                        variant="outlined"
                        margin="normal"
                        value={formData.seizoen}
                        onChange={(e) => setFormData({ ...formData, seizoen: e.target.value as any })}
                    >
                        <MenuItem value="voorjaar">Voorjaar</MenuItem>
                        <MenuItem value="najaar">Najaar</MenuItem>
                        <MenuItem value="winter">Winter</MenuItem>
                        <MenuItem value="zomeravond">Zomeravond</MenuItem>
                        <MenuItem value="overig">Overig</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Jaar"
                        type="number"
                        variant="outlined"
                        margin="normal"
                        value={formData.jaar}
                        onChange={(e) => setFormData({ ...formData, jaar: parseInt(e.target.value) })}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} color="inherit">Annuleren</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.naam}>Opslaan</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Competitions;
