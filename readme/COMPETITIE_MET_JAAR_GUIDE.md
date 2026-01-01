# 🎯 Competitie met Jaar: Complete Implementatie

## 🤔 Waarom Dit Beter Is

### ❌ OUDE STRUCTUUR (Probleem):
```javascript
competitie: "voorjaar"  // Welk jaar? 2024? 2025? 2026?
competitie: "najaar"    // Geen onderscheid tussen jaren!
```

**Problemen:**
- Kan niet filteren op specifiek jaar
- Kan niet historische data vergelijken
- Onduidelijk bij archivering
- Verwarrend voor gebruikers

### ✅ NIEUWE STRUCTUUR (Oplossing):
```javascript
competitie: "voorjaar-2025"  // Duidelijk: Voorjaarscompetitie 2025
competitie: "najaar-2025"    // Duidelijk: Najaarscompetitie 2025
competitie: "voorjaar-2024"  // Vorig jaar
```

**Voordelen:**
- ✅ Uniek per jaar + seizoen
- ✅ Makkelijk filteren en sorteren
- ✅ Duidelijk voor gebruikers
- ✅ Simpel formaat (seizoen-jaar)
- ✅ Ondersteunt historische data

---

## 🔄 Implementatie in 4 Stappen

### ✅ STAP 1: Backend Model Updaten

**Bestand:** `C:\Data\tennis-team-manager\src\models\Match.js`

**Vervang met:** `Match-with-year.js` (nieuwe versie)

**Belangrijkste wijzigingen:**
```javascript
// Schema blijft simpel:
competitie: {
    type: String,
    // Formaat: "voorjaar-2025", "najaar-2025"
    default: null
}

// Helper methods toegevoegd:
matchSchema.statics.generateCompetitie = function(datum) {
    const date = new Date(datum);
    const maand = date.getMonth() + 1;
    const jaar = date.getFullYear();
    
    if (maand >= 3 && maand <= 6) return `voorjaar-${jaar}`;
    if (maand >= 9 && maand <= 11) return `najaar-${jaar}`;
    return null;
};
```

---

### ✅ STAP 2: Bestaande Data Migreren

**Bestand:** `migrate-add-year-to-competitie.js`

**Run het migratiescript:**

```bash
cd C:\Data\tennis-team-manager
node migrate-add-year-to-competitie.js
```

**Wat het doet:**
```javascript
// VOOR migratie:
{ datum: "2025-05-23", competitie: "voorjaar" }
{ datum: "2025-10-10", competitie: "najaar" }
{ datum: "2024-04-15", competitie: "voorjaar" }

// NA migratie:
{ datum: "2025-05-23", competitie: "voorjaar-2025" }
{ datum: "2025-10-10", competitie: "najaar-2025" }
{ datum: "2024-04-15", competitie: "voorjaar-2024" }
```

**Output voorbeeld:**
```
✅ Migratie voltooid!
   10 wedstrijden bijgewerkt naar nieuw formaat

📊 Competities per jaar:
   najaar-2024: 2 wedstrijden
   voorjaar-2025: 5 wedstrijden
   najaar-2025: 3 wedstrijden
```

---

### ✅ STAP 3: Frontend Types Updaten

**Bestand:** `C:\Data\tennis-team-manager\client\src\types.ts`

**Vervang met:** `types-with-year.ts` (nieuwe versie)

**Nieuwe features:**
```typescript
// Competitie is nu een string zoals "voorjaar-2025"
export interface Match {
    competitie?: string;  // "voorjaar-2025", "najaar-2025", etc.
}

// Helper functies:
parseCompetitie("voorjaar-2025")
// Returns: {
//   seizoen: "voorjaar",
//   jaar: 2025,
//   volledigeNaam: "Voorjaarscompetitie 2025",
//   key: "voorjaar-2025"
// }

getCompetitieFromDate(new Date("2025-05-15"))
// Returns: "voorjaar-2025"
```

---

### ✅ STAP 4: Frontend Components Updaten

#### A. NewMatch.tsx - Dropdown Options

**VOOR:**
```jsx
<MenuItem value="voorjaar">Voorjaarscompetitie</MenuItem>
<MenuItem value="najaar">Najaarscompetitie</MenuItem>
```

**NA:**
```jsx
<MenuItem value="">Geen competitie</MenuItem>
<MenuItem value="voorjaar-2024">Voorjaarscompetitie 2024</MenuItem>
<MenuItem value="najaar-2024">Najaarscompetitie 2024</MenuItem>
<MenuItem value="voorjaar-2025">Voorjaarscompetitie 2025</MenuItem>
<MenuItem value="najaar-2025">Najaarscompetitie 2025</MenuItem>
<MenuItem value="voorjaar-2026">Voorjaarscompetitie 2026</MenuItem>
```

