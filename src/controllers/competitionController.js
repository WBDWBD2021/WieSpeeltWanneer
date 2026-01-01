const Competition = require('../models/Competition');

// Get all competitions
exports.getAllCompetitions = async (req, res) => {
    try {
        const competitions = await Competition.find().sort({ jaar: -1, startDatum: 1 });
        res.json(competitions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get competition by ID
exports.getCompetitionById = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({ message: 'Competitie niet gevonden' });
        }
        res.json(competition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create competition
exports.createCompetition = async (req, res) => {
    const competition = new Competition({
        naam: req.body.naam,
        seizoen: req.body.seizoen,
        jaar: req.body.jaar,
        startDatum: req.body.startDatum,
        eindDatum: req.body.eindDatum,
        speeldagen: req.body.speeldagen || []
    });

    try {
        const newCompetition = await competition.save();
        res.status(201).json(newCompetition);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update competition
exports.updateCompetition = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({ message: 'Competitie niet gevonden' });
        }

        if (req.body.naam) competition.naam = req.body.naam;
        if (req.body.seizoen) competition.seizoen = req.body.seizoen;
        if (req.body.jaar) competition.jaar = req.body.jaar;
        if (req.body.startDatum) competition.startDatum = req.body.startDatum;
        if (req.body.eindDatum) competition.eindDatum = req.body.eindDatum;
        if (req.body.speeldagen) competition.speeldagen = req.body.speeldagen;

        const updatedCompetition = await competition.save();
        res.json(updatedCompetition);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete competition
exports.deleteCompetition = async (req, res) => {
    try {
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({ message: 'Competitie niet gevonden' });
        }
        await competition.deleteOne();
        res.json({ message: 'Competitie verwijderd' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
