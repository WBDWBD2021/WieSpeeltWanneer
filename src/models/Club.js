const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    naam: {
        type: String,
        required: [true, 'Clubnaam is verplicht'],
        trim: true,
        unique: true
    },
    plaats: {
        type: String,
        required: [true, 'Plaats is verplicht'],
        trim: true
    }
}, {
    timestamps: {
        createdAt: 'aangemaaktOp',
        updatedAt: 'bijgewerktOp'
    }
});

module.exports = mongoose.model('Club', clubSchema);
