# Tennis Team Manager

Een applicatie voor het beheren van een tenniscompetitie team, specifiek ontwikkeld voor de KNLTB vrijdagavond competitie.

## Functionaliteiten

- Beheer van spelers (toevoegen, bewerken, verwijderen)
- Beheer van wedstrijden (aanmaken, bewerken, verwijderen)
- Beschikbaarheidsbeheer per wedstrijd
- Toewijzen van spelers aan wedstrijden
- Beheer van chauffeurs en hapjesverzorgers
- Overzicht van beschikbaarheid per wedstrijd

## Vereisten

- Node.js (versie 14 of hoger)
- MongoDB (lokaal geïnstalleerd)
- npm of yarn

## Installatie

1. Clone de repository:
```bash
git clone [repository-url]
cd tennis-team-manager
```

2. Installeer dependencies:
```bash
npm install
```

3. Zorg ervoor dat MongoDB draait op localhost:27017

4. Start de applicatie:
```bash
npm start
```

Voor development met automatisch herstarten:
```bash
npm run dev
```

## API Endpoints

### Spelers
- GET /api/players - Alle spelers ophalen
- GET /api/players/:id - Specifieke speler ophalen
- POST /api/players - Nieuwe speler toevoegen
- PUT /api/players/:id - Speler bijwerken
- DELETE /api/players/:id - Speler verwijderen

### Wedstrijden
- GET /api/matches - Alle wedstrijden ophalen
- GET /api/matches/:id - Specifieke wedstrijd ophalen
- POST /api/matches - Nieuwe wedstrijd aanmaken
- PUT /api/matches/:id - Wedstrijd bijwerken
- DELETE /api/matches/:id - Wedstrijd verwijderen
- POST /api/matches/:id/assign-players - Spelers toewijzen aan wedstrijd
- POST /api/matches/:id/assign-roles - Chauffeur en hapjesverzorger toewijzen

### Beschikbaarheid
- GET /api/availability/match/:matchId - Beschikbaarheid voor wedstrijd ophalen
- GET /api/availability/match/:matchId/summary - Samenvatting beschikbaarheid
- GET /api/availability/match/:matchId/player/:playerId - Beschikbaarheid speler ophalen
- PUT /api/availability/match/:matchId/player/:playerId - Beschikbaarheid bijwerken
- DELETE /api/availability/match/:matchId/player/:playerId - Beschikbaarheid verwijderen

## Gebruik

1. Voeg eerst spelers toe aan het systeem
2. Maak wedstrijden aan voor de competitie
3. Inventariseer de beschikbaarheid van spelers per wedstrijd
4. Wijs spelers toe aan de wedstrijden
5. Wijs chauffeurs en hapjesverzorgers toe

## Ontwikkeling

De applicatie is gebouwd met:
- Node.js en Express voor de backend
- MongoDB voor de database
- Mongoose voor database modellen
- RESTful API architectuur 