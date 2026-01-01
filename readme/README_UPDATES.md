# Tennis Team Manager - Nieuwe Functies

## 📋 Overzicht van Wijzigingen

### 1. Competitie Beheer
Wedstrijden kunnen nu worden toegewezen aan een competitie (voorjaar of najaar).

#### Wat is nieuw:
- **Competitie veld** toegevoegd aan wedstrijden (voorjaar/najaar)
- **Tabs** op de wedstrijden pagina om te filteren per competitie
- **Competitie selectie** bij het aanmaken/bewerken van wedstrijden
- **Kleurcodering**: Voorjaar = groen, Najaar = blauw

#### Gebruiksvoorbeelden:
- Bij het aanmaken van een nieuwe wedstrijd kun je de competitie selecteren
- Op de wedstrijden pagina kun je filteren op "Alle", "Voorjaar" of "Najaar"
- In de edit dialog kun je de competitie wijzigen

### 2. Status Validatie
Automatische detectie en correctie van verouderde statussen.

#### Wat is nieuw:
- **Automatische detectie** van wedstrijden in het verleden met verkeerde status
- **Visuele waarschuwing** met gele achtergrondkleur
- **Update knop** om alle verouderde statussen in één keer bij te werken
- **Alert melding** bovenaan de pagina

#### Hoe het werkt:
- Wedstrijden in het verleden met status "gepland" of "in behandeling" worden gemarkeerd
- Klik op "Update Statussen" om ze automatisch naar "afgerond" te zetten

### 3. Clubs & Teams Overzicht
Nieuwe pagina voor het beheren van clubs en teams.

#### Wat is nieuw:
- **Clubs pagina** in de navigatie
- **Overzicht per plaats** met kaarten voor elke club
- **Team informatie**: naam, niveau, captain
- **Bewerken en verwijderen** van clubs
- **Overzichtstabel** onderaan de pagina

#### Functies:
- **Toevoegen**: Klik op "Nieuwe Club" om een club toe te voegen
- **Bewerken**: Klik op het potlood icoon om een club te bewerken
- **Verwijderen**: Klik op het prullenbak icoon om een club te verwijderen
- **Groepering**: Clubs worden automatisch gegroepeerd per plaats

### 4. Verbeterde Filtering
Geavanceerde filter opties op de wedstrijden pagina.

#### Wat is nieuw:
- **Status filter** met toggle buttons
- **Multi-select** om meerdere statussen tegelijk te zien
- **Combinatie filters**: Competitie + Status

#### Hoe te gebruiken:
1. Selecteer een competitie tab (Alle/Voorjaar/Najaar)
2. Gebruik de toggle buttons om te filteren op status
3. Selecteer meerdere statussen door ze aan te klikken

## 🗂️ Gewijzigde Bestanden

### Frontend Components:
1. **types.ts** - Uitgebreid met Club en competitie types
2. **Matches.tsx** - Tabs, filtering, status validatie
3. **NewMatch.tsx** - Competitie selectie
4. **Clubs.tsx** - Nieuw: clubs beheer pagina
5. **Navigation.tsx** - Clubs link toegevoegd
6. **App.tsx** - Clubs route toegevoegd
7. **api.ts** - Clubs API endpoints toegevoegd

## 📊 Data Structuur

### Match (uitgebreid):
```typescript
interface Match {
  _id: string;
  datum: string;
  tijd: string;
  team: string;
  isThuis: boolean;
  tegenstander: string;
  locatie: string;
  status: 'gepland' | 'in_behandeling' | 'afgerond' | 'geannuleerd';
  competitie?: 'voorjaar' | 'najaar';  // ⭐ NIEUW
  posities?: PositieInfo[];
  // ... rest
}
```

### Club (nieuw):
```typescript
interface Club {
  _id: string;
  naam: string;
  plaats: string;
  teams: TeamInfo[];
}

interface TeamInfo {
  teamnaam: string;
  niveau: string;
  captain?: string;
  spelers?: string[];
}
```

## 🎯 Volgende Stappen

### Backend:
Om deze functionaliteit volledig te gebruiken moet de backend worden uitgebreid:

1. **Wedstrijd model** uitbreiden met `competitie` veld:
```javascript
competitie: {
  type: String,
  enum: ['voorjaar', 'najaar'],
  required: false
}
```

2. **Club model** toevoegen:
```javascript
const clubSchema = new mongoose.Schema({
  naam: { type: String, required: true },
  plaats: { type: String, required: true },
  teams: [{
    teamnaam: String,
    niveau: String,
    captain: String,
    spelers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speler' }]
  }]
});
```

3. **API endpoints** toevoegen:
- GET /api/clubs
- POST /api/clubs
- PUT /api/clubs/:id
- DELETE /api/clubs/:id

### Aanbevolen verbeteringen:
- [ ] Backend implementatie voor clubs
- [ ] Koppeling tussen wedstrijden en clubs
- [ ] Competitie statistieken (stand, gespeelde wedstrijden, etc.)
- [ ] Export functie voor wedstrijdschema per competitie
- [ ] Team assignments aan wedstrijden

## 🚀 Installatie

Geen extra dependencies nodig. De nieuwe bestanden gebruiken dezelfde Material-UI componenten als de rest van de applicatie.

## 💡 Tips

- Gebruik de competitie tabs om snel tussen voorjaar en najaar te schakelen
- Update oude statussen regelmatig met de "Update Statussen" knop
- Voeg alle clubs en teams toe in het Clubs overzicht voor een compleet beeld
- Gebruik de status filter om bijvoorbeeld alleen geplande wedstrijden te zien
