const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    naam: {
        type: String,
        required: [true, 'Naam is verplicht'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is verplicht'],
        unique: true,
        trim: true,
        lowercase: true
    },
    telefoon: {
        type: String,
        required: [true, 'Telefoonnummer is verplicht'],
        trim: true
    },
    niveau: {
        type: Number,
        required: [true, 'Niveau is verplicht'],
        min: 1,
        max: 9
    },
    geslacht: {
        type: String,
        enum: ['Man', 'Vrouw'],
        default: 'Man',
        required: true
    },
    club: {
        type: String,
        required: false
    },
    isActief: {
        type: Boolean,
        default: true
    },
    isCaptain: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'aangemaaktOp',
        updatedAt: 'bijgewerktOp'
    }
});

module.exports = mongoose.model('Player', playerSchema); 