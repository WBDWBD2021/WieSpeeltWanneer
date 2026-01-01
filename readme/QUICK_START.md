# 🚀 Quick Start - KNLTB Import

## Snelle Installatie

### Windows
```bash
setup_import.bat
```

### Mac/Linux
```bash
chmod +x setup_import.sh
./setup_import.sh
```

## ✅ Handmatige Stappen

### 1. Backend - index.js aanpassen

Voeg toe na de andere require statements:
```javascript
const importRoutes = require('./routes/importRoutes');
```

Voeg toe na de andere app.use statements:
```javascript
app.use('/api', importRoutes);
```

### 2. Frontend - Matches.tsx aanpassen

**Imports toevoegen:**
```typescript
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ImportDialog from '../components/ImportDialog';
```

**State toevoegen:**
```typescript
const [importDialogOpen, setImportDialogOpen] = useState(false);
```

**Knop toevoegen (in de toolbar):**
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

**Dialog toevoegen (onderaan component):**
```typescript
<ImportDialog
  open={importDialogOpen}
  onClose={() => setImportDialogOpen(false)}
  onSuccess={laadWedstrijden}
/>
```

## 📝 Gebruik - CSV Import (Aanbevolen)

1. Maak een CSV bestand met dit formaat:
```
Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
15-09-2025,19:00,Thuis,De Korrel 1,Oisterwijk
22-09-2025,19:00,Uit,HTC SON 2,Son en Bruegel
```

2. Klik op "Importeren" in de app
3. Ga naar "CSV Import" tab
4. Plak je CSV data
5. Vul team, seizoen en jaar in
6. Klik "Importeren"

## 🌐 KNLTB Website Import

Deze methode kan werken maar is niet gegarandeerd vanwege de structuur van de KNLTB website.

1. Ga naar MijnKNLTB en kopieer de team URL
2. Klik op "Importeren" in de app
3. Ga naar "KNLTB Website" tab
4. Plak de URL
5. Vul de andere velden in
6. Klik "Importeren"

**TIP:** Als deze methode niet werkt, gebruik dan de CSV import!

## 🎯 Voorbeeld Data

Gebruik het meegeleverde `wedstrijden_voorbeeld.csv` bestand als startpunt.

## ❓ Problemen?

Zie `IMPORT_README.md` voor gedetailleerde troubleshooting.

---

**Klaar om te gebruiken na:**
1. ✅ Setup script uitgevoerd
2. ✅ Handmatige stappen gedaan
3. ✅ Backend en frontend herstart

Veel succes! 🎾
