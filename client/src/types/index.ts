export interface Player {
    _id: string;
    naam: string;
    email: string;
    telefoon: string;
    niveau: number;
    isActief: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Match {
    _id: string;
    datum: string;
    tijd: string;
    team: string;
    isThuis: boolean;
    tegenstander: string;
    locatie: string;
    status: 'gepland' | 'in_behandeling' | 'afgerond' | 'geannuleerd';
    posities: {
        positie: number;
        spelerId: string | null;
        rol: string;
        type: 'enkel' | 'dubbel' | 'gemengd';
    }[];
    chauffeur?: string;
    hapjesVerzorger?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Availability {
    _id: string;
    match: string;
    player: Player;
    status: 'available' | 'unavailable' | 'maybe';
    notes?: string;
    canDrive: boolean;
    canProvideSnacks: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AvailabilitySummary {
    available: number;
    unavailable: number;
    maybe: number;
    total: number;
    details: Availability[];
} 