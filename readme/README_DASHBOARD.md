# Dashboard - Competitie Overzicht

## Wat is nieuw? 🎾

Ik heb een compleet nieuw **Dashboard** toegevoegd aan je Tennis Team Manager! Dit geeft je een overzichtelijk matrix-overzicht van alle wedstrijden in een competitie, vergelijkbaar met je Excel spreadsheet.

## Features ✨

### 1. **Matrix Overzicht**
- Zie in één oogopslag welke spelers wanneer spelen
- Wedstrijden geordend op datum
- Spelers gesorteerd op niveau
- Kleurcodering voor duidelijkheid

### 2. **Kleurcodering**
- 🟢 **Groen (licht)** - Speler speelt 1 wedstrijd
- 🟢 **Groen (donker)** - Speler speelt 2 wedstrijden  
- ⚪ **Grijs** - Speler speelt niet
- 🔴 **Rood** - Speler is niet beschikbaar (maar speelt ook niet)

### 3. **Competitie Selectie**
- Dropdown om tussen verschillende competities te schakelen
- Voorjaarscompetitie en Najaarscompetitie per jaar
- Automatisch gesorteerd op meest recente competitie

### 4. **Wedstrijd Informatie**
Per wedstrijd zie je:
- Weeknummer
- Datum
- Tegenstander
- Thuis/Uit indicator
- Locatie
- Aantal keer dat elke speler speelt (0, 1, of 2)

### 5. **Statistieken Sectie**
Onderaan de pagina zie je totaaloverzicht per speler:
- Totaal aantal wedstrijden gespeeld
- Totaal aantal partijen gespeeld
- Gemiddeld aantal partijen per wedstrijd
- Niveau van de speler

### 6. **Interactieve Tabel**
- Klik op een wedstrijd-rij om naar de wedstrijd details te gaan
- Sticky header blijft zichtbaar bij scrollen
- Hover effect voor betere gebruikservaring
- Tooltips bij spelersnamen tonen het niveau

## Installatie 🚀

### Nieuwe Bestanden
Je moet deze bestanden toevoegen/vervangen:

1. **Nieuw:** `src/pages/Dashboard.tsx` - Het nieuwe Dashboard component
2. **Update:** `src/components/Navigation.tsx` - Dashboard link toegevoegd
3. **Update:** `src/App.tsx` - Dashboard route toegevoegd

### Stappen

1. **Backup maken**
```bash
cp src/components/Navigation.tsx src/components/Navigation.tsx.backup
cp src/App.tsx src/App.tsx.backup
```

2. **Bestanden kopiëren**
Kopieer de nieuwe/geüpdatete bestanden naar je project:
- `src/pages/Dashboard.tsx` (NIEUW)
- `src/components/Navigation.tsx` (UPDATE)
- `src/App.tsx` (UPDATE)

3. **Dependencies checken**
Het Dashboard gebruikt `date-fns` voor datum formatting. Als je dit nog niet hebt:
```bash
npm install date-fns
```

4. **App herstarten**
```bash
npm start
```

## Gebruik 📊

### Dashboard Openen
1. Start je applicatie
2. Klik op **"Dashboard"** in het navigatiemenu (bovenaan)
3. Of navigeer naar: `http://localhost:3002/dashboard`

### Competitie Selecteren
1. Gebruik de dropdown bovenaan: "Selecteer Competitie"
2. Kies de gewenste competitie (bijv. "Voorjaarscompetitie 2025")
3. De matrix wordt automatisch bijgewerkt

### Wedstrijd Details Bekijken
- Klik op een rij in de matrix om naar de wedstrijd details te gaan
- Daar kun je de opstelling aanpassen, beschikbaarheid beheren, etc.

## Hoe de Matrix Werkt 🔢

### Getallen in de Cellen
- **0** = Speler speelt niet deze wedstrijd
- **1** = Speler speelt 1 partij
- **2** = Speler speelt 2 partijen

### Kleuren Betekenis
Het systeem gebruikt verschillende kleuren om snel overzicht te geven:

| Kleur | Betekenis | CSS |
|-------|-----------|-----|
| 🟢 Licht Groen | Speelt 1x | `#e8f5e9` |
| 🟢 Donker Groen | Speelt 2x | `#c8e6c9` |
| ⚪ Grijs | Speelt niet | `#f5f5f5` |
| 🔴 Rood | Niet beschikbaar | `#ffebee` |

### Statistieken Tabel
De statistieken sectie onderaan toont:
- **Totaal Wedstrijden**: In hoeveel wedstrijden de speler is opgesteld
- **Totaal Partijen**: Hoeveel partijen in totaal (kan 2x per wedstrijd zijn bij dubbels)
- **Gemiddeld**: Gemiddeld aantal partijen per wedstrijd

## Layout en Design 🎨

