const mongoose = require('mongoose');

const positieSchema = new mongoose.Schema({
    positie: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    spelerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
    },
    type: {
        type: String,
        enum: ['enkel', 'dubbel', 'gemengd'],
        default: 'enkel'
    },
    rol: {
        type: String,
        enum: ['enkel', 'dubbel'],
        default: 'enkel'
    }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    datum: {
        type: Date,
        required: true
    },
    tegenstander: { type: String }, // Backwards compatibility, not required anymore
    tijd: {
        type: String,
        required: true,
        default: '19:00'
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    isThuis: {
        type: Boolean,
        default: true
    },
    thuisteam: {
        type: String,
        required: true
    },
    uitteam: {
        type: String,
        required: true
    },
    locatie: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['gepland', 'in_behandeling', 'afgerond', 'geannuleerd'],
        default: 'gepland'
    },
    competitie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        default: null
    },
    posities: [positieSchema],
    chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
    },
    hapjesVerzorger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
    }
}, {
    timestamps: true
});

// Indexen voor betere performance
matchSchema.index({ datum: 1 });
matchSchema.index({ team: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ competitie: 1 });

// Helper method om competitie te formatteren
matchSchema.methods.getCompetitieDisplay = function () {
    if (!this.competitie) return 'Geen competitie';

    const [seizoen, jaar] = this.competitie.split('-');
    const jaarNummer = parseInt(jaar);

    if (seizoen === 'voorjaar') return `Voorjaarscompetitie ${jaar}`;
    if (seizoen === 'najaar') return `Najaarscompetitie ${jaar}`;
    if (seizoen === 'winter') return `Wintercompetitie ${jaar}/${jaarNummer + 1}`;
    if (seizoen === 'zomeravond') return `Zomeravondcompetitie ${jaar}`;

    return `${seizoen} ${jaar}`;
};

// Static method om competitie te genereren op basis van datum
matchSchema.statics.generateCompetitie = function (datum) {
    const date = new Date(datum);
    const maand = date.getMonth() + 1; // 1-12
    const jaar = date.getFullYear();

    // Maart (3) t/m Juni (6) = voorjaar
    if (maand >= 3 && maand <= 6) {
        return `voorjaar-${jaar}`;
    }
    // September (9) t/m November (11) = najaar
    if (maand >= 9 && maand <= 11) {
        return `najaar-${jaar}`;
    }
    // December (12) = winter startjaar
    if (maand === 12) {
        return `winter-${jaar}`;
    }
    // Januari (1) en Februari (2) = winter (hoort bij startjaar vorig jaar)
    if (maand <= 2) {
        return `winter-${jaar - 1}`;
    }

    return null;
};

const Match = mongoose.model('Match', matchSchema, 'matches');

module.exports = Match;
