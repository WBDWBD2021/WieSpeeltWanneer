# Fix voor Competitie Filtering Bug

## Probleem
De competitie filtering in de Tennis Team Manager werkte niet correct. Wanneer je op de "Voorjaarscompetitie" of "Najaarscompetitie" tab klikte, werden er geen wedstrijden getoond, ook al waren er wel wedstrijden met die competitie in de database.

### Root Cause
- In de database worden competities opgeslagen als `"voorjaar-2025"` of `"najaar-2025"` (seizoen + jaar)
- De filter functie vergeleek exact op alleen `"voorjaar"` of `"najaar"` (zonder jaar)
- Omdat `"voorjaar-2025" !== "voorjaar"`, werden er geen matches gevonden

## Oplossing

### 1. Matches.tsx - Filtering Logic
De `filterWedstrijden` functie is aangepast om te controleren of de competitie **begint met** het seizoen:

**Voor:**
```typescript
if (competitie !== 'alle') {
  filtered = filtered.filter(w => w.competitie === competitie);
}
```

**Na:**
```typescript
if (competitie !== 'alle') {
  filtered = filtered.filter(w => {
    // Check of de competitie begint met "voorjaar" of "najaar"
    // Dit matcht dan "voorjaar-2025", "najaar-2025", etc.
    return w.competitie && w.competitie.startsWith(competitie);
  });
}
```

### 2. Matches.tsx - Competitie Label
De `getCompetitieLabel` functie is verbeterd om het jaar te tonen:

```typescript
const getCompetitieLabel = (competitie?: string) => {
  if (!competitie) return <Chip label="Geen competitie" size="small" />;
  
  // Parse het competitie formaat: "voorjaar-2025" of "najaar-2025"
  const [seizoen, jaar] = competitie.split('-');
  const seizoenNaam = seizoen === 'voorjaar' ? 'Voorjaar' : 'Najaar';
  
  return (
    <Chip 
      label={`${seizoenNaam} ${jaar}`} 
      size="small"
      color={seizoen === 'voorjaar' ? 'success' : 'primary'}
    />
  );
};
```

### 3. types.ts - Helper Functies
Er zijn nieuwe helper functies toegevoegd voor betere competitie handling:

- `getCompetitieFromDate(datum: Date)` - Bepaalt automatisch de competitie op basis van de datum
- `formatCompetitieDisplay(competitie?: string)` - Formatteert competitie voor display
- `parseCompetitie(competitie?: string)` - Parsed een competitie string naar seizoen en jaar

## Installatie

### Stap 1: Backup maken
```bash
# Maak een backup van je huidige bestanden
cp src/pages/Matches.tsx src/pages/Matches.tsx.backup
cp src/types.ts src/types.ts.backup
```

### Stap 2: Bestanden vervangen
Vervang de volgende bestanden in je project:
- `src/pages/Matches.tsx` → Nieuwe versie met gefixte filtering
- `src/types.ts` → Nieuwe versie met helper functies

### Stap 3: Test de fix
1. Start je applicatie: `npm start`
2. Navigeer naar "Wedstrijden"
3. Klik op de "Voorjaarscompetitie" tab - je zou nu wedstrijden moeten zien die in voorjaar 2024, 2025, etc. zijn
4. Klik op de "Najaarscompetitie" tab - je zou nu wedstrijden moeten zien die in najaar 2024, 2025, etc. zijn

## Wat werkt nu

✅ **Voorjaarscompetitie tab** toont alle wedstrijden met competitie = "voorjaar-XXXX"
✅ **Najaarscompetitie tab** toont alle wedstrijden met competitie = "najaar-XXXX"
✅ **Alle Wedstrijden tab** toont alle wedstrijden en geeft het jaar van de competitie weer
✅ Competitie labels tonen nu duidelijk het seizoen én het jaar (bijv. "Voorjaar 2025")

## Database Schema
Het competitie veld in de database blijft hetzelfde:
```javascript
competitie: {
    type: String,
    // Format: "voorjaar-2025", "najaar-2025", etc.
    default: null
}
```

## Aanvullende Opmerkingen

- De fix is backwards compatible - oude data blijft werken
- De filtering werkt nu voor alle jaren automatisch
- De UI toont nu duidelijk het jaar bij elke competitie
- De code is nu consistenter en makkelijker te onderhouden

## Vragen?
Als je vragen hebt over deze fix, laat het me weten!