### Sticky Headers
- De kolom headers blijven zichtbaar wanneer je scrollt
- Zo zie je altijd welke speler bij welke kolom hoort

### Responsive Design
- Horizontaal scrollen voor veel spelers
- Verticaal scrollen voor veel wedstrijden
- Optimale weergave op verschillende schermformaten

### Color Scheme
- **Primary Blue** (#1976d2) voor headers
- **Light Blue** voor speler headers
- **Green** voor positieve acties (spelen)
- **Red** voor negatieve status (niet beschikbaar)
- **Grey** voor neutrale status (niet spelen)

## Data Flow 📡

### Data Bronnen
Het Dashboard haalt data op uit:
1. **Wedstrijden API** - Alle wedstrijden
2. **Spelers API** - Alle spelers
3. **Beschikbaarheid API** - Per wedstrijd de beschikbaarheid van spelers

### Berekeningen
- **Match Count**: Telt hoe vaak een speler voorkomt in de posities van een wedstrijd
- **Week Number**: Berekent automatisch het weeknummer van de datum
- **Statistieken**: Aggregeert data over alle wedstrijden heen

## Vergelijking met Excel Screenshot 📊

De Dashboard implementatie lijkt op je Excel screenshot maar met verbeteringen:

### Overeenkomsten ✅
- Matrix layout met spelers als kolommen
- Getallen tonen hoe vaak iemand speelt
- Kleurcodering voor overzicht
- Weeknummer en datum informatie
- Team informatie

### Verbeteringen 🚀
- **Interactief**: Klik op wedstrijd om details te zien
- **Live data**: Altijd actuele informatie uit de database
- **Automatische berekeningen**: Statistieken worden real-time berekend
- **Multi-competitie**: Wissel makkelijk tussen verschillende competities
- **Beschikbaarheid integratie**: Ziet automatisch wie niet beschikbaar is
- **Sorteer opties**: Spelers gesorteerd op niveau

## Veelvoorkomende Scenario's 🎯

### Scenario 1: Planning maken
1. Open Dashboard
2. Selecteer aankomende competitie
3. Zie wie al is ingedeeld
4. Klik op wedstrijd met weinig spelers
5. Vul de opstelling aan

### Scenario 2: Eerlijke verdeling checken
1. Open Dashboard
2. Scroll naar Statistieken sectie
3. Check "Totaal Wedstrijden" per speler
4. Zie gemiddeld aantal partijen
5. Pas eventueel opstellingen aan voor eerlijkere verdeling

### Scenario 3: Competitie overzicht
1. Open Dashboard
2. Selecteer gewenste competitie
3. Zie in één oogopslag:
   - Welke wedstrijden al volledig zijn ingevuld
   - Welke spelers veel/weinig spelen
   - Waar nog gaten zijn in de planning

## Technische Details 🔧

### Component Structuur
```typescript
Dashboard
├── CompetitieSelector (dropdown)
├── Legenda (kleur uitleg)
├── MatrixTable (hoofdtabel)
│   ├── StickyHeaders (speler namen)
│   ├── MatchRows (per wedstrijd)
│   └── PlayerCells (aantal partijen)
└── StatistiekenTable (totaal overzicht)
```

### State Management
- `matches`: Alle wedstrijden van geselecteerde competitie
- `players`: Alle spelers
- `availability`: Beschikbaarheid per wedstrijd/speler
- `selectedCompetitie`: Huidig geselecteerde competitie

### Performance
- Lazy loading van beschikbaarheid data
- Sorteer en filter operaties in memory
- Efficiënte re-renders met React memo

## Toekomstige Uitbreidingen 💡

Mogelijke verbeteringen voor later:
- **Export naar Excel**: Download de matrix als spreadsheet
- **Print View**: Geoptimaliseerde weergave voor printen
- **Filter opties**: Toon alleen bepaalde spelers
- **Drag & Drop**: Sleep spelers direct in de matrix
- **Notities veld**: Voeg opmerkingen toe per cel
- **Hapjes & Chauffeur**: Extra kolommen voor rollen
- **Mobile optimalisatie**: Betere weergave op telefoon

## Troubleshooting 🔍

### Dashboard laadt niet
- Check of alle API endpoints werken
- Controleer browser console voor errors
- Verifieer dat date-fns is geïnstalleerd

### Geen wedstrijden zichtbaar
- Check of er wedstrijden in de database staan
- Verifieer dat wedstrijden een `competitie` veld hebben
- Probeer een andere competitie te selecteren

### Kleuren kloppen niet
- Clear browser cache
- Check of beschikbaarheid data correct wordt opgehaald
- Verifieer dat posities in wedstrijden correct zijn opgeslagen

## Support 💬

Vragen of problemen? Laat het me weten!

---

**Happy Planning!** 🎾✨
