const Team = require('../models/Team');

// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('club')
            .populate('competitie')
            .populate('captain')
            .populate('spelers')
            .populate('invallers')
            .sort({ naam: 1 });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('club')
            .populate('competitie')
            .populate('captain')
            .populate('spelers')
            .populate('invallers');

        if (!team) {
            return res.status(404).json({ message: 'Team niet gevonden' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create team
exports.createTeam = async (req, res) => {
    const team = new Team({
        naam: req.body.naam,
        club: req.body.club,
        competitie: req.body.competitie,
        captain: req.body.captain,
        spelers: req.body.spelers || [],
        invallers: req.body.invallers || []
    });

    try {
        const newTeam = await team.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update team
exports.updateTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team niet gevonden' });
        }

        if (req.body.naam) team.naam = req.body.naam;
        if (req.body.club) team.club = req.body.club;
        if (req.body.competitie) team.competitie = req.body.competitie;
        // Allow setting captain/spelers to null/empty so check for undefined strictly if partial updates intended, 
        // but typically PUT sends whole object or we check key presence.
        if (req.body.captain !== undefined) team.captain = req.body.captain;
        if (req.body.spelers) team.spelers = req.body.spelers;
        if (req.body.invallers) team.invallers = req.body.invallers;

        const updatedTeam = await team.save();
        res.json(updatedTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete team
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team niet gevonden' });
        }
        await team.deleteOne();
        res.json({ message: 'Team verwijderd' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
