import { Match, Player } from '../types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export const generateAvailabilityEmail = (competition: string, matches: Match[]) => {
    const sortedMatches = [...matches].sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

    const subject = `Beschikbaarheid ${competition}`;

    let body = `Hoi team,\n\n`;
    body += `De nieuwe competitie (${competition}) komt er weer aan! Hieronder de speeldata.\n`;
    body += `Willen jullie doorgeven wanneer je verhinderd bent?\n\n`;

    sortedMatches.forEach(match => {
        const datum = format(new Date(match.datum), 'EEEE d MMMM', { locale: nl });
        const thuisUit = match.isThuis ? 'Thuis' : 'Uit';
        const tegenstander = match.isThuis ? match.uitteam : match.thuisteam;
        body += `- ${datum}: ${thuisUit} tegen ${tegenstander}\n`;
    });

    body += `\nGroetjes!`;

    return { subject, body };
};

export const generateWhatsAppLineup = (match: Match, lineup: { positie: number; speler: Player | null; type: string }[], captain?: string, location?: string, departureTime?: string) => {
    const datum = format(new Date(match.datum), 'EEEE d MMMM', { locale: nl });
    const tegenstander = match.isThuis ? match.uitteam : match.thuisteam;
    const thuisUit = match.isThuis ? 'Thuis' : 'Uit';

    let text = `🎾 *Team Indeling - ${datum}*\n`;
    text += `${thuisUit} tegen ${tegenstander}\n\n`;

    if (match.isThuis) {
        text += `📍 Locatie: Thuis\n`;
        text += `⏰ Aanwezig: ${match.tijd || '13:00'}\n\n`;
    } else {
        text += `📍 Locatie: ${location || 'Bij de tegenstander'}\n`;
        text += `🚗 Vertrek: ${departureTime || 'Nog afspreken'}\n\n`;
    }

    text += `*Opstelling:*\n`;

    // Group by type (Enkel, Dubbel)
    const enkels = lineup.filter(l => l.type === 'enkel').sort((a, b) => a.positie - b.positie);
    const dubbels = lineup.filter(l => l.type === 'dubbel').sort((a, b) => a.positie - b.positie);

    enkels.forEach(l => {
        text += `${l.positie}e Enkel: ${l.speler?.naam || 'Nog invullen'}\n`;
    });

    if (dubbels.length > 0) text += `\n`;

    dubbels.forEach(l => {
        // In a real scenario, doubles are pairs, but the current lineup structure lists individual spots. 
        // Assuming naive listing for now or pairs if handled upstream.
        // Based on current MatchDetails logic, we assign individuals.
        // Ideally we group them 1+2, 3+4. 
        // Let's just list them simply for now.
        text += `${l.positie}e Dubbel: ${l.speler?.naam || 'Nog invullen'}\n`;
    });

    if (captain) {
        text += `\n© Aanvoerder: ${captain}`;
    }

    return text;
};
