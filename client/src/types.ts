// Player Types
export interface Player {
  _id: string;
  naam: string;
  email: string;
  telefoon: string;
  niveau: number;
  geslacht: 'Man' | 'Vrouw';
  club?: string;
  isActief: boolean;
  isCaptain: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Match Position Types
export interface MatchPosition {
  positie: number;
  spelerId: string | null;
  type: 'enkel' | 'dubbel' | 'gemengd';
  rol: 'enkel' | 'dubbel';
}

// Competition Type
export interface Competition {
  _id: string;
  naam: string;
  seizoen: 'voorjaar' | 'najaar' | 'winter' | 'zomeravond' | 'overig';
  jaar: number;
}

// Team Type
export interface Team {
  _id: string;
  naam: string;
  club: string | Club;
  competitie: string | Competition;
  captain?: string | Player;
  spelers?: (string | Player)[];
  invallers?: (string | Player)[];
}

// Match Types
export interface Match {
  _id: string;
  datum: string;
  tijd?: string; // Aanvangstijd voor thuiswedstrijden
  team: string | Team;
  isThuis: boolean;
  thuisteam: string;
  uitteam: string;
  locatie: string;
  status: 'gepland' | 'in_behandeling' | 'afgerond' | 'geannuleerd';
  competitie?: string | Competition; // Format: "voorjaar-2025", "najaar-2025" OR Object
  aanvangstijd?: string;
  vertrektijd?: string; // Vertrektijd voor uitwedstrijden
  posities?: MatchPosition[];
  chauffeur?: string;
  hapjesVerzorger?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Availability Types
export interface Availability {
  _id: string;
  match: string;
  player: Player;
  status: 'available' | 'unavailable' | 'maybe';
  notes?: string;
  canDrive: boolean;
  canProvideSnacks: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilitySummary {
  available: number;
  unavailable: number;
  maybe: number;
  total: number;
  details: Availability[];
}

// Club Types
// Club Types

export interface Club {
  _id: string;
  naam: string;
  plaats: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to get competitie from date
export const getCompetitieFromDate = (datum: Date): string | undefined => {
  const maand = datum.getMonth() + 1; // 1-12
  const jaar = datum.getFullYear();

  // Maart (3) t/m Juni (6) = voorjaar (Zomeravond valt hier ook onder, maar voorjaar is default)
  if (maand >= 3 && maand <= 6) {
    return `voorjaar-${jaar}`;
  }
  // September (9) t/m November (11) = najaar
  if (maand >= 9 && maand <= 11) {
    return `najaar-${jaar}`;
  }
  // December (12), Januari (1) en Februari (2) = winter
  // Let op: Winter 2024 begint in dec 2024 en loopt door in 2025. 
  // We koppelen het aan het jaar van de start (okt/nov/dec) of het jaar van jan/feb.
  // Conventie: Winter 2024-2025 noemen we vaak 'winter-2024' (startjaar) of 'winter-2025' (eindjaar).
  // KNLTB noemt het vaak "Wintercompetitie 2024/2025". 
  // We kiezen hier voor het jaar waarin de competitie speelt (of start).

  if (maand === 12) {
    return `winter-${jaar}`; // Dec 2024 -> winter-2024
  }
  if (maand <= 2) {
    return `winter-${jaar - 1}`; // Jan 2025 -> winter-2024 (hoort bij seizoen gestart in 2024)
  }

  return undefined;
};

// Helper function to format competitie display
export const formatCompetitieDisplay = (competitie?: string): string => {
  if (!competitie) return 'Geen competitie';

  const [seizoen, jaar] = competitie.split('-');
  const jaarNummer = parseInt(jaar);

  if (seizoen === 'voorjaar') return `Voorjaarscompetitie ${jaar}`;
  if (seizoen === 'najaar') return `Najaarscompetitie ${jaar}`;
  if (seizoen === 'winter') return `Wintercompetitie ${jaar}/${jaarNummer + 1}`;
  if (seizoen === 'zomeravond') return `Zomeravondcompetitie ${jaar}`;

  // Fallback
  return `${seizoen} ${jaar}`;
};

// Helper function to parse competitie
export const parseCompetitie = (competitie?: string): { seizoen: string | null; jaar: number | null } => {
  if (!competitie) return { seizoen: null, jaar: null };

  const parts = competitie.split('-');
  if (parts.length !== 2) return { seizoen: null, jaar: null };

  const seizoen = parts[0];
  const jaar = parseInt(parts[1]);

  return { seizoen, jaar };
};

export const getTeamName = (match: Match): string => {
  if (!match.team) return '';
  return typeof match.team === 'string' ? match.team : match.team.naam;
};

export const getCompetitieName = (match: Match | undefined): string => {
  if (!match || !match.competitie) return '';
  if (typeof match.competitie === 'string') return match.competitie;
  return match.competitie.naam;
};

export const getCompetitieId = (match: Match): string => {
  if (!match.competitie) return '';
  if (typeof match.competitie === 'string') return match.competitie; // If string, assume it's the ID (if not populated) OR "seizoen-jaar" which is NOT an ID.
  // Wait, if it's "seizoen-jaar", it's legacy string key.
  // Ideally we return the _id if available.
  return match.competitie._id;
};
