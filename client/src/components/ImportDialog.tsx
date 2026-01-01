import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  TextField
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { wedstrijdApi } from '../services/api';
import { Match } from '../types';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedMatch {
  datum: string;
  tijd: string;
  team: string;
  thuisteam: string;
  uitteam: string;
  isThuis: boolean;
  locatie: string;
  competitie: string;
  originalEvent: string;
  id: string; // temporary unique id for selection
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onSuccess }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedMatches, setParsedMatches] = useState<ParsedMatch[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [team, setTeam] = useState('');
  const [rawContent, setRawContent] = useState<string>('');

  // Helper: Parse ICS date string (e.g., 20250412T140000 or 20250412T140000Z)
  const parseICSDate = (icsDate: string) => {
    if (!icsDate) return null;

    const year = parseInt(icsDate.substring(0, 4));
    const month = parseInt(icsDate.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(icsDate.substring(6, 8));
    const hour = parseInt(icsDate.substring(9, 11));
    const minute = parseInt(icsDate.substring(11, 13));
    const second = parseInt(icsDate.substring(13, 15) || '0');

    let dateObj: Date;

    if (icsDate.endsWith('Z')) {
      // UTC time
      dateObj = new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      // Local time (assume standard date construction works for local)
      dateObj = new Date(year, month, day, hour, minute, second);
    }

    // Format back to YYYY-MM-DD and HH:mm in local time
    const localYear = dateObj.getFullYear();
    const localMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const localDay = String(dateObj.getDate()).padStart(2, '0');
    const localHour = String(dateObj.getHours()).padStart(2, '0');
    const localMinute = String(dateObj.getMinutes()).padStart(2, '0');

    return {
      dateStr: `${localYear}-${localMonth}-${localDay}`,
      timeStr: `${localHour}:${localMinute}`
    };
  };

  const parseICSFile = (content: string, userTeam: string) => {
    const events = content.split('BEGIN:VEVENT');
    const matches: ParsedMatch[] = [];

    events.forEach((eventChunk, index) => {
      if (!eventChunk.includes('END:VEVENT')) return;

      // Regex updated to handle parameters (e.g. SUMMARY;LANGUAGE=nl:...)
      // Matches "KEY" followed by optional parameters starting with ";" up to ":", then captures the value.
      const summaryMatch = eventChunk.match(/SUMMARY(?:;[^:]*)?:(.*)/);
      const dtStartMatch = eventChunk.match(/DTSTART(?:;[^:]*)?:(.*)/);
      const locationMatch = eventChunk.match(/LOCATION(?:;[^:]*)?:(.*)/);

      if (summaryMatch && dtStartMatch) {
        const summary = summaryMatch[1].trim();
        const dtStart = dtStartMatch[1].trim(); // e.g., 20250412T090000Z

        const dateTime = parseICSDate(dtStart);

        if (dateTime) {
          let thuisteam = '';
          let uitteam = '';
          let isThuis = true; // Default assumption

          // Clean up the summary and look for " - " separator
          const cleanSummary = summary.replace(/\\,/g, ',');

          if (cleanSummary.includes(' - ')) {
            const parts = cleanSummary.split(' - ');
            thuisteam = parts[0].trim();
            uitteam = parts[1].trim();

            const userTeamLower = userTeam.toLowerCase();
            if (userTeamLower) {
              if (thuisteam.toLowerCase().includes(userTeamLower)) {
                isThuis = true;
              } else if (uitteam.toLowerCase().includes(userTeamLower)) {
                isThuis = false;
              } else {
                // Fallback: assume first part is Home
                isThuis = true;
              }
            } else {
              isThuis = true; // Fallback default if no team specified
            }
          } else {
            // No separator? Fallback
            thuisteam = cleanSummary;
            uitteam = 'Onbekend';
          }

          const locatie = locationMatch ? locationMatch[1].trim().replace(/\\,/g, ',') : 'Onbekend';

          // Determine season from month
          const month = parseInt(dateTime.dateStr.split('-')[1]);
          const year = dateTime.dateStr.split('-')[0];
          let competitie = `voorjaar-${year}`;
          if (month >= 9 && month <= 11) competitie = `najaar-${year}`;
          if (month === 12 || month <= 2) competitie = `winter-${year}`; // Simple logic, refinement needed for year crossover
          if (month >= 5 && month <= 6 && summary.toLowerCase().includes('zomer')) competitie = `zomeravond-${year}`;

          matches.push({
            datum: dateTime.dateStr,
            tijd: dateTime.timeStr,
            team: isThuis ? 'Thuis' : 'Uit',
            thuisteam: thuisteam,
            uitteam: uitteam,
            isThuis: isThuis,
            locatie: locatie,
            competitie: competitie,
            originalEvent: summary,
            id: Math.random().toString(36).substr(2, 9)
          });
        }
      }
    });

    return matches;
  };

  // Auto-detect team name from all matches if not set
  const detectTeamName = (content: string) => {
    const events = content.split('BEGIN:VEVENT');
    const teamCounts: { [key: string]: number } = {};

    events.forEach(eventChunk => {
      if (!eventChunk.includes('END:VEVENT')) return;
      const summaryMatch = eventChunk.match(/SUMMARY(?:;[^:]*)?:(.*)/);
      if (summaryMatch) {
        const cleanSummary = summaryMatch[1].trim().replace(/\\,/g, ',');
        if (cleanSummary.includes(' - ')) {
          const parts = cleanSummary.split(' - ');
          parts.forEach(p => {
            const t = p.trim();
            teamCounts[t] = (teamCounts[t] || 0) + 1;
          });
        }
      }
    });

    // Find team with max count
    let maxTeam = '';
    let maxCount = 0;
    Object.entries(teamCounts).forEach(([t, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxTeam = t;
      }
    });

    // Heuristic: if a team appears in > 50% of events, it's likely "My Team"
    // (Actually it should be 100% of matches usually, but let's be safe)
    if (maxTeam && events.length > 2 && maxCount > (events.length / 2 - 2)) {
      return maxTeam;
    }
    return '';
  };

  // React to rawContent or team changes
  React.useEffect(() => {
    if (rawContent) {
      // If team is empty, try to detect it first
      let currentTeam = team;
      if (!currentTeam) {
        const detected = detectTeamName(rawContent);
        if (detected) {
          setTeam(detected);
          currentTeam = detected;
        }
      }

      const matches = parseICSFile(rawContent, currentTeam);
      setParsedMatches(matches);
      // Only select all if we haven't selected any yet (first load)
      if (selectedMatches.size === 0 && matches.length > 0) {
        setSelectedMatches(new Set(matches.map(m => m.id)));
      }
    }
  }, [rawContent, team]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawContent(content);
      // Error handling moved to effect or simplified here
    };
    reader.readAsText(file);
  };

  const handleToggleMatch = (id: string) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMatches(newSelected);
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    let successCount = 0;

    try {
      const promises = parsedMatches
        .filter(m => selectedMatches.has(m.id))
        .map(async (m) => {
          // Construct Match object for API
          const matchData: Partial<Match> = {
            datum: m.datum,
            tijd: m.tijd,
            team: team || 'Heren 1', // Use the detected/entered team
            isThuis: m.isThuis,
            thuisteam: m.thuisteam,
            uitteam: m.uitteam,
            locatie: m.locatie,
            competitie: m.competitie,
            status: 'gepland',
            posities: []
          };
          // ... rest of import logic
          return wedstrijdApi.create(matchData as any);
        });

      await Promise.all(promises);
      setSuccess(`Succesvol ${promises.length} wedstrijden geïmporteerd!`);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Er ging iets mis bij het opslaan van de wedstrijden.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setParsedMatches([]);
    setSuccess(null);
    setError(null);
    setRawContent(''); // Reset raw content
    onClose();
  };

  // Update textarea handler to setRawContent
  const handleTextPaste = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value.length > 20) {
      setRawContent(e.target.value);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Agenda Importeren (ICS)</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Download je persoonlijke wedstrijdagenda als <strong>.ics</strong> bestand van <em>mijnknltb.nl</em> en upload het hier.
        </Alert>

        <TextField
          fullWidth
          label="Mijn Team Naam (voor Thuis/Uit bepaling)"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="bijv. Sla Raak 2"
          margin="normal"
          helperText="Als je dit leeg laat, proberen we het automatisch te detecteren."
        />

        {parsedMatches.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #ccc', borderRadius: 2 }}>
            <input
              type="file"
              accept=".ics"
              id="ics-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="ics-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload ICS Bestand
              </Button>
            </label>

            <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>OF</Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Plak hier de inhoud van het ICS bestand..."
              variant="outlined"
              onChange={handleTextPaste}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Gevonden Wedstrijden ({selectedMatches.size} geselecteerd)
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
              {parsedMatches.map((match) => (
                <ListItem
                  key={match.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={selectedMatches.has(match.id)}
                      onChange={() => handleToggleMatch(match.id)}
                    />
                  }
                >
                  <ListItemText
                    primary={`${match.datum} | ${match.thuisteam} - ${match.uitteam}`}
                    secondary={`${match.competitie} | ${match.locatie} | ${match.isThuis ? 'Thuis' : 'Uit'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuleren</Button>
        <Button
          onClick={handleImport}
          disabled={parsedMatches.length === 0 || loading}
          variant="contained"
        >
          {loading ? 'Importeren...' : 'Importeren'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
