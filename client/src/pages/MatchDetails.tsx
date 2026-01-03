import AutorenewIcon from '@mui/icons-material/Autorenew';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Snackbar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tab,
  Stack,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { generateWhatsAppLineup } from '../utils/textGenerators';
import { nl } from 'date-fns/locale';
import { format } from 'date-fns';
import { wedstrijdApi, spelerApi, beschikbaarheidApi } from '../services/api';
import { Match, Player, Availability, getTeamName, getCompetitieName } from '../types';

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
      id={`match-tabpanel-${index}`}
      aria-labelledby={`match-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [voorkeurenDialogOpen, setVoorkeurenDialogOpen] = useState(false);
  const [tempBeschikbareSpelers, setTempBeschikbareSpelers] = useState<any[]>([]);
  const [speelvoorkeuren, setSpeelvoorkeuren] = useState<{
    [spelerId: string]: 'graag-2x' | 'minimaal-1x' | 'reserve'
  }>({});
  const [voorkeurenResolve, setVoorkeurenResolve] = useState<((voorkeuren: any) => void) | null>(null);

  const loadData = async () => {
    try {
      const [matchResponse, playersResponse, availabilityResponse] = await Promise.all([
        wedstrijdApi.getById(id!),
        spelerApi.getAll(),
        beschikbaarheidApi.getWedstrijdBeschikbaarheid(id!)
      ]);
      console.log('Opgehaalde spelers:', playersResponse.data);
      console.log('Opgehaalde beschikbaarheid:', JSON.stringify(availabilityResponse.data, null, 2));

      setMatch(matchResponse.data);
      setPlayers(playersResponse.data);
      setAvailability(availabilityResponse.data);
    } catch (error) {
      console.error('Fout bij het laden van gegevens:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    validateOpstelling();
  }, [match, players]);

  useEffect(() => {
    // Hervalideer de opstelling wanneer beschikbaarheid wijzigt
    if (match && players.length > 0 && availability.length > 0) {
      console.log('Availability changed, re-validating opstelling');
      validateOpstelling();
    }
  }, [availability]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAvailabilityChange = async (
    playerId: string,
    status: 'available' | 'unavailable' | 'maybe'
  ) => {
    try {
      console.log('Beschikbaarheid bijwerken:', { wedstrijdId: id, playerId, status });
      const response = await beschikbaarheidApi.updateBeschikbaarheid(id!, playerId, { status });
      console.log('Beschikbaarheid update response:', JSON.stringify(response.data, null, 2));

      await loadData();
    } catch (error: any) {
      console.error('Fout bij het bijwerken van beschikbaarheid:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const handleAvailabilityDelete = async (playerId: string) => {
    try {
      if (!window.confirm('Huidige status wissen?')) return;
      console.log('Beschikbaarheid wissen:', { wedstrijdId: id, playerId });
      await beschikbaarheidApi.deleteBeschikbaarheid(id!, playerId);
      await loadData();
    } catch (error) {
      console.error('Fout bij het wissen van beschikbaarheid:', error);
    }
  };

  const formatCompetitieDisplay = (competitie?: string | any) => {
    if (!competitie) return 'Geen competitie';
    if (typeof competitie === 'object' && competitie.naam) return competitie.naam;
    if (typeof competitie !== 'string') return 'Onbekend';

    const [seizoen, jaar] = competitie.split('-');
    const jaarNummer = parseInt(jaar);
    if (seizoen === 'voorjaar') return `Voorjaarscompetitie ${jaar}`;
    if (seizoen === 'najaar') return `Najaarscompetitie ${jaar}`;
    if (seizoen === 'winter') return `Wintercompetitie ${jaar}/${jaarNummer + 1}`;
    if (seizoen === 'zomeravond') return `Zomeravondcompetitie ${jaar}`;
    return `${seizoen} ${jaar}`;
  };

  const handleMatchTypeChange = async (wedstrijdNummer: number, type: 'enkel' | 'dubbel' | 'gemengd') => {
    if (!match) return;

    try {
      console.log('Wijzigen wedstrijd type:', { wedstrijdNummer, type });
      const currentPosities = match.posities?.filter(p => p.positie === wedstrijdNummer) || [];
      const otherPosities = match.posities?.filter(p => p.positie !== wedstrijdNummer).map(p => ({
        ...p,
        type: p.type || 'enkel',
        rol: p.rol || 'enkel'
      })) || [];

      let newPosities = [...otherPosities];

      if (type === 'enkel') {
        // Alleen eerste speler behouden
        newPosities.push({
          positie: wedstrijdNummer,
          spelerId: currentPosities[0]?.spelerId || null,
          type: 'enkel',
          rol: 'enkel'
        });
      } else {
        // Beide spelers behouden of lege posities toevoegen
        newPosities.push(
          {
            positie: wedstrijdNummer,
            type,
            spelerId: currentPosities[0]?.spelerId || null,
            rol: 'enkel'
          },
          {
            positie: wedstrijdNummer,
            type,
            spelerId: currentPosities[1]?.spelerId || null,
            rol: 'dubbel'
          }
        );
      }

      console.log('Nieuwe posities:', newPosities);
      await wedstrijdApi.wijsSpelersToe(match._id, newPosities);
      loadData();
    } catch (error) {
      console.error('Fout bij het wijzigen van wedstrijd type:', error);
    }
  };

  const handleClearMatch = async (wedstrijdNummer: number) => {
    if (!match) return;

    try {
      const newPosities = match.posities?.filter(p => p.positie !== wedstrijdNummer).map(p => ({
        ...p,
        type: p.type || 'enkel',
        rol: p.rol || 'enkel'
      })) || [];
      await wedstrijdApi.wijsSpelersToe(match._id, newPosities);
      loadData();
    } catch (error) {
      console.error('Fout bij het wissen van wedstrijd:', error);
    }
  };

  // Helper functie: Normaliseer spelerId naar string (fix voor MongoDB ObjectId)
  const normalizeId = (id: any): string => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return id._id.toString();
    return id.toString();
  };

  // KNLTB Regel 1: Speler mag per ronde (1&2 of 3&4) slechts één partij spelen
  const isPlayerInSameRound = (spelerId: string, wedstrijdNummer: number): boolean => {
    if (!match || !spelerId) return false;

    const normalizedSpelerId = normalizeId(spelerId);

    return match.posities?.some(p => {
      const posSpelerId = normalizeId(p.spelerId);
      if (posSpelerId !== normalizedSpelerId) return false;

      // Ronde 1: wedstrijd 1 & 2
      if (wedstrijdNummer <= 2 && p.positie <= 2 && p.positie !== wedstrijdNummer) return true;
      // Ronde 2: wedstrijd 3 & 4
      if (wedstrijdNummer >= 3 && p.positie >= 3 && p.positie !== wedstrijdNummer) return true;

      return false;
    }) || false;
  };

  // KNLTB Regel 2: Speler mag maximaal 2 dubbels per wedstrijd spelen
  const getPlayerMatchCount = (spelerId: string): number => {
    if (!match || !spelerId) return 0;

    const normalizedSpelerId = normalizeId(spelerId);
    const wedstrijdenSet = new Set<number>();
    match.posities?.forEach(p => {
      const posSpelerId = normalizeId(p.spelerId);
      if (posSpelerId === normalizedSpelerId) {
        wedstrijdenSet.add(p.positie);
      }
    });

    return wedstrijdenSet.size;
  };

  // KNLTB Regel 3: Speler mag niet tweemaal met dezelfde partner spelen
  const hasPlayedWithPartner = (speler1Id: string, speler2Id: string, excludeWedstrijd: number): boolean => {
    if (!match || !speler1Id || !speler2Id) return false;

    const normalizedSpeler1Id = normalizeId(speler1Id);
    const normalizedSpeler2Id = normalizeId(speler2Id);
    const wedstrijden = [1, 2, 3, 4].filter(w => w !== excludeWedstrijd);

    return wedstrijden.some(wedstrijdNr => {
      const positiesInWedstrijd = match.posities?.filter(p => p.positie === wedstrijdNr) || [];
      const spelerIds = positiesInWedstrijd.map(p => normalizeId(p.spelerId)).filter(id => id);

      return spelerIds.includes(normalizedSpeler1Id) && spelerIds.includes(normalizedSpeler2Id);
    });
  };

  const isPlayerAvailable = (spelerId: string) => {
    const normalizedSpelerId = normalizeId(spelerId);
    const playerAvailability = availability.find(avail => normalizeId(avail.player._id) === normalizedSpelerId);
    return playerAvailability?.status === 'available' || playerAvailability?.status === 'maybe';
  };

  const getAvailabilityStatus = (spelerId: string) => {
    const normalizedSpelerId = normalizeId(spelerId);
    const playerAvailability = availability.find(avail => normalizeId(avail.player._id) === normalizedSpelerId);
    if (!playerAvailability) return '';
    if (playerAvailability.status === 'available') return '';
    if (playerAvailability.status === 'maybe') return ' (Misschien)';
    return ' (Niet beschikbaar)';
  };

  const getPlayerAvailabilityColor = (spelerId: string): string => {
    const normalizedSpelerId = normalizeId(spelerId);
    const playerAvailability = availability.find(avail => normalizeId(avail.player._id) === normalizedSpelerId);

    if (!playerAvailability || playerAvailability.status === 'available') {
      return 'inherit'; // Normale kleur
    }
    if (playerAvailability.status === 'maybe') {
      return '#ff9800'; // Oranje voor "misschien"
    }
    if (playerAvailability.status === 'unavailable') {
      return '#f44336'; // Rood voor "niet beschikbaar"
    }
    return 'inherit';
  };

  const getPlayerRanking = (spelerId: string): number => {
    const normalizedSpelerId = normalizeId(spelerId);
    const player = players.find(p => normalizeId(p._id) === normalizedSpelerId);
    return player?.niveau || 0;
  };

  // KNLTB Regel 4: Dubbelkoppels in volgorde van afnemende kracht (som van rankings)
  const getMatchTotalRanking = (wedstrijdNummer: number): number => {
    if (!match) return 0;
    const wedstrijdPosities = match.posities?.filter(p => p.positie === wedstrijdNummer) || [];
    return wedstrijdPosities.reduce((total, positie) => {
      const spelerId = normalizeId(positie.spelerId);
      return total + getPlayerRanking(spelerId);
    }, 0);
  };

  const isRankingValid = (wedstrijdNummer: number, newSpelerId: string, spelerNummer: number): boolean => {
    if (!match) return true;

    // Alleen voor dubbels en gemengd
    const wedstrijdType = match.posities?.find(p => p.positie === wedstrijdNummer)?.type || 'enkel';
    if (wedstrijdType === 'enkel') return true;

    // Bereken de nieuwe ranking voor deze wedstrijd
    const wedstrijdPosities = match.posities?.filter(p => p.positie === wedstrijdNummer) || [];
    const currentSpelerRanking = getPlayerRanking(newSpelerId);

    let newWedstrijdRanking = currentSpelerRanking;
    let hasPartner = false;

    wedstrijdPosities.forEach(positie => {
      // Tel de andere speler mee (niet de positie die we nu aan het wijzigen zijn)
      const isCurrentPosition = (spelerNummer === 1 && positie.rol === 'enkel') ||
        (spelerNummer === 2 && positie.rol === 'dubbel');
      if (!isCurrentPosition && positie.spelerId) {
        const spelerId = normalizeId(positie.spelerId);
        newWedstrijdRanking += getPlayerRanking(spelerId);
        hasPartner = true;
      }
    });

    // ✅ NIEUWE CODE: Alleen valideren als beide spelers zijn ingevuld
    if (!hasPartner) {
      return true; // Nog geen partner, dus geen ranking validatie
    }

    // Ronde 1: Wedstrijd 1 moet sterker zijn dan wedstrijd 2 (lagere som = sterker)
    if (wedstrijdNummer === 2) {
      const wedstrijd1Ranking = getMatchTotalRanking(1);
      // ✅ NIEUWE CODE: Alleen valideren als wedstrijd 1 ook compleet is
      const wedstrijd1Posities = match.posities?.filter(p => p.positie === 1) || [];
      if (wedstrijd1Posities.length < 2 || !wedstrijd1Posities.every(p => p.spelerId)) {
        return true; // Wedstrijd 1 is niet compleet, dus geen validatie
      }
      return newWedstrijdRanking >= wedstrijd1Ranking;
    }

    // Ronde 2: Wedstrijd 3 moet sterker zijn dan wedstrijd 4
    if (wedstrijdNummer === 4) {
      const wedstrijd3Ranking = getMatchTotalRanking(3);
      // ✅ NIEUWE CODE: Alleen valideren als wedstrijd 3 ook compleet is
      const wedstrijd3Posities = match.posities?.filter(p => p.positie === 3) || [];
      if (wedstrijd3Posities.length < 2 || !wedstrijd3Posities.every(p => p.spelerId)) {
        return true; // Wedstrijd 3 is niet compleet, dus geen validatie
      }
      return newWedstrijdRanking >= wedstrijd3Ranking;
    }

    return true;
  };

  const canAssignPlayer = (
    wedstrijdNummer: number,
    spelerNummer: number,
    spelerId: string
  ): { canAssign: boolean; reason?: string } => {
    if (!spelerId) return { canAssign: true };

    // Check beschikbaarheid
    if (!isPlayerAvailable(spelerId)) {
      return { canAssign: false, reason: 'Speler is niet beschikbaar' };
    }

    // Check: niet in dezelfde ronde
    if (isPlayerInSameRound(spelerId, wedstrijdNummer)) {
      return { canAssign: false, reason: 'Speler speelt al in deze ronde' };
    }

    // Check: maximaal 2 wedstrijden
    const currentCount = getPlayerMatchCount(spelerId);
    const normalizedSpelerId = normalizeId(spelerId);
    const isAlreadyInThisMatch = match?.posities?.some(p =>
      p.positie === wedstrijdNummer && normalizeId(p.spelerId) === normalizedSpelerId
    );

    if (!isAlreadyInThisMatch && currentCount >= 2) {
      return { canAssign: false, reason: 'Speler speelt al in 2 wedstrijden (max)' };
    }

    // Check: niet tweemaal met dezelfde partner
    const wedstrijdPosities = match?.posities?.filter(p => p.positie === wedstrijdNummer) || [];
    const partnerId = wedstrijdPosities.find(p => {
      const isOtherPosition = (spelerNummer === 1 && p.rol === 'dubbel') ||
        (spelerNummer === 2 && p.rol === 'enkel');
      return isOtherPosition;
    })?.spelerId;

    if (partnerId && hasPlayedWithPartner(spelerId, normalizeId(partnerId), wedstrijdNummer)) {
      return { canAssign: false, reason: 'Spelers spelen al samen in een andere wedstrijd' };
    }

    // Check: ranking volgorde (KNLTB sterktevolgorde)
    if (!isRankingValid(wedstrijdNummer, spelerId, spelerNummer)) {
      if (wedstrijdNummer === 2) {
        return { canAssign: false, reason: 'Wedstrijd 2 mag niet sterker zijn dan wedstrijd 1' };
      }
      if (wedstrijdNummer === 4) {
        return { canAssign: false, reason: 'Wedstrijd 4 mag niet sterker zijn dan wedstrijd 3' };
      }
    }

    return { canAssign: true };
  };

  const handlePlayerAssignment = async (wedstrijdNummer: number, spelerNummer: number, spelerId: string) => {
    if (!match) return;

    // Valideer toewijzing
    const validation = canAssignPlayer(wedstrijdNummer, spelerNummer, spelerId);
    if (!validation.canAssign) {
      alert(`Kan speler niet toewijzen: ${validation.reason}`);
      return;
    }

    try {
      console.log('Toewijzen speler:', { wedstrijdNummer, spelerNummer, spelerId });
      const currentPosities = match.posities?.filter(p => p.positie !== wedstrijdNummer).map(p => ({
        ...p,
        type: p.type || 'enkel',
        rol: p.rol || 'enkel'
      })) || [];
      const wedstrijdType = match.posities?.find(p => p.positie === wedstrijdNummer)?.type || 'enkel';

      if (wedstrijdType === 'enkel' && spelerNummer === 1) {
        currentPosities.push({
          positie: wedstrijdNummer,
          spelerId: spelerId || null,
          type: 'enkel',
          rol: 'enkel'
        });
      } else if (wedstrijdType !== 'enkel') {
        const existingSpeler = match.posities?.find(p =>
          p.positie === wedstrijdNummer &&
          ((spelerNummer === 1 && p.rol === 'dubbel') || (spelerNummer === 2 && p.rol === 'enkel'))
        );
        const newSpelerId = spelerId || null;
        const existingSpelerId = existingSpeler?.spelerId || null;

        currentPosities.push(
          {
            positie: wedstrijdNummer,
            spelerId: spelerNummer === 1 ? newSpelerId : existingSpelerId,
            type: wedstrijdType,
            rol: 'enkel'
          },
          {
            positie: wedstrijdNummer,
            spelerId: spelerNummer === 2 ? newSpelerId : existingSpelerId,
            type: wedstrijdType,
            rol: 'dubbel'
          }
        );
      }

      console.log('Nieuwe posities:', currentPosities);
      await wedstrijdApi.wijsSpelersToe(match._id, currentPosities);
      loadData();
    } catch (error) {
      console.error('Fout bij het toewijzen van speler:', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (!match) return;

    // Find captain details
    const captain = players.find(p => p.isCaptain);

    const enrichedPosities = (match.posities || []).map(p => ({
      ...p,
      speler: players.find(pl => normalizeId(pl._id) === normalizeId(p.spelerId)) || null
    }));

    const text = generateWhatsAppLineup(
      match,
      enrichedPosities,
      captain?.naam || 'Onbekend',
      match.locatie,
      match.vertrektijd
    );

    // Copy to clipboard
    navigator.clipboard.writeText(text);
    alert('Team indeling gekopieerd voor WhatsApp! 📱');
  };

  const validateOpstelling = () => {
    console.log('=== validateOpstelling called ===');
    console.log('match:', match);
    console.log('players:', players);

    if (!match || !players) {
      console.log('Early return: match or players not available');
      return;
    }

    const errors: string[] = [];

    match.posities?.forEach(positie => {
      const spelerId = normalizeId(positie.spelerId);
      if (spelerId) {
        const speler = players.find(p => normalizeId(p._id) === spelerId);
        if (speler) {
          const playerAvailability = availability.find(avail => normalizeId(avail.player._id) === spelerId);
          if (playerAvailability?.status === 'unavailable') {
            const error = `⚠️ ${speler.naam} staat in wedstrijd ${positie.positie} maar is niet beschikbaar`;
            if (!errors.includes(error)) {
              errors.push(error);
            }
          } else if (playerAvailability?.status === 'maybe') {
            const error = `⚠️ ${speler.naam} staat in wedstrijd ${positie.positie} maar heeft "misschien" aangegeven`;
            if (!errors.includes(error)) {
              errors.push(error);
            }
          }
        }
      }
    });

    // Valideer ronde 1 (wedstrijd 1 & 2)
    const wed1Ranking = getMatchTotalRanking(1);
    const wed2Ranking = getMatchTotalRanking(2);
    const wed1Type = match.posities?.find(p => p.positie === 1)?.type;
    const wed2Type = match.posities?.find(p => p.positie === 2)?.type;

    console.log('Wed1:', { ranking: wed1Ranking, type: wed1Type });
    console.log('Wed2:', { ranking: wed2Ranking, type: wed2Type });

    if (wed1Type !== 'enkel' && wed2Type !== 'enkel' && wed1Ranking > 0 && wed2Ranking > 0) {
      if (wed2Ranking < wed1Ranking) {
        const error = '⚠️ Ronde 1: Wedstrijd 2 is sterker dan wedstrijd 1 (KNLTB regel: oplopende sterkte)';
        console.log('Adding error:', error);
        errors.push(error);
      }
    }

    // Valideer ronde 2 (wedstrijd 3 & 4)
    const wed3Ranking = getMatchTotalRanking(3);
    const wed4Ranking = getMatchTotalRanking(4);
    const wed3Type = match.posities?.find(p => p.positie === 3)?.type;
    const wed4Type = match.posities?.find(p => p.positie === 4)?.type;

    console.log('Wed3:', { ranking: wed3Ranking, type: wed3Type });
    console.log('Wed4:', { ranking: wed4Ranking, type: wed4Type });

    if (wed3Type !== 'enkel' && wed4Type !== 'enkel' && wed3Ranking > 0 && wed4Ranking > 0) {
      if (wed4Ranking < wed3Ranking) {
        const error = '⚠️ Ronde 2: Wedstrijd 4 is sterker dan wedstrijd 3 (KNLTB regel: oplopende sterkte)';
        console.log('Adding error:', error);
        errors.push(error);
      }
    }

    // Valideer spelers: maximaal 2 wedstrijden
    players.forEach(speler => {
      const matchCount = getPlayerMatchCount(speler._id);
      if (matchCount > 2) {
        const error = `⚠️ ${speler.naam} speelt in ${matchCount} wedstrijden (max 2 toegestaan)`;
        console.log('Adding error:', error);
        errors.push(error);
      }
    });

    // Valideer spelers: niet in zelfde ronde
    [1, 2, 3, 4].forEach(wedstrijdNr => {
      const positiesInWedstrijd = match.posities?.filter(p => p.positie === wedstrijdNr) || [];
      positiesInWedstrijd.forEach(positie => {
        const spelerId = normalizeId(positie.spelerId);
        if (spelerId && isPlayerInSameRound(spelerId, wedstrijdNr)) {
          const speler = players.find(p => normalizeId(p._id) === spelerId);
          if (speler) {
            const rondeNr = wedstrijdNr <= 2 ? 1 : 2;
            const otherWedstrijd = wedstrijdNr <= 2 ?
              (wedstrijdNr === 1 ? 2 : 1) :
              (wedstrijdNr === 3 ? 4 : 3);

            // Check of deze error al is toegevoegd
            const errorMsg = `⚠️ ${speler.naam} speelt in wedstrijd ${wedstrijdNr} én ${otherWedstrijd} (zelfde ronde ${rondeNr})`;
            if (!errors.includes(errorMsg)) {
              console.log('Adding error:', errorMsg);
              errors.push(errorMsg);
            }
          }
        }
      });
    });

    // Valideer dubbele partners
    const checkedPairs = new Set<string>();
    [1, 2, 3, 4].forEach(wedstrijdNr => {
      const positiesInWedstrijd = match.posities?.filter(p => p.positie === wedstrijdNr) || [];
      if (positiesInWedstrijd.length === 2) {
        const spelerId1 = normalizeId(positiesInWedstrijd[0].spelerId);
        const spelerId2 = normalizeId(positiesInWedstrijd[1].spelerId);

        if (spelerId1 && spelerId2) {
          const speler1 = players.find(p => normalizeId(p._id) === spelerId1);
          const speler2 = players.find(p => normalizeId(p._id) === spelerId2);

          // Valideer Gemengd Dubbel: 1 man en 1 vrouw
          const wedstrijdType = positiesInWedstrijd[0].type; // Beide posities hebben zelfde type
          if (wedstrijdType === 'gemengd' && speler1 && speler2) {
            const geslacht1 = speler1.geslacht || 'Man'; // Fallback voor oude data
            const geslacht2 = speler2.geslacht || 'Man';

            if (geslacht1 === geslacht2) {
              const error = `⚠️ Wedstrijd ${wedstrijdNr} is gemengd, maar bestaat uit 2 ${geslacht1 === 'Man' ? 'mannen' : 'vrouwen'} (${speler1.naam} & ${speler2.naam}). Nodig: 1 Man + 1 Vrouw.`;
              console.log('Adding error:', error);
              errors.push(error);
            }
          }

          const pairKey = [spelerId1, spelerId2].sort().join('-');

          if (hasPlayedWithPartner(spelerId1, spelerId2, wedstrijdNr)) {

            if (speler1 && speler2 && !checkedPairs.has(pairKey)) {
              // Vind in welke andere wedstrijd ze samen spelen
              const otherWedstrijd = [1, 2, 3, 4].find(w => {
                if (w === wedstrijdNr) return false;
                const posInOther = match.posities?.filter(p => p.positie === w) || [];
                const idsInOther = posInOther.map(p => normalizeId(p.spelerId));
                return idsInOther.includes(spelerId1) && idsInOther.includes(spelerId2);
              });

              if (otherWedstrijd) {
                const error = `⚠️ ${speler1.naam} en ${speler2.naam} spelen samen in wedstrijd ${Math.min(wedstrijdNr, otherWedstrijd)} én ${Math.max(wedstrijdNr, otherWedstrijd)} (niet toegestaan)`;
                console.log('Adding error:', error);
                errors.push(error);
                checkedPairs.add(pairKey);
              }
            }
          }
        }
      }
    });

    console.log('Total errors found:', errors.length);
    console.log('Errors:', errors);
    setValidationErrors(errors);
  };

  // de generateAutomaticLineup functie:
  const generateAutomaticLineup = async () => {
    if (!match) return;

    try {
      // Stap 1: Filter en sorteer beschikbare spelers
      const beschikbareSpelers = players
        .map(speler => {
          const beschikbaarheid = availability.find(a => normalizeId(a.player._id) === normalizeId(speler._id));
          return {
            ...speler,
            beschikbaarheidStatus: beschikbaarheid?.status || 'available',
            prioriteit: beschikbaarheid?.status === 'available' ? 1 :
              beschikbaarheid?.status === 'maybe' ? 2 : 3
          };
        })
        .filter(speler => speler.beschikbaarheidStatus !== 'unavailable')
        .sort((a, b) => {
          if (a.prioriteit !== b.prioriteit) return a.prioriteit - b.prioriteit;
          return a.niveau - b.niveau;
        });

      console.log('Beschikbare spelers:', beschikbareSpelers);

      // Stap 2: Bepaal wedstrijdtypes
      const getWedstrijdType = (wedstrijdNr: number): 'enkel' | 'dubbel' | 'gemengd' => {
        const positieType = match.posities?.find(p => p.positie === wedstrijdNr)?.type;
        if (positieType) return positieType;

        const heeftPosities = match.posities && match.posities.length > 0;
        return heeftPosities ? 'dubbel' : 'enkel';
      };

      const wedstrijdTypes: { [key: number]: 'enkel' | 'dubbel' | 'gemengd' } = {
        1: getWedstrijdType(1),
        2: getWedstrijdType(2),
        3: getWedstrijdType(3),
        4: getWedstrijdType(4)
      };

      // Stap 3: Bereken ALLEEN minimum (niet "ideaal")
      const berekenMinimumSpelers = (): number => {
        const ronde1Spelers = [wedstrijdTypes[1], wedstrijdTypes[2]].reduce((sum, type) =>
          sum + (type === 'enkel' ? 1 : 2), 0
        );

        const ronde2Spelers = [wedstrijdTypes[3], wedstrijdTypes[4]].reduce((sum, type) =>
          sum + (type === 'enkel' ? 1 : 2), 0
        );

        return Math.max(ronde1Spelers, ronde2Spelers);
      };

      const minimumSpelers = berekenMinimumSpelers();

      console.log('Minimum spelers nodig:', minimumSpelers);
      console.log('Beschikbaar:', beschikbareSpelers.length);
      console.log('Wedstrijd types:', wedstrijdTypes);

      // ✅ Alleen checken op MINIMUM - geen "ideaal" waarschuwing meer!
      if (beschikbareSpelers.length < minimumSpelers) {
        alert(
          `Onvoldoende beschikbare spelers!\n\n` +
          `Minimaal nodig: ${minimumSpelers}\n` +
          `Beschikbaar: ${beschikbareSpelers.length}\n\n` +
          `Zorg dat meer spelers hun beschikbaarheid invullen.`
        );
        return;
      }

      // Stap 4: Genereer opstelling
      const opstelling = berekenOptimaleOpstelling(beschikbareSpelers, wedstrijdTypes);

      if (!opstelling) {
        alert(
          'Kon geen geldige opstelling vinden!\n\n' +
          'Mogelijke oorzaken:\n' +
          '• Te weinig variatie in spelersniveaus\n' +
          '• Complexe combinatie van wedstrijdtypes\n\n' +
          'Probeer:\n' +
          '• Meer spelers beschikbaar maken\n' +
          '• Wedstrijdtypes aanpassen\n' +
          '• Handmatige opstelling'
        );
        return;
      }

      console.log('Gegenereerde opstelling:', opstelling);

      // Stap 5: Pas opstelling toe
      await wedstrijdApi.wijsSpelersToe(match._id, opstelling);
      await loadData();

      // ✅ Succesmelding zonder verwarrende "ideaal" info
      alert(
        `Automatische opstelling succesvol gegenereerd! ✅\n\n` +
        `${beschikbareSpelers.length} spelers beschikbaar voor ${Object.keys(wedstrijdTypes).length} wedstrijden.`
      );
    } catch (error) {
      console.error('Fout bij het genereren van opstelling:', error);
      alert('Er is een fout opgetreden bij het genereren van de opstelling');
    }
  };

  // Voeg deze helper functie toe:
  const vraagSpeelvoorkeuren = (beschikbareSpelers: any[]): Promise<{
    [spelerId: string]: 'graag-2x' | 'minimaal-1x' | 'reserve'
  }> => {
    return new Promise((resolve) => {
      // Zet default voorkeuren
      const defaultVoorkeuren: { [spelerId: string]: 'graag-2x' | 'minimaal-1x' | 'reserve' } = {};
      beschikbareSpelers.forEach(speler => {
        defaultVoorkeuren[speler._id] = 'graag-2x';
      });

      setTempBeschikbareSpelers(beschikbareSpelers);
      setSpeelvoorkeuren(defaultVoorkeuren);
      setVoorkeurenResolve(() => resolve);
      setVoorkeurenDialogOpen(true);
    });
  };

  const handleVoorkeurChange = (spelerId: string, voorkeur: 'graag-2x' | 'minimaal-1x' | 'reserve') => {
    setSpeelvoorkeuren(prev => ({
      ...prev,
      [spelerId]: voorkeur
    }));
  };

  const handleVoorkeurenBevestigen = () => {
    setVoorkeurenDialogOpen(false);
    if (voorkeurenResolve) {
      voorkeurenResolve(speelvoorkeuren);
    }
  };

  const handleVoorkeurenAnnuleren = () => {
    setVoorkeurenDialogOpen(false);
    if (voorkeurenResolve) {
      // Resolve met lege voorkeuren = gebruik standaard algoritme
      voorkeurenResolve({});
    }
  };

  // Helper functie: Bereken optimale opstelling met backtracking
  const berekenOptimaleOpstelling = (
    beschikbareSpelers: any[],
    wedstrijdTypes: { [key: number]: 'enkel' | 'dubbel' | 'gemengd' }
  ): Array<{ positie: number; spelerId: string | null; type: 'enkel' | 'dubbel' | 'gemengd'; rol: string }> | null => {

    const gebruikteSpelers = new Set<string>();
    const partnerschappen = new Set<string>();
    const rondeSpelers: { [ronde: number]: Set<string> } = { 1: new Set(), 2: new Set() };
    const spelerWedstrijdCount: { [spelerId: string]: number } = {};

    const posities: Array<{ positie: number; spelerId: string | null; type: 'enkel' | 'dubbel' | 'gemengd'; rol: string }> = [];

    // Helper: Controleer of speler kan worden toegewezen
    const kanSpelerToewijzen = (
      spelerId: string,
      wedstrijdNr: number,
      partnerId?: string
    ): boolean => {
      const ronde = wedstrijdNr <= 2 ? 1 : 2;

      // Check: niet al in deze ronde
      if (rondeSpelers[ronde].has(spelerId)) {
        return false;
      }

      // Check: max 2 wedstrijden
      if ((spelerWedstrijdCount[spelerId] || 0) >= 2) {
        return false;
      }

      // Check: niet met zelfde partner (alleen relevant voor dubbels/gemengd)
      if (partnerId) {
        const pairKey = [spelerId, partnerId].sort().join('-');
        if (partnerschappen.has(pairKey)) {
          return false;
        }
      }

      return true;
    };

    // Helper: Voeg speler toe
    const voegSpelerToe = (
      spelerId: string,
      wedstrijdNr: number,
      type: 'enkel' | 'dubbel' | 'gemengd',
      rol: string,
      partnerId?: string
    ) => {
      const ronde = wedstrijdNr <= 2 ? 1 : 2;

      posities.push({ positie: wedstrijdNr, spelerId, type, rol });
      gebruikteSpelers.add(spelerId);
      rondeSpelers[ronde].add(spelerId);
      spelerWedstrijdCount[spelerId] = (spelerWedstrijdCount[spelerId] || 0) + 1;

      if (partnerId) {
        const pairKey = [spelerId, partnerId].sort().join('-');
        partnerschappen.add(pairKey);
      }
    };

    // Helper: Bereken ranking voor een wedstrijd
    const berekenWedstrijdRanking = (wedstrijdNr: number): number => {
      return posities
        .filter(p => p.positie === wedstrijdNr)
        .reduce((sum, p) => sum + (beschikbareSpelers.find(s => normalizeId(s._id) === p.spelerId)?.niveau || 0), 0);
    };

    // Probeer opstelling te genereren wedstrijd per wedstrijd
    try {
      // RONDE 1: Wedstrijd 1 en 2
      const ronde1Spelers = [...beschikbareSpelers];

      // Wedstrijd 1
      if (wedstrijdTypes[1] === 'enkel') {
        const speler = ronde1Spelers[0]; // Sterkste speler
        if (!kanSpelerToewijzen(speler._id, 1)) return null;
        voegSpelerToe(speler._id, 1, 'enkel', 'enkel');
      } else {
        // Dubbel/Gemengd: pak 2 sterkste spelers
        if (ronde1Spelers.length < 2) return null;
        const speler1 = ronde1Spelers[0];
        const speler2 = ronde1Spelers[1];
        if (!kanSpelerToewijzen(speler1._id, 1) || !kanSpelerToewijzen(speler2._id, 1)) return null;
        voegSpelerToe(speler1._id, 1, wedstrijdTypes[1], 'enkel', speler2._id);
        voegSpelerToe(speler2._id, 1, wedstrijdTypes[1], 'dubbel', speler1._id);
      }

      // Wedstrijd 2
      if (wedstrijdTypes[2] === 'enkel') {
        // Zoek beschikbare speler (niet in ronde 1)
        const speler = ronde1Spelers.find(s => kanSpelerToewijzen(s._id, 2));
        if (!speler) {
          // Probeer speler te hergebruiken die al in wedstrijd 1 zat (max 2 wedstrijden toegestaan)
          const hergebruikSpeler = ronde1Spelers.find(s =>
            (spelerWedstrijdCount[s._id] || 0) < 2 &&
            !rondeSpelers[1].has(s._id)
          );
          if (!hergebruikSpeler) return null;
          voegSpelerToe(hergebruikSpeler._id, 2, 'enkel', 'enkel');
        } else {
          voegSpelerToe(speler._id, 2, 'enkel', 'enkel');
        }
      } else {
        // Zoek 2 beschikbare spelers
        const beschikbaar = ronde1Spelers.filter(s => kanSpelerToewijzen(s._id, 2));
        if (beschikbaar.length < 2) return null;

        // Probeer combinaties om een zwakker koppel te maken dan wedstrijd 1
        let gevonden = false;
        const wed1Ranking = berekenWedstrijdRanking(1);

        for (let i = 0; i < beschikbaar.length && !gevonden; i++) {
          for (let j = i + 1; j < beschikbaar.length && !gevonden; j++) {
            const speler1 = beschikbaar[i];
            const speler2 = beschikbaar[j];
            const wed2Ranking = speler1.niveau + speler2.niveau;

            // Wedstrijd 2 moet zwakker zijn (hogere som) OF gelijk
            if (wed2Ranking >= wed1Ranking &&
              kanSpelerToewijzen(speler1._id, 2, speler2._id) &&
              kanSpelerToewijzen(speler2._id, 2, speler1._id)) {
              voegSpelerToe(speler1._id, 2, wedstrijdTypes[2], 'enkel', speler2._id);
              voegSpelerToe(speler2._id, 2, wedstrijdTypes[2], 'dubbel', speler1._id);
              gevonden = true;
            }
          }
        }

        if (!gevonden) return null;
      }

      // RONDE 2: Wedstrijd 3 en 4
      // Wedstrijd 3
      if (wedstrijdTypes[3] === 'enkel') {
        const speler = beschikbareSpelers.find(s => kanSpelerToewijzen(s._id, 3));
        if (!speler) return null;
        voegSpelerToe(speler._id, 3, 'enkel', 'enkel');
      } else {
        const beschikbaar = beschikbareSpelers.filter(s => kanSpelerToewijzen(s._id, 3));
        if (beschikbaar.length < 2) return null;

        // Pak de 2 sterkste beschikbare spelers
        let gevonden = false;
        for (let i = 0; i < beschikbaar.length && !gevonden; i++) {
          for (let j = i + 1; j < beschikbaar.length && !gevonden; j++) {
            const speler1 = beschikbaar[i];
            const speler2 = beschikbaar[j];

            if (kanSpelerToewijzen(speler1._id, 3, speler2._id) &&
              kanSpelerToewijzen(speler2._id, 3, speler1._id)) {
              voegSpelerToe(speler1._id, 3, wedstrijdTypes[3], 'enkel', speler2._id);
              voegSpelerToe(speler2._id, 3, wedstrijdTypes[3], 'dubbel', speler1._id);
              gevonden = true;
            }
          }
        }

        if (!gevonden) return null;
      }

      // Wedstrijd 4
      if (wedstrijdTypes[4] === 'enkel') {
        const speler = beschikbareSpelers.find(s => kanSpelerToewijzen(s._id, 4));
        if (!speler) return null;
        voegSpelerToe(speler._id, 4, 'enkel', 'enkel');
      } else {
        const beschikbaar = beschikbareSpelers.filter(s => kanSpelerToewijzen(s._id, 4));
        if (beschikbaar.length < 2) return null;

        // Probeer combinaties om een zwakker koppel te maken dan wedstrijd 3
        let gevonden = false;
        const wed3Ranking = berekenWedstrijdRanking(3);

        for (let i = 0; i < beschikbaar.length && !gevonden; i++) {
          for (let j = i + 1; j < beschikbaar.length && !gevonden; j++) {
            const speler1 = beschikbaar[i];
            const speler2 = beschikbaar[j];
            const wed4Ranking = speler1.niveau + speler2.niveau;

            // Wedstrijd 4 moet zwakker zijn (hogere som) OF gelijk
            if (wed4Ranking >= wed3Ranking &&
              kanSpelerToewijzen(speler1._id, 4, speler2._id) &&
              kanSpelerToewijzen(speler2._id, 4, speler1._id)) {
              voegSpelerToe(speler1._id, 4, wedstrijdTypes[4], 'enkel', speler2._id);
              voegSpelerToe(speler2._id, 4, wedstrijdTypes[4], 'dubbel', speler1._id);
              gevonden = true;
            }
          }
        }

        if (!gevonden) return null;
      }

      console.log('Opstelling succesvol berekend:', posities);
      return posities;

    } catch (error) {
      console.error('Fout bij het berekenen van opstelling:', error);
      return null;
    }
  };

  const getStatusText = (status: string | undefined | null) => {
    const statusMap: Record<string, string> = {
      'available': 'Beschikbaar',
      'unavailable': 'Niet Beschikbaar',
      'maybe': 'Misschien',
      'beschikbaar': 'Beschikbaar',
      'niet_beschikbaar': 'Niet Beschikbaar',
      'misschien': 'Misschien'
    };
    return statusMap[status || ''] || 'Niet ingesteld';
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'available':
        return 'success.main';
      case 'unavailable':
        return 'error.main';
      case 'maybe':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  if (!match) {
    return (
      <Container>
        <Typography>Laden...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Wedstrijd Details
      </Typography>

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Team Samenstelling
            </Typography>
            <Button
              variant="outlined"
              color="success"
              startIcon={<ShareIcon />}
              onClick={handleShareWhatsApp}
            >
              WhatsApp Indeling
            </Button>
          </Box>
        </Box>
      )}

      {validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>KNLTB Opstellingsregels overtredingen:</strong>
          </Typography>
          {validationErrors.map((error, index) => (
            <Typography key={index} variant="body2">
              {error}
            </Typography>
          ))}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Team Taken / Roles Card */}
        <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Taken
            </Typography>
            {/* Show nice message if successful */}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{match.isThuis ? 'Hapjes Verzorgen' : 'Chauffeur'}</InputLabel>
                  <Select
                    native={isMobile}
                    value={(
                      (match.isThuis ?
                        (typeof match.hapjesVerzorger === 'object' ? (match.hapjesVerzorger as any)._id : match.hapjesVerzorger)
                        :
                        (typeof match.chauffeur === 'object' ? (match.chauffeur as any)._id : match.chauffeur)
                      ) || ''
                    )}
                    label={match.isThuis ? 'Hapjes Verzorgen' : 'Chauffeur'}
                    onChange={async (e) => {
                      const val = e.target.value;
                      const field = match.isThuis ? 'hapjesVerzorger' : 'chauffeur';
                      try {
                        // Immediately show explicit status
                        await wedstrijdApi.update(match._id, { [field]: val });
                        await loadData();
                        showSnackbar('Rol succesvol opgeslagen! ✅');
                      } catch (err) {
                        console.error('Failed to update role', err);
                        showSnackbar('Fout bij opslaan rol.', 'error');
                      }
                    }}
                  >
                    {isMobile ? (
                      <>
                        <option value="">Geen</option>
                        {players.map((p) => (
                          <option key={p._id} value={p._id}>{p.naam}</option>
                        ))}
                      </>
                    ) : (
                      [
                        <MenuItem key="none" value=""><em>Geen</em></MenuItem>,
                        ...players.map((p) => (
                          <MenuItem key={p._id} value={p._id}>
                            {p.naam}
                          </MenuItem>
                        ))
                      ]
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Datum: {new Date(match.datum).toLocaleDateString()}</Typography>
            <Typography variant="subtitle1">Tijd: {match.tijd}</Typography>
            <Typography variant="subtitle1">Team: {getTeamName(match)}</Typography>

          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Locatie: {match.locatie}</Typography>
            <Typography variant="subtitle1">Status: {match.status}</Typography>
            <Typography variant="subtitle1">Type: {match.isThuis ? 'Thuiswedstrijd' : 'Uitwedstrijd'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Beschikbaarheid" />
          <Tab label="Team Samenstelling" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {isMobile ? (
          <Stack spacing={2}>
            {players.map((speler) => {
              const beschikbaarheid = availability.find(avail => avail.player._id === speler._id);
              const statusText = getStatusText(beschikbaarheid?.status);
              const statusColor = getStatusColor(beschikbaarheid?.status);

              return (
                <Card key={speler._id} variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {speler.naam}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: statusColor, fontWeight: 'bold' }}
                      >
                        {statusText}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Niveau: {speler.niveau}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleAvailabilityChange(speler._id, 'available')}
                          color="success"
                          variant={beschikbaarheid?.status === 'available' ? 'contained' : 'outlined'}
                        >
                          Ja
                        </Button>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleAvailabilityChange(speler._id, 'unavailable')}
                          color="error"
                          variant={beschikbaarheid?.status === 'unavailable' ? 'contained' : 'outlined'}
                        >
                          Nee
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleAvailabilityChange(speler._id, 'maybe')}
                          color="warning"
                          variant={beschikbaarheid?.status === 'maybe' ? 'contained' : 'outlined'}
                        >
                          ?
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleAvailabilityDelete(speler._id)}
                          variant="outlined"
                          color="inherit"
                          sx={{ minWidth: 40 }}
                        >
                          X
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Speler</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Acties</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((speler) => {
                  const beschikbaarheid = availability.find(avail => avail.player._id === speler._id);
                  const statusText = getStatusText(beschikbaarheid?.status);
                  const statusColor = getStatusColor(beschikbaarheid?.status);

                  return (
                    <TableRow key={speler._id}>
                      <TableCell>{speler.naam}</TableCell>
                      <TableCell>{speler.niveau}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: statusColor,
                            fontWeight: 'bold'
                          }}
                        >
                          {statusText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleAvailabilityChange(speler._id, 'available')}
                          color="success"
                          sx={{ mr: 1 }}
                          variant={beschikbaarheid?.status === 'available' ? 'contained' : 'outlined'}
                        >
                          Beschikbaar
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleAvailabilityChange(speler._id, 'unavailable')}
                          color="error"
                          sx={{ mr: 1 }}
                          variant={beschikbaarheid?.status === 'unavailable' ? 'contained' : 'outlined'}
                        >
                          Niet Beschikbaar
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleAvailabilityChange(speler._id, 'maybe')}
                          color="warning"
                          variant={beschikbaarheid?.status === 'maybe' ? 'contained' : 'outlined'}
                        >
                          Misschien
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleAvailabilityDelete(speler._id)}
                          variant="outlined"
                          color="inherit"
                          sx={{ ml: 1, minWidth: 40 }}
                          title="Wis beschikbaarheid"
                        >
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateAutomaticLineup}
            startIcon={<AutorenewIcon />}
          >
            Automatische Opstelling
          </Button>
          <Typography variant="body2" color="text.secondary">
            Genereert automatisch een optimale opstelling op basis van beschikbaarheid en KNLTB regels
          </Typography>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/wedstrijden')} sx={{ mb: 1 }}>
              Terug
            </Button>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              {match.thuisteam} vs {match.uitteam}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {formatCompetitieDisplay(match.competitie)} | {match.locatie}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>KNLTB Opstellingsregels:</strong>
          </Typography>
          <Typography variant="body2">
            • Ronde 1: Wedstrijd 1 moet sterker zijn dan wedstrijd 2 (lagere ranking-som = sterker)
          </Typography>
          <Typography variant="body2">
            • Ronde 2: Wedstrijd 3 moet sterker zijn dan wedstrijd 4
          </Typography>
          <Typography variant="body2">
            • Een speler mag per ronde slechts één partij spelen
          </Typography>
          <Typography variant="body2">
            • Een speler mag maximaal 2 dubbels per wedstrijd spelen
          </Typography>
          <Typography variant="body2">
            • Een speler mag niet tweemaal met dezelfde partner spelen
          </Typography>
        </Alert>

        {isMobile ? (
          <Stack spacing={3}>
            {[
              { nummer: 1, ronde: 'Ronde 1' },
              { nummer: 2, ronde: 'Ronde 1' },
              { nummer: 3, ronde: 'Ronde 2' },
              { nummer: 4, ronde: 'Ronde 2' }
            ].map(({ nummer: wedstrijdNummer, ronde }) => {
              const wedstrijdPosities = match.posities?.filter(p => p.positie === wedstrijdNummer) || [];

              const getValidStringValue = (value: any): string => {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value._id) return value._id.toString();
                return '';
              };

              const speler1 = getValidStringValue(wedstrijdPosities.find(p => p.rol === 'enkel')?.spelerId);
              const speler2 = getValidStringValue(wedstrijdPosities.find(p => p.rol === 'dubbel')?.spelerId);
              const currentType = wedstrijdPosities[0]?.type || 'enkel';
              const totalRanking = getMatchTotalRanking(wedstrijdNummer);

              return (
                <Card key={wedstrijdNummer} variant="outlined">
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="overline" color="text.secondary" display="block" lineHeight={1}>
                        {ronde}
                      </Typography>
                      <Typography variant="h6" component="div">
                        Wedstrijd {wedstrijdNummer}
                      </Typography>
                    </Box>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        native={true}
                        value={currentType}
                        label="Type"
                        onChange={(e) => handleMatchTypeChange(wedstrijdNummer, e.target.value as 'enkel' | 'dubbel' | 'gemengd')}
                      >
                        <option value="enkel">Enkel</option>
                        <option value="dubbel">Dubbel</option>
                        <option value="gemengd">Gemengd</option>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Speler 1</InputLabel>
                      <Select
                        native={true}
                        value={speler1}
                        label="Speler 1"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (typeof newValue === 'string') {
                            handlePlayerAssignment(wedstrijdNummer, 1, newValue);
                          }
                        }}
                      >
                        <option value="">Selecteer speler</option>
                        {players.map((speler) => {
                          const validation = canAssignPlayer(wedstrijdNummer, 1, speler._id);
                          return (
                            <option key={speler._id} value={speler._id}>
                              {speler.naam} (Niv. {speler.niveau}) {validation.canAssign ? '' : '⚠️'}
                            </option>
                          );
                        })}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Speler 2</InputLabel>
                      <Select
                        native={true}
                        value={speler2}
                        label="Speler 2"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (typeof newValue === 'string') {
                            handlePlayerAssignment(wedstrijdNummer, 2, newValue);
                          }
                        }}
                        disabled={currentType === 'enkel'}
                      >
                        <option value="">Selecteer speler</option>
                        {players.map((speler) => {
                          const validation = canAssignPlayer(wedstrijdNummer, 2, speler._id);
                          return (
                            <option key={speler._id} value={speler._id}>
                              {speler.naam} (Niv. {speler.niveau}) {validation.canAssign ? '' : '⚠️'}
                            </option>
                          );
                        })}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">
                        Sterkte: <Box component="span" fontWeight="bold" color={totalRanking > 0 ? 'primary.main' : 'text.secondary'}>{totalRanking > 0 ? totalRanking : '-'}</Box>
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleClearMatch(wedstrijdNummer)}
                      >
                        Wissen
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Wedstrijd</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Speler 1</TableCell>
                  <TableCell>Speler 2</TableCell>
                  <TableCell>Totale Sterkte</TableCell>
                  <TableCell>Acties</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { nummer: 1, ronde: 'Ronde 1' },
                  { nummer: 2, ronde: 'Ronde 1' },
                  { nummer: 3, ronde: 'Ronde 2' },
                  { nummer: 4, ronde: 'Ronde 2' }
                ].map(({ nummer: wedstrijdNummer, ronde }) => {
                  const wedstrijdPosities = match.posities?.filter(p => p.positie === wedstrijdNummer) || [];

                  const getValidStringValue = (value: any): string => {
                    if (!value) return '';
                    if (typeof value === 'string') return value;
                    if (typeof value === 'object' && value._id) return value._id.toString();
                    return '';
                  };

                  const speler1 = getValidStringValue(wedstrijdPosities.find(p => p.rol === 'enkel')?.spelerId);
                  const speler2 = getValidStringValue(wedstrijdPosities.find(p => p.rol === 'dubbel')?.spelerId);
                  const currentType = wedstrijdPosities[0]?.type || 'enkel';
                  const totalRanking = getMatchTotalRanking(wedstrijdNummer);

                  return (
                    <TableRow key={wedstrijdNummer}>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {ronde}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          Wedstrijd {wedstrijdNummer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={currentType}
                            onChange={(e) => handleMatchTypeChange(wedstrijdNummer, e.target.value as 'enkel' | 'dubbel' | 'gemengd')}
                          >
                            <MenuItem value="enkel">Enkel</MenuItem>
                            <MenuItem value="dubbel">Dubbel</MenuItem>
                            <MenuItem value="gemengd">Gemengd</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiSelect-select': {
                              color: speler1 ? getPlayerAvailabilityColor(speler1) : 'inherit',
                              fontWeight: speler1 && !isPlayerAvailable(speler1) ? 'bold' : 'normal'
                            }
                          }}
                        >
                          <Select
                            value={speler1}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (typeof newValue === 'string') {
                                handlePlayerAssignment(wedstrijdNummer, 1, newValue);
                              }
                            }}
                          >
                            <MenuItem value="">Selecteer speler</MenuItem>
                            {players.map((speler) => {
                              const validation = canAssignPlayer(wedstrijdNummer, 1, speler._id);
                              const playerColor = getPlayerAvailabilityColor(speler._id);
                              return (
                                <MenuItem
                                  key={speler._id}
                                  value={speler._id}
                                  sx={{
                                    color: !validation.canAssign ? 'error.main' : playerColor,
                                    fontWeight: !isPlayerAvailable(speler._id) ? 'bold' : 'normal',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <span>
                                    {speler.naam} (Niv. {speler.niveau})
                                    {getAvailabilityStatus(speler._id)}
                                  </span>
                                  {!validation.canAssign && (
                                    <Typography variant="caption" color="error" sx={{ ml: 1, fontStyle: 'italic' }}>
                                      ⚠️ {validation.reason}
                                    </Typography>
                                  )}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiSelect-select': {
                              color: speler2 ? getPlayerAvailabilityColor(speler2) : 'inherit',
                              fontWeight: speler2 && !isPlayerAvailable(speler2) ? 'bold' : 'normal'
                            }
                          }}
                        >
                          <Select
                            value={speler2}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (typeof newValue === 'string') {
                                handlePlayerAssignment(wedstrijdNummer, 2, newValue);
                              }
                            }}
                            disabled={currentType === 'enkel'}
                          >
                            <MenuItem value="">Selecteer speler</MenuItem>
                            {players.map((speler) => {
                              const validation = canAssignPlayer(wedstrijdNummer, 2, speler._id);
                              const playerColor = getPlayerAvailabilityColor(speler._id);
                              return (
                                <MenuItem
                                  key={speler._id}
                                  value={speler._id}
                                  sx={{
                                    color: !validation.canAssign ? 'error.main' : playerColor,
                                    fontWeight: !isPlayerAvailable(speler._id) ? 'bold' : 'normal',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <span>
                                    {speler.naam} (Niv. {speler.niveau})
                                    {getAvailabilityStatus(speler._id)}
                                  </span>
                                  {!validation.canAssign && (
                                    <Typography variant="caption" color="error" sx={{ ml: 1, fontStyle: 'italic' }}>
                                      ⚠️ {validation.reason}
                                    </Typography>
                                  )}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={totalRanking > 0 ? 'primary' : 'text.secondary'}
                        >
                          {totalRanking > 0 ? totalRanking : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleClearMatch(wedstrijdNummer)}
                        >
                          Wissen
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={() => navigate('/wedstrijden')}>
          Terug naar Wedstrijden
        </Button>
      </Box>

      {/* Speelvoorkeuren Dialog */}
      <Dialog
        open={voorkeurenDialogOpen}
        onClose={handleVoorkeurenAnnuleren}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Speelvoorkeuren instellen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Geef voor elke speler aan hoeveel wedstrijden ze willen spelen:
          </Typography>
          <List>
            {tempBeschikbareSpelers.map((speler, index) => (
              <React.Fragment key={speler._id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {speler.naam} (Niveau {speler.niveau})
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={speelvoorkeuren[speler._id] || 'graag-2x'}
                      onChange={(e) => handleVoorkeurChange(speler._id, e.target.value as 'graag-2x' | 'minimaal-1x' | 'reserve')}
                    >
                      <FormControlLabel
                        value="graag-2x"
                        control={<Radio />}
                        label="Graag 2 wedstrijden spelen"
                      />
                      <FormControlLabel
                        value="minimaal-1x"
                        control={<Radio />}
                        label="Minimaal 1 wedstrijd (liever niet 2)"
                      />
                      <FormControlLabel
                        value="reserve"
                        control={<Radio />}
                        label="Reserve (alleen indien echt nodig)"
                      />
                    </RadioGroup>
                  </FormControl>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVoorkeurenAnnuleren}>
            Annuleren (gebruik standaard)
          </Button>
          <Button
            onClick={handleVoorkeurenBevestigen}
            variant="contained"
            color="primary"
          >
            Bevestigen
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MatchDetails;
