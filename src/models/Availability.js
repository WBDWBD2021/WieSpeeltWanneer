const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'unavailable', 'maybe'],
        required: true
    },
    notes: {
        type: String
    },
    canDrive: {
        type: Boolean,
        default: false
    },
    canProvideSnacks: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure a player can only have one availability record per match
availabilitySchema.index({ match: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema); 