require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../models/Player');
const Team = require('../models/Team');

const CLOUD_URI = process.env.MONGODB_URI;

if (!CLOUD_URI) {
    console.error('❌ Geen MONGODB_URI gevonden!');
    process.exit(1);
}

const verify = async () => {
    try {
        console.log('🔌 Verbinden met Cloud...');
        await mongoose.connect(CLOUD_URI);

        const playerCount = await Player.countDocuments();
        const teamCount = await Team.countDocuments();

        console.log('---------------------------');
        console.log(`✅ Spelers in Cloud: ${playerCount}`);
        console.log(`✅ Teams in Cloud:   ${teamCount}`);
        console.log('---------------------------');

    } catch (err) {
        console.error('❌ Fout:', err);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
