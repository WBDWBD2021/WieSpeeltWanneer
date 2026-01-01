# Dashboard Visual Overview

## Layout Beschrijving

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Tennis Team Manager                                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌────────────────────────────────────────────────────────┐
│ Navigation   │  │  Dashboard - Competitie Overzicht                      │
│              │  │                                                         │
│ > Dashboard  │  │  [Selecteer Competitie: Voorjaarscompetitie 2025 ▼]   │
│   Wedstrijden│  │                                                         │
│   Spelers    │  │  Legenda:                                              │
│   Clubs      │  │  [Speelt 1x] [Speelt 2x] [Speelt niet] [Niet beschikbaar]
│              │  │                                                         │
│              │  │  ┌────────────────────────────────────────────────────┐│
│              │  │  │ MATRIX TABEL                                       ││
│              │  │  ├─────┬──────┬───────────┬────────┬─────────────────┤│
│              │  │  │Week │Datum │Tegenstander│Thuis/Uit│Speler1│Speler2││
│              │  │  │     │      │           │        │  (niv)│  (niv)││
│              │  │  ├─────┼──────┼───────────┼────────┼───────┼───────┤│
│              │  │  │ 37  │12 sep│HTC SON 2  │[Thuis] │   1   │   2   ││
│              │  │  │     │      │           │        │ 🟢    │ 🟢🟢  ││
│              │  │  ├─────┼──────┼───────────┼────────┼───────┼───────┤│
│              │  │  │ 38  │19 sep│De Korrel 1│[Uit]   │   0   │   1   ││
│              │  │  │     │      │           │        │ ⚪    │ 🟢    ││
│              │  │  ├─────┼──────┼───────────┼────────┼───────┼───────┤│
│              │  │  │ 39  │26 sep│Volley 1   │[Uit]   │   1   │   0   ││
│              │  │  │     │      │           │        │ 🟢    │ 🔴    ││
│              │  │  └─────┴──────┴───────────┴────────┴───────┴───────┘│
│              │  │                                                         │
│              │  │  ┌────────────────────────────────────────────────────┐│
│              │  │  │ STATISTIEKEN                                       ││
│              │  │  ├───────────┬──────┬─────────┬────────┬─────────────┤│
│              │  │  │Speler     │Niveau│Totaal   │Totaal  │Gemiddeld    ││
│              │  │  │           │      │Wedstr.  │Partijen│per Wedstr.  ││
│              │  │  ├───────────┼──────┼─────────┼────────┼─────────────┤│
│              │  │  │Willem-Jan │  3   │   8     │   12   │    1.50     ││
│              │  │  │Johnson    │  4   │   7     │   10   │    1.43     ││
│              │  │  │Frank      │  5   │   6     │    8   │    1.33     ││
│              │  │  └───────────┴──────┴─────────┴────────┴─────────────┘│
│              │  │                                                         │
└──────────────┘  └────────────────────────────────────────────────────────┘
```

## Kleur Codes in de Matrix

### Cel met "1" (Speelt 1 partij)
```
┌─────┐
│  1  │  🟢 Licht Groen (#e8f5e9)
└─────┘
```

### Cel met "2" (Speelt 2 partijen)
```
┌─────┐
│  2  │  🟢 Donker Groen (#c8e6c9)
└─────┘
```

### Cel met "0" - Speler Beschikbaar (Speelt niet)
```
┌─────┐
│  0  │  ⚪ Grijs (#f5f5f5)
└─────┘
```

### Cel met "0" - Speler NIET Beschikbaar
```
┌─────┐
│  0  │  🔴 Rood (#ffebee)
└─────┘
```

## Interactieve Elementen

### Hover Effect
```
Normaal:     ┌─────┬──────┬────────┐
             │ 37  │12 sep│HTC SON │
             └─────┴──────┴────────┘

Hover:       ┌─────┬──────┬────────┐
             │ 37  │12 sep│HTC SON │  ← Licht blauw achtergrond
             └─────┴──────┴────────┘  ← Cursor: pointer
```

### Speler Header met Tooltip
```
┌──────────────┐
│  Willem-Jan  │  ← Hover om tooltip te zien
│    (3)       │     "Niveau 3"
└──────────────┘
```

## Responsiveness

### Desktop (breed scherm)
- Alle kolommen zichtbaar
- Scrollbare tabel (horizontal + vertical)
- Statistieken onder de matrix

### Tablet (medium scherm)
- Horizontal scroll voor spelers
- Sticky headers blijven zichtbaar
- Verticale scroll voor wedstrijden

### Mobile (klein scherm)
- Optimalisatie aanbevolen voor toekomst
- Momenteel: horizontal scroll vereist

## Data Visualisatie Flow

```
1. User selecteert competitie
         ↓
2. API haalt wedstrijden op
         ↓
3. Filter op competitie
         ↓
4. Sorteer op datum
         ↓
5. Voor elke wedstrijd:
   - Haal beschikbaarheid op
   - Tel aantal keer speler speelt
   - Bepaal kleurcode
         ↓
6. Render matrix
         ↓
7. Bereken statistieken
         ↓
8. Render statistieken tabel
```

## Voorbeeld Scenario's

### Scenario 1: Volledig Ingevulde Wedstrijd
```
Week 37 | 12 sep | HTC SON 2 | [Thuis]
─────────────────────────────────────────
Willem-Jan: 2 🟢🟢  (Speelt 2 partijen)
Johnson:    1 🟢    (Speelt 1 partij)
K-J:        1 🟢    (Speelt 1 partij)
Frank:      0 ⚪    (Speelt niet, is beschikbaar)
Jaap:       0 🔴    (Speelt niet, niet beschikbaar)
```

### Scenario 2: Gedeeltelijk Ingevulde Wedstrijd
```
Week 38 | 19 sep | De Korrel 1 | [Uit]
─────────────────────────────────────────
Willem-Jan: 1 🟢    (Speelt 1 partij)
Johnson:    0 ⚪    (Nog niet ingedeeld)
K-J:        1 🟢    (Speelt 1 partij)
Frank:      0 ⚪    (Nog niet ingedeeld)
Jaap:       0 🔴    (Niet beschikbaar)
```
→ Actie: Klik op deze rij om meer spelers in te delen!

### Scenario 3: Statistieken Interpretatie
```
Speler: Willem-Jan
├─ Niveau: 3 (Sterkste speler)
├─ Totaal Wedstrijden: 8 (Van de 10 wedstrijden)
├─ Totaal Partijen: 12 (Soms 1x, soms 2x)
└─ Gemiddeld: 1.50 (Meestal 2 partijen per wedstrijd)

Analyse: Goede verdeling, speelt regelmatig
```

## Tips voor Gebruik

### ✅ DO's
- Check regelmatig het dashboard voor overzicht
- Gebruik kleuren om snel problemen te spotten
- Klik op rijen om wedstrijden aan te passen
- Let op statistieken voor eerlijke verdeling

### ❌ DON'Ts
- Vergeet niet beschikbaarheid in te vullen
- Negeer rode cellen (niet beschikbaar) niet
- Plan niet te veel wedstrijden voor één speler
- Vergeet zwakkere spelers niet in te delen

## Veelvoorkomende Patronen

### Patroon 1: Gelijke Verdeling
```
Speler A: 1 1 1 1 1 1 1 1  → 8 wedstrijden, goed verdeeld
Speler B: 1 1 1 1 1 1 1 0  → 7 wedstrijden, ook OK
Speler C: 2 0 2 0 2 0 2 0  → 8 wedstrijden, wel clustered
```

### Patroon 2: Problematisch
```
Speler A: 2 2 2 2 2 0 0 0  → Te veel in begin
Speler B: 0 0 0 0 0 2 2 2  → Te veel aan eind
Speler C: 0 0 0 0 0 0 0 0  → Speelt nooit!
```
→ Actie nodig: Herverdelen!

## Mobile Preview (Toekomstige Optimalisatie)

```
┌──────────────────────┐
│ Tennis Team Manager  │
├──────────────────────┤
│ [☰ Menu]             │
├──────────────────────┤
│ Dashboard            │
│                      │
│ [Competitie: V'25 ▼] │
│                      │
│ ← Scroll Horizontal →│
│ ┌───┬─────┬────┬────┐│
│ │W37│Spel1│Spe2│... ││
│ ├───┼─────┼────┼────┤│
│ │   │  1  │ 2  │... ││
│ └───┴─────┴────┴────┘│
│                      │
│ [Tap voor details]   │
└──────────────────────┘
```

---

Deze visuele beschrijving helpt bij het begrijpen van de layout en functionaliteit van het nieuwe Dashboard! 🎾
