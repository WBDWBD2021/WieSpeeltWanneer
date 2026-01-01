const Availability = require('../models/Availability');
const Match = require('../models/Match');
const Player = require('../models/Player');

// Get all availability records for a match
exports.getMatchAvailability = async (req, res) => {
    try {
        const wedstrijdId = req.params.wedstrijdId;
        console.log('Getting availability for match:', wedstrijdId);
        
        // First check if the match exists
        const match = await Match.findById(wedstrijdId);
        if (!match) {
            console.log('Match not found:', wedstrijdId);
            return res.status(404).json({ message: 'Match not found' });
        }
        console.log('Match found:', match._id);
        
        // Get all players
        const players = await Player.find({ isActief: true });
        console.log('Found active players:', players.length);
        
        // Get all availability records for this match
        const availability = await Availability.find({ match: wedstrijdId })
            .populate('player');
        console.log('Found availability records:', availability.length);
        
        // Log raw MongoDB data
        console.log('Raw MongoDB data:');
        availability.forEach(record => {
            console.log(JSON.stringify(record.toObject(), null, 2));
        });
        
        // Create a map of player IDs to availability records
        const availabilityMap = new Map();
        availability.forEach(record => {
            const playerId = record.player._id.toString();
            console.log(`Mapping availability for player ${playerId}:`, {
                status: record.status,
                notes: record.notes
            });
            availabilityMap.set(playerId, {
                _id: record._id,
                status: record.status,
                notes: record.notes,
                canDrive: record.canDrive,
                canProvideSnacks: record.canProvideSnacks
            });
        });
        
        // Create response with all players and their availability
        const response = players.map(player => {
            const playerId = player._id.toString();
            const record = availabilityMap.get(playerId);
            console.log(`Creating response for player ${player.naam}:`, {
                hasRecord: !!record,
                status: record?.status
            });
            
            return {
                _id: record?._id || null,
                match: wedstrijdId,
                player: {
                    _id: player._id,
                    naam: player.naam,
                    email: player.email,
                    telefoon: player.telefoon,
                    niveau: player.niveau,
                    isActief: player.isActief
                },
                status: record?.status || null,
                notes: record?.notes || null,
                canDrive: record?.canDrive || false,
                canProvideSnacks: record?.canProvideSnacks || false
            };
        });
        
        console.log('Sending response with', response.length, 'records');
        res.json(response);
    } catch (error) {
        console.error('Error getting match availability:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get availability for a specific player and match
exports.getPlayerAvailability = async (req, res) => {
    try {
        const availability = await Availability.findOne({
            match: req.params.wedstrijdId,
            player: req.params.spelerId
        }).populate('player');

        if (!availability) {
            return res.status(404).json({ message: 'Availability record not found' });
        }
        res.json(availability);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or update availability
exports.updateAvailability = async (req, res) => {
    try {
        const { wedstrijdId, spelerId } = req.params;
        const { status, notes, canDrive, canProvideSnacks } = req.body;

        console.log('Update availability request:', {
            params: req.params,
            body: req.body
        });

        // Validate match exists
        const match = await Match.findById(wedstrijdId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Validate player exists
        const player = await Player.findById(spelerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Create or update availability
        const availability = await Availability.findOneAndUpdate(
            { match: wedstrijdId, player: spelerId },
            {
                status,
                notes,
                canDrive,
                canProvideSnacks
            },
            { new: true, upsert: true }
        ).populate('player');

        console.log('Updated availability:', availability);
        res.json(availability);
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete availability
exports.deleteAvailability = async (req, res) => {
    try {
        const availability = await Availability.findOneAndDelete({
            match: req.params.wedstrijdId,
            player: req.params.spelerId
        });

        if (!availability) {
            return res.status(404).json({ message: 'Availability record not found' });
        }

        res.json({ message: 'Availability record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get availability summary for a match
exports.getAvailabilitySummary = async (req, res) => {
    try {
        const match = await Match.findById(req.params.wedstrijdId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const availability = await Availability.find({ match: req.params.wedstrijdId })
            .populate('player');

        const summary = {
            available: availability.filter(a => a.status === 'available').length,
            unavailable: availability.filter(a => a.status === 'unavailable').length,
            maybe: availability.filter(a => a.status === 'maybe').length,
            total: availability.length,
            details: availability
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 