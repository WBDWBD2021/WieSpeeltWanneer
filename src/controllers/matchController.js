const Match = require('../models/Match');
const Player = require('../models/Player');
const Availability = require('../models/Availability');
const Team = require('../models/Team');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

// Get all matches
exports.getMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('posities.spelerId')
            .populate('chauffeur')
            .populate('hapjesVerzorger')
            .populate('team')
            .populate('competitie')
            .sort({ datum: 1, tijd: 1 });

        console.log(`[matchController] Found ${matches.length} matches`);
        res.json(matches);
    } catch (error) {
        console.error('Fout bij ophalen wedstrijden:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single match
exports.getMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('posities.spelerId')
            .populate('chauffeur')
            .populate('hapjesVerzorger')
            .populate('team')
            .populate('competitie');
        if (!match) {
            return res.status(404).json({ message: 'Wedstrijd niet gevonden' });
        }
        res.json(match);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get matches by player
exports.getMatchesByPlayer = async (req, res) => {
    try {
        const matches = await Match.find({
            'posities.spelerId': req.params.spelerId
        }).populate('posities.spelerId')
            .populate('chauffeur')
            .populate('hapjesVerzorger');
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create match
// Create match
exports.createMatch = async (req, res) => {
    console.log('Ontvangen request body:', req.body);

    try {
        let competitieId = req.body.competitie;
        // Parse Competitie if string "seizoen-jaar"
        if (competitieId && typeof competitieId === 'string' && !competitieId.match(/^[0-9a-fA-F]{24}$/)) {
            const [seizoen, jaarStr] = competitieId.split('-');
            const jaar = parseInt(jaarStr) || new Date().getFullYear();
            const validSeasons = ['voorjaar', 'najaar', 'winter', 'zomeravond'];
            const seasonKey = validSeasons.includes(seizoen) ? seizoen : 'overig';
            const compName = `${seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1)}competitie ${jaar}`;

            let competition = await Competition.findOne({ naam: compName });
            if (!competition) {
                competition = await Competition.create({
                    naam: compName,
                    seizoen: seasonKey,
                    jaar: jaar
                });
            }
            competitieId = competition._id;
        }

        let teamId = req.body.team;
        // Parse Team if string
        if (teamId && typeof teamId === 'string' && !teamId.match(/^[0-9a-fA-F]{24}$/)) {
            let team = await Team.findOne({ naam: teamId, competitie: competitieId });
            if (!team) {
                // Find default club
                let club = await Club.findOne({ naam: 'TV Sla Raak Oisterwijk' });
                if (!club) {
                    club = await Club.create({ naam: 'TV Sla Raak Oisterwijk', plaats: 'Oisterwijk' });
                }
                team = await Team.create({
                    naam: teamId,
                    club: club._id,
                    competitie: competitieId,
                    spelers: []
                });
            }
            teamId = team._id;
        }

        const match = new Match({
            datum: req.body.datum,
            tijd: req.body.tijd,
            team: teamId,
            isThuis: req.body.isThuis,
            tegenstander: req.body.tegenstander,
            thuisteam: req.body.thuisteam,
            uitteam: req.body.uitteam,
            locatie: req.body.locatie,
            status: req.body.status,
            competitie: competitieId, // ObjectId
            posities: req.body.posities || []
        });

        console.log('Nieuwe wedstrijd object:', match);
        const newMatch = await match.save();
        console.log('Wedstrijd succesvol opgeslagen:', newMatch);
        res.status(201).json(newMatch);
    } catch (error) {
        console.error('Fout bij aanmaken wedstrijd:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update match
exports.updateMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        let updateData = { ...req.body };

        // Helper logic to resolve Competitie if string
        if (updateData.competitie && typeof updateData.competitie === 'string' && !updateData.competitie.match(/^[0-9a-fA-F]{24}$/)) {
            const [seizoen, jaarStr] = updateData.competitie.split('-');
            const jaar = parseInt(jaarStr) || new Date().getFullYear();
            const validSeasons = ['voorjaar', 'najaar', 'winter', 'zomeravond'];
            const seasonKey = validSeasons.includes(seizoen) ? seizoen : 'overig';
            const compName = `${seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1)}competitie ${jaar}`;

            let competition = await Competition.findOne({ naam: compName });
            if (!competition) {
                competition = await Competition.create({
                    naam: compName,
                    seizoen: seasonKey,
                    jaar: jaar
                });
            }
            updateData.competitie = competition._id;
        }

        // Helper logic to resolve Team if string
        if (updateData.team && typeof updateData.team === 'string' && !updateData.team.match(/^[0-9a-fA-F]{24}$/)) {
            // We need a competition ID to find the team, try to use the one from update or existing match
            const compId = updateData.competitie || match.competitie;

            // Only try to resolve if we have a compId (which we should)
            if (compId) {
                let team = await Team.findOne({ naam: updateData.team, competitie: compId });
                if (!team) {
                    // Find default club
                    let club = await Club.findOne({ naam: 'TV Sla Raak Oisterwijk' });
                    if (!club) {
                        club = await Club.create({ naam: 'TV Sla Raak Oisterwijk', plaats: 'Oisterwijk' });
                    }
                    team = await Team.create({
                        naam: updateData.team,
                        club: club._id,
                        competitie: compId,
                        spelers: []
                    });
                }
                updateData.team = team._id;
            }
        }

        Object.keys(updateData).forEach(key => {
            match[key] = updateData[key];
        });

        const updatedMatch = await match.save();
        res.json(updatedMatch);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete match
exports.deleteMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Delete associated availability records
        await Availability.deleteMany({ match: req.params.id });

        await match.deleteOne();
        res.json({ message: 'Match deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign players to matches
exports.assignPlayers = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Wedstrijd niet gevonden' });
        }

        const posities = req.body;
        if (!Array.isArray(posities)) {
            return res.status(400).json({ message: 'Ongeldig formaat voor posities' });
        }

        // Validate all players exist and data structure
        for (const positie of posities) {
            // Check required fields
            if (!positie.positie || !positie.type || !positie.rol) {
                return res.status(400).json({
                    message: 'Ongeldige positie data. Alle velden (positie, type, rol) zijn verplicht.'
                });
            }

            // Validate position number
            if (positie.positie < 1 || positie.positie > 4) {
                return res.status(400).json({
                    message: 'Ongeldig positie nummer. Moet tussen 1 en 4 liggen.'
                });
            }

            // Validate type
            if (!['enkel', 'dubbel', 'gemengd'].includes(positie.type)) {
                return res.status(400).json({
                    message: 'Ongeldig type. Moet enkel, dubbel of gemengd zijn.'
                });
            }

            // Validate role
            if (!['enkel', 'dubbel'].includes(positie.rol)) {
                return res.status(400).json({
                    message: 'Ongeldige rol. Moet enkel of dubbel zijn.'
                });
            }

            // Check if player exists if spelerId is provided
            if (positie.spelerId) {
                const player = await Player.findById(positie.spelerId);
                if (!player) {
                    return res.status(400).json({
                        message: `Speler ${positie.spelerId} niet gevonden`
                    });
                }
            }
        }

        // Update match assignments
        match.posities = posities;

        const updatedMatch = await match.save();
        res.json(updatedMatch);
    } catch (error) {
        console.error('Fout bij toewijzen spelers:', error);
        res.status(400).json({ message: error.message });
    }
};

// Assign driver and snack provider
exports.assignRoles = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const { chauffeurId, hapjesVerzorgerId } = req.body;

        if (chauffeurId) {
            const chauffeur = await Player.findById(chauffeurId);
            if (!chauffeur) {
                return res.status(400).json({ message: 'Chauffeur niet gevonden' });
            }
            match.chauffeur = chauffeurId;
        }

        if (hapjesVerzorgerId) {
            const hapjesVerzorger = await Player.findById(hapjesVerzorgerId);
            if (!hapjesVerzorger) {
                return res.status(400).json({ message: 'Hapjes verzorger niet gevonden' });
            }
            match.hapjesVerzorger = hapjesVerzorgerId;
        }

        const updatedMatch = await match.save();
        res.json(updatedMatch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 