**Of beter: Dynamisch genereren:**
```typescript
const getCurrentYear = () => new Date().getFullYear();
const years = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

<Select>
  <MenuItem value="">Geen competitie</MenuItem>
  {years.flatMap(year => [
    <MenuItem key={`voorjaar-${year}`} value={`voorjaar-${year}`}>
      Voorjaarscompetitie {year}
    </MenuItem>,
    <MenuItem key={`najaar-${year}`} value={`najaar-${year}`}>
      Najaarscompetitie {year}
    </MenuItem>
  ])}
</Select>
```

#### B. Matches.tsx - Filter Tabs

**VOOR:**
```jsx
<Tab label="Voorjaarscompetitie" />
<Tab label="Najaarscompetitie" />
```

**NA - Optie 1: Tabs per jaar**
```jsx
<Tabs>
  <Tab label="Alle Wedstrijden" />
  <Tab label="2024" />
  <Tab label="2025" />
  <Tab label="2026" />
</Tabs>

{/* Dan binnen elk jaar sub-tabs of filters voor voorjaar/najaar */}
```

**NA - Optie 2: Dropdown filters**
```jsx
<FormControl>
  <InputLabel>Jaar</InputLabel>
  <Select value={selectedYear}>
    <MenuItem value="alle">Alle jaren</MenuItem>
    <MenuItem value="2024">2024</MenuItem>
    <MenuItem value="2025">2025</MenuItem>
    <MenuItem value="2026">2026</MenuItem>
  </Select>
</FormControl>

<FormControl>
  <InputLabel>Seizoen</InputLabel>
  <Select value={selectedSeizoen}>
    <MenuItem value="alle">Alle seizoenen</MenuItem>
    <MenuItem value="voorjaar">Voorjaar</MenuItem>
    <MenuItem value="najaar">Najaar</MenuItem>
  </Select>
</FormControl>
```

#### C. Matches.tsx - Competitie Labels

**VOOR:**
```jsx
const getCompetitieLabel = (competitie?: string) => {
  if (!competitie) return <Chip label="Geen competitie" />;
  return <Chip label={competitie === 'voorjaar' ? 'Voorjaar' : 'Najaar'} />;
};
```

**NA:**
```jsx
import { parseCompetitie } from '../types';

const getCompetitieLabel = (competitie?: string) => {
  if (!competitie) return <Chip label="Geen competitie" size="small" />;
  
  const info = parseCompetitie(competitie);
  if (!info) return <Chip label="Onbekend" size="small" />;
  
  return (
    <Chip 
      label={info.volledigeNaam}  // "Voorjaarscompetitie 2025"
      size="small"
      color={info.seizoen === 'voorjaar' ? 'success' : 'primary'}
    />
  );
};
```

#### D. Automatische Competitie Suggestie

**In NewMatch.tsx - Automatisch voorstellen op basis van datum:**

```typescript
const [wedstrijd, setWedstrijd] = useState({
  datum: '',
  competitie: undefined,
  // ... andere velden
});

// Wanneer datum verandert, stel competitie voor
const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const datum = e.target.value;
  setWedstrijd(prev => ({
    ...prev,
    datum,
    // Stel automatisch competitie voor
    competitie: datum ? getCompetitieFromDate(new Date(datum)) : undefined
  }));
};
```

---

## 📊 Voorbeelden van Gebruik

### Frontend Display

```typescript
// In je component:
const match = {
  datum: "2025-05-23",
  team: "Sla Raak 2",
  competitie: "voorjaar-2025"
};

const info = parseCompetitie(match.competitie);
console.log(info.volledigeNaam);  // "Voorjaarscompetitie 2025"
console.log(info.seizoen);        // "voorjaar"
console.log(info.jaar);           // 2025
```

### Filter Logica

```typescript
// Filter op specifieke competitie
const voorjaar2025 = wedstrijden.filter(w => w.competitie === "voorjaar-2025");

// Filter op jaar (alle seizoenen)
const jaar2025 = wedstrijden.filter(w => w.competitie?.includes("-2025"));

// Filter op seizoen (alle jaren)
const alleVoorjaar = wedstrijden.filter(w => w.competitie?.startsWith("voorjaar-"));

// Groepeer per competitie
const grouped = wedstrijden.reduce((acc, w) => {
  const comp = w.competitie || 'geen';
  if (!acc[comp]) acc[comp] = [];
  acc[comp].push(w);
  return acc;
}, {});
```

