# Dashboard Installatie - Bestandsoverzicht

## 📦 Nieuwe & Gewijzigde Bestanden

### ✨ NIEUW
1. **src/pages/Dashboard.tsx**
   - Het hoofdcomponent voor het dashboard
   - Matrix-weergave van competitie overzicht
   - Statistieken sectie
   - Kleurcodering voor overzicht

### 🔄 GEWIJZIGD
2. **src/components/Navigation.tsx**
   - Dashboard menu-item toegevoegd
   - DashboardIcon import toegevoegd
   - Route naar /dashboard

3. **src/App.tsx**
   - Dashboard import toegevoegd
   - Dashboard routes toegevoegd (/ en /dashboard)
   - Dashboard als default homepage

## 📋 Stap-voor-stap Installatie

### Stap 1: Backup Maken
```bash
# Maak backup van bestaande bestanden
cp src/components/Navigation.tsx src/components/Navigation.tsx.backup
cp src/App.tsx src/App.tsx.backup
```

### Stap 2: Nieuwe Bestanden Toevoegen

#### A. Dashboard Component (NIEUW)
Kopieer het bestand:
```
tennis-app-dashboard/src/pages/Dashboard.tsx
```
Naar je project:
```
src/pages/Dashboard.tsx
```

#### B. Navigation Component (UPDATE)
Vervang het bestand:
```
tennis-app-dashboard/src/components/Navigation.tsx
```
In je project:
```
src/components/Navigation.tsx
```

#### C. App Component (UPDATE)
Vervang het bestand:
```
tennis-app-dashboard/src/App.tsx
```
In je project:
```
src/App.tsx
```

### Stap 3: Dependencies Checken
```bash
# Check of date-fns is geïnstalleerd
npm list date-fns

# Als niet geïnstalleerd:
npm install date-fns
```

### Stap 4: Applicatie Herstarten
```bash
# Stop de server (Ctrl+C)
# Start opnieuw
npm start
```

### Stap 5: Testen
1. Open browser naar `http://localhost:3002`
2. Je zou automatisch naar het Dashboard moeten gaan
3. Of klik op "Dashboard" in het menu
4. Selecteer een competitie in de dropdown
5. Bekijk de matrix en statistieken

## 📁 Complete Bestandsstructuur

```
tennis-team-manager/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx          ← NIEUW ✨
│   │   ├── Matches.tsx            (bestaand)
│   │   ├── MatchDetails.tsx       (bestaand)
│   │   ├── NewMatch.tsx           (bestaand)
│   │   ├── Players.tsx            (bestaand)
│   │   ├── PlayerDetails.tsx      (bestaand)
│   │   ├── NewPlayer.tsx          (bestaand)
│   │   └── Clubs.tsx              (bestaand)
│   │
│   ├── components/
│   │   └── Navigation.tsx         ← GEWIJZIGD 🔄
│   │
│   ├── services/
│   │   └── api.ts                 (bestaand)
│   │
│   ├── types.ts                   (bestaand, met eerdere fixes)
│   ├── App.tsx                    ← GEWIJZIGD 🔄
│   ├── index.tsx                  (bestaand)
│   └── index.css                  (bestaand)
│
├── public/
│   └── ...
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🔍 Wat Doet Elk Bestand?

### Dashboard.tsx (NIEUW)
**Functionaliteit:**
- Haalt wedstrijden, spelers en beschikbaarheid op
- Filtert op geselecteerde competitie
- Toont matrix met spelers en wedstrijden
- Berekent statistieken per speler
- Kleurcodering op basis van aantal partijen en beschikbaarheid

**Dependencies:**
```typescript
import { wedstrijdApi, spelerApi, beschikbaarheidApi } from '../services/api';
import { Match, Player, Availability } from '../types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
```

**Belangrijke Functies:**
- `loadData()` - Laadt alle data
- `loadMatchesForCompetitie()` - Filtert op competitie
- `getPlayerMatchCount()` - Telt partijen per speler
- `getAvailabilityStatus()` - Haalt beschikbaarheid op
- `getCellStyle()` - Bepaalt kleurcodering
- `getWeekNumber()` - Berekent weeknummer

### Navigation.tsx (GEWIJZIGD)
**Wat is nieuw:**
- Dashboard menu-item toegevoegd bovenaan
- DashboardIcon import
- Path naar /dashboard

**Voor:**
```typescript
const menuItems = [
  { text: 'Wedstrijden', icon: <SportsTennisIcon />, path: '/wedstrijden' },
  { text: 'Spelers', icon: <PeopleIcon />, path: '/spelers' },
  { text: 'Clubs & Teams', icon: <BusinessIcon />, path: '/clubs' },
];
```

**Na:**
```typescript
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Wedstrijden', icon: <SportsTennisIcon />, path: '/wedstrijden' },
  { text: 'Spelers', icon: <PeopleIcon />, path: '/spelers' },
  { text: 'Clubs & Teams', icon: <BusinessIcon />, path: '/clubs' },
];
```

### App.tsx (GEWIJZIGD)
**Wat is nieuw:**
- Dashboard import toegevoegd
- Dashboard routes toegevoegd
- Dashboard als default homepage (/)

**Nieuwe Routes:**
```typescript
<Route path="/" element={<Dashboard />} />
<Route path="/dashboard" element={<Dashboard />} />
```

## 🎨 Styling & Theming

Het Dashboard gebruikt dezelfde Material-UI theme als de rest van de app:
- Primary color: `#1976d2` (blauw)
- Success color: `#2e7d32` (groen)
- Error color: `#c62828` (rood)
- Grey shades voor neutrale status

