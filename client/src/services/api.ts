import axios from 'axios';
import { Player, Match, Availability, AvailabilitySummary, Club, Competition, Team } from '../types';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Speler API calls
export const spelerApi = {
    getAll: () => api.get<Player[]>('/spelers'),
    getById: (id: string) => api.get<Player>(`/spelers/${id}`),
    getOne: (id: string) => api.get<Player>(`/spelers/${id}`),
    create: (speler: Omit<Player, '_id' | 'createdAt' | 'updatedAt'>) =>
        api.post<Player>('/spelers', speler),
    update: (id: string, speler: Partial<Player>) =>
        api.put<Player>(`/spelers/${id}`, speler),
    delete: (id: string) => api.delete(`/spelers/${id}`),
};

// Wedstrijd API calls
export const wedstrijdApi = {
    getAll: () => api.get<Match[]>('/wedstrijden'),
    getById: (id: string) => api.get<Match>(`/wedstrijden/${id}`),
    getOne: (id: string) => api.get<Match>(`/wedstrijden/${id}`),
    getBySpelerId: (spelerId: string) => api.get<Match[]>(`/wedstrijden/speler/${spelerId}`),
    create: (wedstrijd: Omit<Match, '_id' | 'createdAt' | 'updatedAt' | '__v'>) =>
        api.post<Match>('/wedstrijden', wedstrijd),
    update: (id: string, wedstrijd: Partial<Match>) =>
        api.put<Match>(`/wedstrijden/${id}`, wedstrijd),
    delete: (id: string) => api.delete(`/wedstrijden/${id}`),
    wijsSpelersToe: (id: string, posities: { positie: number; spelerId: string | null; type: 'enkel' | 'dubbel' | 'gemengd'; rol: string }[]) =>
        api.post<Match>(`/wedstrijden/${id}/wijs-spelers-toe`, posities),
    wijsRollenToe: (id: string, chauffeurId?: string, hapjesVerzorgerId?: string) =>
        api.post<Match>(`/wedstrijden/${id}/wijs-rollen-toe`, { chauffeurId, hapjesVerzorgerId }),
};

// Beschikbaarheid API calls
export const beschikbaarheidApi = {
    getWedstrijdBeschikbaarheid: (wedstrijdId: string) =>
        api.get<Availability[]>(`/beschikbaarheid/wedstrijd/${wedstrijdId}`),
    getByWedstrijdId: (wedstrijdId: string) =>
        api.get<Availability[]>(`/beschikbaarheid/wedstrijd/${wedstrijdId}`),
    getBeschikbaarheidSamenvatting: (wedstrijdId: string) =>
        api.get<AvailabilitySummary>(`/beschikbaarheid/wedstrijd/${wedstrijdId}/samenvatting`),
    getSpelerBeschikbaarheid: (wedstrijdId: string, spelerId: string) =>
        api.get<Availability>(`/beschikbaarheid/wedstrijd/${wedstrijdId}/speler/${spelerId}`),
    updateBeschikbaarheid: (
        wedstrijdId: string,
        spelerId: string,
        beschikbaarheid: Partial<Availability>
    ) => api.put<Availability>(
        `/beschikbaarheid/wedstrijd/${wedstrijdId}/speler/${spelerId}`,
        beschikbaarheid
    ),
    deleteBeschikbaarheid: (wedstrijdId: string, spelerId: string) =>
        api.delete(`/beschikbaarheid/wedstrijd/${wedstrijdId}/speler/${spelerId}`),
};

// Clubs API calls
export const clubApi = {
    getAll: () => api.get<Club[]>('/clubs'),
    getById: (id: string) => api.get<Club>(`/clubs/${id}`),
    create: (club: Omit<Club, '_id' | 'createdAt' | 'updatedAt'>) =>
        api.post<Club>('/clubs', club),
    update: (id: string, club: Partial<Club>) =>
        api.put<Club>(`/clubs/${id}`, club),
    delete: (id: string) => api.delete(`/clubs/${id}`),
};

// Competition API calls
export const competitionApi = {
    getAll: () => api.get<Competition[]>('/competities'),
    getById: (id: string) => api.get<Competition>(`/competities/${id}`),
    create: (competition: Omit<Competition, '_id' | 'createdAt' | 'updatedAt'>) =>
        api.post<Competition>('/competities', competition),
    update: (id: string, competition: Partial<Competition>) =>
        api.put<Competition>(`/competities/${id}`, competition),
    delete: (id: string) => api.delete(`/competities/${id}`),
};

// Team API calls
export const teamApi = {
    getAll: () => api.get<Team[]>('/teams'),
    getById: (id: string) => api.get<Team>(`/teams/${id}`),
    create: (team: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>) =>
        api.post<Team>('/teams', team),
    update: (id: string, team: Partial<Team>) =>
        api.put<Team>(`/teams/${id}`, team),
    delete: (id: string) => api.delete(`/teams/${id}`),
};
