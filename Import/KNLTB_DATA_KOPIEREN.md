# 📋 KNLTB Data Handmatig Kopiëren

## Methode 1: Via Excel/Google Sheets

1. **Open de KNLTB pagina** in je browser:
   https://mijnknltb.toernooi.nl/league/668547F2-D79D-4C9E-9037-7972CF31AD18/team/17876

2. **Selecteer de wedstrijdentabel** op de pagina
   - Klik en sleep om alle rijen te selecteren
   - Of gebruik Ctrl+A om alles te selecteren

3. **Kopieer** (Ctrl+C)

4. **Plak in Excel of Google Sheets** (Ctrl+V)

5. **Reorganiseer de kolommen** naar dit formaat:
   ```
   Datum | Tijd | Thuis/Uit | Tegenstander | Locatie
   ```

6. **Exporteer als CSV**
   - File → Download → CSV (in Google Sheets)
   - File → Save As → CSV (in Excel)

7. **Open het CSV bestand** in een teksteditor

8. **Kopieer de inhoud** en plak in de app

## Methode 2: Direct kopiëren

1. Maak zelf een CSV bestand met dit formaat:
   ```csv
   Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
   08-09-2025,19:00,Thuis,TC De Korrel 2,Oisterwijk
   15-09-2025,19:00,Uit,LTV Goirle 1,Goirle
   ```

2. Vul de wedstrijddata in zoals je ze ziet op de KNLTB website

3. Kopieer en plak in de app

## 📝 Tips:

- **Datum formaat**: DD-MM-YYYY (bijv. 08-09-2025)
- **Tijd**: Standaard meestal 19:00
- **Thuis/Uit**: Typ letterlijk "Thuis" of "Uit"
- **Locatie**: De plaatsnaam waar gespeeld wordt

## ✅ Voorbeeld CSV:

```csv
Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
08-09-2025,19:00,Thuis,TC De Korrel 2,Oisterwijk
15-09-2025,19:00,Uit,LTV Goirle 1,Goirle
22-09-2025,19:00,Thuis,TC Westerhoven 1,Oisterwijk
29-09-2025,19:00,Uit,LTV Goirle 2,Goirle
06-10-2025,19:00,Thuis,TC Schijndel 4,Oisterwijk
13-10-2025,19:00,Uit,LTV de Reit 2,Tilburg
20-10-2025,19:00,Thuis,TC Schijndel 4,Oisterwijk
27-10-2025,19:00,Uit,TC De Korrel 2,Oisterwijk
03-11-2025,19:00,Thuis,LTV Goirle 1,Oisterwijk
10-11-2025,19:00,Uit,TC Westerhoven 1,Westerhoven
17-11-2025,19:00,Thuis,LTV Goirle 2,Oisterwijk
24-11-2025,19:00,Uit,TC Schijndel 4,Schijndel
01-12-2025,19:00,Thuis,LTV de Reit 2,Oisterwijk
```

Dit kun je direct kopiëren en in de app plakken!
