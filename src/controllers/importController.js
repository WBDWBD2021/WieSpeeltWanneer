const Match = require('../models/Match');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Import wedstrijden van KNLTB URL
 */
exports.importFromKNLTB = async (req, res) => {
    try {
        const { url, seizoen = 'najaar', jaar = 2025, team } = req.body;

        if (!url || !team) {
            return res.status(400).json({ 
                message: 'URL en team zijn verplicht' 
            });
        }

        // Voer de Python scraper uit
        const command = `python3 /home/claude/knltb_scraper.py "${url}" "${seizoen}" "${jaar}"`;
        
        try {
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('Scraper warnings:', stderr);
            }

            const wedstrijden = JSON.parse(stdout);

            if (!wedstrijden || wedstrijden.length === 0) {
                return res.status(404).json({ 
                    message: 'Geen wedstrijden gevonden op de opgegeven URL',
                    hint: 'Probeer de CSV import methode'
                });
            }

            // Voeg team toe aan elke wedstrijd
            const wedstrijdenMetTeam = wedstrijden.map(w => ({
                ...w,
                team: team
            }));

            // Importeer wedstrijden in database
            const geimporteerdeWedstrijden = await Match.insertMany(wedstrijdenMetTeam);

            res.json({
                success: true,
                message: `${geimporteerdeWedstrijden.length} wedstrijden succesvol geïmporteerd`,
                wedstrijden: geimporteerdeWedstrijden
            });

        } catch (execError) {
            console.error('Scraper error:', execError);
            return res.status(500).json({ 
                message: 'Fout bij het scrapen van de KNLTB website',
                error: execError.message,
                hint: 'Probeer de CSV import methode'
            });
        }

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ 
            message: 'Fout bij het importeren van wedstrijden',
            error: error.message 
        });
    }
};

/**
 * Import wedstrijden vanuit CSV data
 * Format: Datum,Tijd,Thuis/Uit,Tegenstander,Locatie,Team
 */
exports.importFromCSV = async (req, res) => {
    try {
        const { csvData, seizoen = 'najaar', jaar = 2025, team } = req.body;

        if (!csvData || !team) {
            return res.status(400).json({ 
                message: 'CSV data en team zijn verplicht' 
            });
        }

        const wedstrijden = parseCSV(csvData, seizoen, jaar, team);

        if (wedstrijden.length === 0) {
            return res.status(400).json({ 
                message: 'Geen geldige wedstrijden gevonden in CSV data' 
            });
        }

        // Importeer wedstrijden in database
        const geimporteerdeWedstrijden = await Match.insertMany(wedstrijden);

        res.json({
            success: true,
            message: `${geimporteerdeWedstrijden.length} wedstrijden succesvol geïmporteerd`,
            wedstrijden: geimporteerdeWedstrijden
        });

    } catch (error) {
        console.error('CSV Import error:', error);
        res.status(500).json({ 
            message: 'Fout bij het importeren van CSV data',
            error: error.message 
        });
    }
};

/**
 * Parse CSV data naar wedstrijd objecten
 */
function parseCSV(csvData, seizoen, jaar, teamNaam) {
    const wedstrijden = [];
    const lines = csvData.trim().split('\n');

    // Skip header line (eerste regel)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split op comma, maar respecteer quotes
        const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const cleanParts = parts.map(p => p.replace(/^"(.*)"$/, '$1').trim());

        if (cleanParts.length >= 5) {
            try {
                const wedstrijd = {
                    datum: parseDatum(cleanParts[0]),
                    tijd: cleanParts[1] || '19:00',
                    team: teamNaam,
                    isThuis: isThuis(cleanParts[2]),
                    tegenstander: cleanParts[3],
                    locatie: cleanParts[4],
                    status: 'gepland',
                    competitie: `${seizoen}-${jaar}`,
                    posities: []
                };

                // Valideer datum
                if (wedstrijd.datum && wedstrijd.tegenstander) {
                    wedstrijden.push(wedstrijd);
                }
            } catch (error) {
                console.error(`Fout bij parsen van regel ${i + 1}:`, error);
            }
        }
    }

    return wedstrijden;
}

/**
 * Parse datum string naar ISO format
 */
function parseDatum(datumStr) {
    // Probeer verschillende formaten
    const formats = [
        // DD-MM-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // YYYY-MM-DD (al correct)
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    ];

    for (const format of formats) {
        const match = datumStr.match(format);
        if (match) {
            if (match[1].length === 4) {
                // YYYY-MM-DD formaat
                const [, jaar, maand, dag] = match;
                return `${jaar}-${maand.padStart(2, '0')}-${dag.padStart(2, '0')}`;
            } else {
                // DD-MM-YYYY of DD/MM/YYYY formaat
                const [, dag, maand, jaar] = match;
                return `${jaar}-${maand.padStart(2, '0')}-${dag.padStart(2, '0')}`;
            }
        }
    }

    // Als geen formaat matcht, probeer als Date object te parsen
    try {
        const date = new Date(datumStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.error('Datum parse error:', error);
    }

    return datumStr;
}

/**
 * Bepaal of wedstrijd thuis is
 */
function isThuis(thuisUitStr) {
    const str = thuisUitStr.toLowerCase();
    return str === 'thuis' || str === 't' || str === 'true' || str === '1';
}

/**
 * Genereer template CSV voor download
 */
exports.getCSVTemplate = (req, res) => {
    const template = `Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
15-09-2025,19:00,Thuis,De Korrel 1,Oisterwijk
22-09-2025,19:00,Uit,HTC SON 2,Son en Bruegel
29-09-2025,19:00,Thuis,Volley 1,Oisterwijk`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=wedstrijden_template.csv');
    res.send(template);
};

module.exports = exports;