### Custom Kleuren in Dashboard
```typescript
// Groen - Speelt 1x
backgroundColor: '#e8f5e9', color: '#2e7d32'

// Groen Donker - Speelt 2x
backgroundColor: '#c8e6c9', color: '#1b5e20'

// Grijs - Speelt niet
backgroundColor: '#f5f5f5', color: '#9e9e9e'

// Rood - Niet beschikbaar
backgroundColor: '#ffebee', color: '#c62828'
```

## ⚙️ Configuratie

### TypeScript
Geen extra TypeScript configuratie nodig. Het Dashboard gebruikt de bestaande types uit `types.ts`.

### API Endpoints
Het Dashboard gebruikt deze API endpoints:
- `GET /api/wedstrijden` - Alle wedstrijden
- `GET /api/spelers` - Alle spelers
- `GET /api/beschikbaarheid/wedstrijd/:id` - Beschikbaarheid per wedstrijd

### Environment Variables
Geen extra environment variables nodig. Gebruikt bestaande `API_URL`.

## 🧪 Testing Checklist

Na installatie, test deze features:

- [ ] Dashboard opent automatisch bij opstarten
- [ ] Navigatie naar Dashboard werkt via menu
- [ ] Competitie dropdown toont alle competities
- [ ] Competitie selectie werkt correct
- [ ] Matrix toont alle wedstrijden en spelers
- [ ] Kleuren zijn correct toegepast
- [ ] Getallen kloppen (0, 1, of 2)
- [ ] Klikken op rij opent wedstrijd details
- [ ] Statistieken sectie toont correcte totalen
- [ ] Weeknummers zijn correct
- [ ] Headers blijven zichtbaar bij scrollen
- [ ] Tooltips werken bij spelersnamen
- [ ] Responsive layout werkt (test met window resize)

## 🐛 Troubleshooting

### "Module not found: date-fns"
```bash
npm install date-fns
```

### "Dashboard doesn't show any matches"
- Check of er wedstrijden in de database staan
- Verifieer dat wedstrijden een `competitie` veld hebben
- Open browser console voor errors

### "Colors are not showing"
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console voor CSS errors
- Verifieer Material-UI theme is correct geladen

### "Navigation shows duplicate items"
- Verifieer dat je de nieuwe Navigation.tsx hebt gekopieerd
- Check voor syntax errors in Navigation.tsx

### "Route to Dashboard doesn't work"
- Verifieer dat App.tsx correct is bijgewerkt
- Check of Dashboard.tsx in src/pages/ staat
- Controleer import statement in App.tsx

## 📚 Gerelateerde Documentatie

Lees ook:
1. **README_DASHBOARD.md** - Volledige feature documentatie
2. **DASHBOARD_VISUAL_GUIDE.md** - Visuele layout uitleg
3. **README_COMPETITIE_FIX.md** - Eerdere competitie fix (belangrijke context)

## 🎯 Next Steps

Na succesvolle installatie kun je:
1. Data invullen in wedstrijden
2. Beschikbaarheid bijwerken voor spelers
3. Dashboard gebruiken voor planning
4. Statistieken analyseren voor eerlijke verdeling

## 💡 Tips

- **Shortcut**: Voeg Dashboard toe aan je bookmarks
- **Workflow**: Start elke planning sessie met Dashboard overzicht
- **Monitor**: Check regelmatig de statistieken sectie
- **Planning**: Gebruik kleuren om snel problemen te spotten

## 🎉 Klaar!

Je hebt nu een volledig werkend Dashboard! 

Start de app en geniet van het overzicht! 🎾✨

---

**Vragen of problemen?** Laat het me weten!
