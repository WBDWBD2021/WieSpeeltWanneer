const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    naam: {
        type: String,
        required: true,
        trim: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    competitie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    spelers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    invallers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
