const Club = require('../models/Club');

// Haal alle clubs op
exports.getAllClubs = async (req, res) => {
    try {
        const clubs = await Club.find().sort({ naam: 1 });
        res.json(clubs);
    } catch (error) {
        console.error('Fout bij ophalen clubs:', error);
        res.status(500).json({ message: error.message });
    }
};

// Haal een specifieke club op
exports.getClubById = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club niet gevonden' });
        }
        res.json(club);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Maak een nieuwe club aan
exports.createClub = async (req, res) => {
    const club = new Club({
        naam: req.body.naam,
        plaats: req.body.plaats,
        teams: req.body.teams || []
    });

    try {
        const nieuweClub = await club.save();
        res.status(201).json(nieuweClub);
    } catch (error) {
        console.error('Fout bij aanmaken club:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update een club
exports.updateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club niet gevonden' });
        }

        if (req.body.naam) club.naam = req.body.naam;
        if (req.body.plaats) club.plaats = req.body.plaats;
        if (req.body.teams) club.teams = req.body.teams;

        const bijgewerkteClub = await club.save();
        res.json(bijgewerkteClub);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Verwijder een club
exports.deleteClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club niet gevonden' });
        }

        await club.deleteOne();
        res.json({ message: 'Club verwijderd' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
