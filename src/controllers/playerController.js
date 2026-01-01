const Player = require('../models/Player');

// Haal alle spelers op
exports.getAllPlayers = async (req, res) => {
    try {
        const spelers = await Player.find();
        console.log('Aantal spelers in database:', spelers.length);
        console.log('Spelers:', spelers);
        res.json(spelers);
    } catch (error) {
        console.error('Fout bij ophalen spelers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Haal een specifieke speler op
exports.getPlayerById = async (req, res) => {
    try {
        const speler = await Player.findById(req.params.id);
        if (!speler) {
            return res.status(404).json({ message: 'Speler niet gevonden' });
        }
        res.json(speler);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Maak een nieuwe speler aan
exports.createPlayer = async (req, res) => {
    console.log('Ontvangen request body:', req.body);

    const speler = new Player({
        naam: req.body.naam,
        email: req.body.email,
        telefoon: req.body.telefoon,
        niveau: req.body.niveau,
        geslacht: req.body.geslacht,
        club: req.body.club,
        isActief: req.body.isActief,
        isCaptain: req.body.isCaptain
    });

    try {
        console.log('Nieuwe speler object:', speler);
        const nieuweSpeler = await speler.save();
        console.log('Speler succesvol opgeslagen:', nieuweSpeler);
        res.status(201).json(nieuweSpeler);
    } catch (error) {
        console.error('Fout bij aanmaken speler:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update een speler
exports.updatePlayer = async (req, res) => {
    try {
        const speler = await Player.findById(req.params.id);
        if (!speler) {
            return res.status(404).json({ message: 'Speler niet gevonden' });
        }

        Object.assign(speler, req.body);
        const bijgewerkteSpeler = await speler.save();
        res.json(bijgewerkteSpeler);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Verwijder een speler
exports.deletePlayer = async (req, res) => {
    try {
        const speler = await Player.findById(req.params.id);
        if (!speler) {
            return res.status(404).json({ message: 'Speler niet gevonden' });
        }

        await speler.deleteOne();
        res.json({ message: 'Speler verwijderd' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 