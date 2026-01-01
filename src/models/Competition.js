const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
    naam: {
        type: String,
        required: true,
        trim: true
    },
    seizoen: {
        type: String,
        enum: ['voorjaar', 'najaar', 'winter', 'zomeravond', 'overig'],
        required: true
    },
    jaar: {
        type: Number,
        required: true
    },
    startDatum: {
        type: Date
    },
    eindDatum: {
        type: Date
    },
    speeldagen: [{
        type: Date
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Competition', competitionSchema);
