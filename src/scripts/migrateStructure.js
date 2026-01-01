const mongoose = require('mongoose');
const Club = require('../models/Club');
const Team = require('../models/Team');
const Competition = require('../models/Competition');
// Load env vars
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tennis-team-manager');
        console.log('Connected to DB');

        // 1. Create Default Club
        let club = await Club.findOne({ naam: 'TV Sla Raak Oisterwijk' });
        if (!club) {
            club = await Club.create({ naam: 'TV Sla Raak Oisterwijk', plaats: 'Oisterwijk' });
            console.log('Created Club:', club.naam);
        } else {
            console.log('Found Club:', club.naam);
        }

        // 2. Process Matches
        // Use raw collection to avoid Mongoose schema validation errors (since schema mismatches current data)
        const matches = await mongoose.connection.db.collection('matches').find({}).toArray();
        console.log(`Found ${matches.length} matches to process`);

        for (const match of matches) {
            // Parse Competition string (e.g., "voorjaar-2025")
            // If match.competitie is already an ObjectId (from previous runs or errors), skip parsing logic or handle it
            if (typeof match.competitie !== 'string') {
                console.log(`Skipping match ${match._id} - competitie is not a string (already migrated?)`);
                continue;
            }

            const compString = match.competitie || 'onbekend-2025';
            let [seizoen, jaarStr] = compString.split('-');

            // Handle cases where split fails
            if (!jaarStr) {
                seizoen = 'onbekend';
                jaarStr = '2025';
            }

            const jaar = parseInt(jaarStr) || 2025;
            // Normalize seizoen
            const validSeasons = ['voorjaar', 'najaar', 'winter', 'zomeravond'];
            if (!validSeasons.includes(seizoen)) seizoen = 'overig';

            const compName = `${seizoen.charAt(0).toUpperCase() + seizoen.slice(1)}competitie ${jaar}`;

            let competition = await Competition.findOne({ naam: compName });
            if (!competition) {
                competition = await Competition.create({
                    naam: compName,
                    seizoen: seizoen,
                    jaar: jaar,
                    speeldagen: []
                });
                console.log('Created Competition:', competition.naam);
            }

            // Get/Create Team
            const teamName = match.team || 'Onbekend Team';
            // match.team is currently a String
            if (typeof match.team !== 'string') {
                console.log(`Skipping match ${match._id} - team is not a string`);
                continue;
            }

            let team = await Team.findOne({ naam: teamName, competitie: competition._id });
            if (!team) {
                team = await Team.create({
                    naam: teamName,
                    club: club._id,
                    competitie: competition._id,
                    spelers: []
                });
                console.log('Created Team:', team.naam);
            }

            // Update Match to point to IDs
            await mongoose.connection.db.collection('matches').updateOne(
                { _id: match._id },
                {
                    $set: {
                        competitie: competition._id,
                        team: team._id
                    }
                }
            );
            console.log(`Migrated Match ${match._id}`);
        }

        console.log('Migration complete');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

migrate();
