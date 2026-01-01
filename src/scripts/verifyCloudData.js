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
        const props = await require('../models/Match').find({}, 'status datum');

        const insights = props.reduce((acc, curr) => {
            const year = new Date(curr.datum).getFullYear();
            const status = curr.status || 'unknown';

            acc.years[year] = (acc.years[year] || 0) + 1;
            acc.statuses[status] = (acc.statuses[status] || 0) + 1;
            return acc;
        }, { years: {}, statuses: {} });

        console.log('---------------------------');
        console.log(`✅ Spelers in Cloud:    ${playerCount}`);
        console.log(`✅ Teams in Cloud:      ${teamCount}`);
        console.log(`✅ Totaal:      ${props.length}`);
        console.log('📅 Jaren:', JSON.stringify(insights.years));
        console.log('📊 Statuses:', JSON.stringify(insights.statuses));
        console.log('---------------------------');

    } catch (err) {
        console.error('❌ Fout:', err);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
