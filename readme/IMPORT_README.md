# KNLTB Wedstrijd Import Functionaliteit

## 📥 Wat is dit?

Deze update voegt de mogelijkheid toe om wedstrijdgegevens te importeren van de KNLTB website of via CSV import.

## 🎯 Features

1. **KNLTB Website Scraping**: Automatisch wedstrijden ophalen van MijnKNLTB
2. **CSV Import**: Handmatig wedstrijden importeren via CSV formaat
3. **Seizoen Management**: Ondersteuning voor voorjaar/najaar competities
4. **Template Download**: Download een CSV template om makkelijk te beginnen

## 📦 Installatie

### Backend

1. **Kopieer de controller**:
   ```bash
   cp importController.js backend/controllers/
   ```

2. **Kopieer de routes**:
   ```bash
   cp importRoutes.js backend/routes/
   ```

3. **Kopieer de Python scraper**:
   ```bash
   cp knltb_scraper.py backend/
   chmod +x backend/knltb_scraper.py
   ```

4. **Update index.js** (backend/index.js):
   Voeg deze regel toe bij de andere route imports:
   ```javascript
   const importRoutes = require('./routes/importRoutes');
   ```
   
   En voeg deze regel toe bij de andere app.use statements:
   ```javascript
   app.use('/api', importRoutes);
   ```

5. **Installeer Python dependencies**:
   ```bash
   pip install requests beautifulsoup4
   ```

### Frontend

1. **Kopieer de ImportDialog component**:
   ```bash
   cp ImportDialog.tsx frontend/src/components/
   ```

2. **Update Matches.tsx**:
   Voeg bovenaan toe (bij de andere imports):
   ```typescript
   import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
   import ImportDialog from '../components/ImportDialog';
   ```

   Voeg in de component state toe:
   ```typescript
   const [importDialogOpen, setImportDialogOpen] = useState(false);
   ```

   Voeg in de toolbar een nieuwe knop toe (naast de "Nieuwe Wedstrijd" knop):
   ```typescript
   <Button
     variant="outlined"
     color="primary"
     startIcon={<CloudDownloadIcon />}
     onClick={() => setImportDialogOpen(true)}
     sx={{ mr: 1 }}
   >
     Importeren
   </Button>
   ```

   Voeg onderaan het component toe (voor de sluitende tag):
   ```typescript
   <ImportDialog
     open={importDialogOpen}
     onClose={() => setImportDialogOpen(false)}
     onSuccess={laadWedstrijden}
   />
   ```

## 🚀 Gebruik

### Methode 1: KNLTB Website Import

1. Klik op "Importeren" knop
2. Ga naar het "KNLTB Website" tabblad
3. Vul in:
   - KNLTB Team URL (van MijnKNLTB)
   - Team naam (bijv. "Sla Raak 2")
   - Seizoen (voorjaar/najaar)
   - Jaar
4. Klik op "Importeren"

**Let op**: Deze methode werkt mogelijk niet altijd vanwege de structuur van de KNLTB website. Gebruik dan de CSV methode.

### Methode 2: CSV Import

1. Klik op "Importeren" knop
2. Ga naar het "CSV Import" tabblad
3. Download het CSV template (optioneel)
4. Vul je wedstrijdgegevens in volgens dit formaat:
   ```csv
   Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
   15-09-2025,19:00,Thuis,De Korrel 1,Oisterwijk
   22-09-2025,19:00,Uit,HTC SON 2,Son en Bruegel
   29-09-2025,19:00,Thuis,Volley 1,Oisterwijk
   ```
5. Plak de CSV data in het tekstveld
6. Vul team naam, seizoen en jaar in
7. Klik op "Importeren"

## 📋 CSV Formaat

### Velden:
- **Datum**: DD-MM-YYYY of DD/MM/YYYY formaat (bijv. 15-09-2025)
- **Tijd**: HH:MM formaat (bijv. 19:00)
- **Thuis/Uit**: "Thuis" of "Uit"
- **Tegenstander**: Naam van het andere team
- **Locatie**: Plaats waar de wedstrijd wordt gespeeld

### Voorbeeld:
```csv
Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
15-09-2025,19:00,Thuis,De Korrel 1,Oisterwijk
22-09-2025,19:00,Uit,HTC SON 2,Son en Bruegel
29-09-2025,19:00,Thuis,Volley 1,Oisterwijk
06-10-2025,19:00,Thuis,Westerhoven 1,Oisterwijk
13-10-2025,19:00,Uit,Volley 1,Eindhoven
20-10-2025,19:00,Uit,De Korrel 1,Oisterwijk
27-10-2025,19:00,Thuis,HTC SON 2,Oisterwijk
03-11-2025,19:00,Uit,Westerhoven 1,Westerhoven
```

## 🔧 Troubleshooting

### "Geen wedstrijden gevonden op de opgegeven URL"
- De KNLTB website structuur kan veranderen
- Gebruik de CSV import methode als alternatief

### "Fout bij het scrapen van de KNLTB website"
- Controleer of de URL correct is
- Controleer of Python en de dependencies geïnstalleerd zijn
- Gebruik de CSV import methode

### CSV Import werkt niet
- Controleer of het CSV formaat correct is
- Zorg dat de eerste regel de header is
- Controleer of datums in het juiste formaat staan

## 📝 API Endpoints

De volgende endpoints zijn toegevoegd:

- **POST** `/api/import/knltb` - Import van KNLTB URL
  ```json
  {
    "url": "https://mijnknltb.nl/team/...",
    "team": "Sla Raak 2",
    "seizoen": "najaar",
    "jaar": 2025
  }
  ```

- **POST** `/api/import/csv` - Import van CSV data
  ```json
  {
    "csvData": "Datum,Tijd,Thuis/Uit,Tegenstander,Locatie\n...",
    "team": "Sla Raak 2",
    "seizoen": "najaar",
    "jaar": 2025
  }
  ```

- **GET** `/api/import/csv-template` - Download CSV template

## 🎨 Screenshots

Na installatie zie je een nieuwe "Importeren" knop in de Matches pagina:
- Klik hierop om de import dialog te openen
- Kies tussen KNLTB website of CSV import
- Vul de benodigde gegevens in
- Wedstrijden worden automatisch toegevoegd aan je database

## ⚡ Tips

1. **Voor snelle invoer**: Gebruik de CSV methode met een spreadsheet programma (Excel, Google Sheets)
2. **Voor automatisering**: Probeer eerst de KNLTB scraper, maar houd rekening met mogelijke beperkingen
3. **Bulk import**: Je kunt meerdere wedstrijden tegelijk importeren via CSV
4. **Validatie**: Het systeem valideert automatisch de datum formaten en zet ze om naar het juiste formaat

## 🤝 Ondersteuning

Als je problemen ondervindt:
1. Controleer de browser console voor errors
2. Controleer de backend logs
3. Probeer de CSV import methode als alternatief
4. Zorg dat alle dependencies geïnstalleerd zijn

Succes met het importeren van je wedstrijdschema! 🎾