### Sorting

```typescript
// Sorteer wedstrijden op competitie (nieuwste eerst)
wedstrijden.sort((a, b) => {
  if (!a.competitie) return 1;
  if (!b.competitie) return -1;
  return b.competitie.localeCompare(a.competitie);
});

// Results in volgorde:
// "najaar-2025", "voorjaar-2025", "najaar-2024", "voorjaar-2024", null
```

---

## ✅ Verificatie Checklist

Na implementatie:

### Backend:
- [ ] ✅ Match.js heeft nieuwe schema
- [ ] ✅ Migratiescript succesvol gedraaid
- [ ] ✅ MongoDB documenten hebben "seizoen-jaar" formaat
- [ ] ✅ Nieuwe wedstrijden krijgen automatisch correct formaat
- [ ] ✅ Backend test: POST nieuwe wedstrijd met "voorjaar-2025"

### Frontend:
- [ ] ✅ types.ts heeft helper functies
- [ ] ✅ NewMatch.tsx toont jaar in dropdown
- [ ] ✅ Matches.tsx toont volledige competitienaam
- [ ] ✅ Filter werkt op jaar + seizoen
- [ ] ✅ Badges tonen "Voorjaarscompetitie 2025"

### User Experience:
- [ ] ✅ Duidelijk welk jaar bij welke competitie
- [ ] ✅ Kan filteren op specifiek jaar
- [ ] ✅ Kan filteren op specifiek seizoen
- [ ] ✅ Historische data is duidelijk onderscheiden
- [ ] ✅ Nieuwe wedstrijden krijgen automatisch correct jaar

---

## 🎓 Migratie Strategie

### Fase 1: Database (Nu doen)
1. ✅ Update Match.js schema
2. ✅ Run migratiescript
3. ✅ Verifieer in MongoDB Compass
4. ✅ Test backend API

### Fase 2: Frontend Types (Nu doen)
1. ✅ Update types.ts
2. ✅ Herstart React dev server
3. ✅ Check TypeScript errors

### Fase 3: Frontend UI (Later verfijnen)
1. Update NewMatch.tsx dropdown
2. Update Matches.tsx labels
3. Update filter logica
4. Test complete flow

---

## 💡 Best Practices

### 1. **Automatische Competitie Toewijzing**
Gebruik de datum om automatisch de juiste competitie voor te stellen:
```typescript
const suggestedCompetitie = getCompetitieFromDate(selectedDate);
```

### 2. **Flexibele Dropdowns**
Toon altijd vorig jaar, dit jaar, en volgend jaar:
```typescript
const years = [currentYear - 1, currentYear, currentYear + 1];
```

### 3. **Duidelijke Labels**
Gebruik altijd de volledige naam in de UI:
```typescript
"Voorjaarscompetitie 2025"  // ✅ Duidelijk
"voorjaar-2025"             // ❌ Alleen voor opslag
```

### 4. **Backwards Compatibility**
Houd rekening met oude data zonder jaar:
```typescript
const info = parseCompetitie(competitie);
if (!info) {
  // Handle oude data of null waarden
  return "Onbekend";
}
```

---

## 🚀 Start Implementatie

**Aanbevolen volgorde:**

1. **[Match-with-year.js](computer:///mnt/user-data/outputs/Match-with-year.js)**
   - Vervang je Match.js model

2. **[migrate-add-year-to-competitie.js](computer:///mnt/user-data/outputs/migrate-add-year-to-competitie.js)**
   - Run migratiescript: `node migrate-add-year-to-competitie.js`

3. **[types-with-year.ts](computer:///mnt/user-data/outputs/types-with-year.ts)**
   - Vervang je types.ts

4. **Herstart servers**
   - Backend: `npm start`
   - Frontend: `npm start`

5. **Test en verifieer**
   - Check MongoDB Compass
   - Maak test wedstrijd
   - Verifieer competitie formaat

**Tijdsduur:** ~10 minuten voor basis implementatie

**Resultaat:** Professionele competitie structuur met jaar! 🎉

---

## 📞 Volgende Stappen

Wil je dat ik ook:
1. ✅ De complete NewMatch.tsx maak met jaar-dropdowns?
2. ✅ De Matches.tsx update met betere filters?
3. ✅ Een admin pagina voor competitie beheer?

Laat het weten! 🚀
