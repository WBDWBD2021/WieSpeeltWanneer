require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Club = require('../models/Club');
const Competition = require('../models/Competition');
const Availability = require('../models/Availability');

const LOCAL_URI = 'mongodb://localhost:27017/tennis-team-manager';
const CLOUD_URI = process.env.MONGODB_URI;

if (!CLOUD_URI) {
    console.error('❌ Geen MONGODB_URI gevonden in .env!');
    process.exit(1);
}

const copyCollection = async (modelName, Model, sourceConn, destConn) => {
    console.log(`\n📦 Migreren van ${modelName}...`);

    // Lees van lokaal
    const SourceModel = sourceConn.model(modelName, Model.schema);
    const docs = await SourceModel.find({});
    console.log(`   - ${docs.length} documenten gevonden lokaal.`);

    if (docs.length === 0) return;

    // Schrijf naar cloud
    const DestModel = destConn.model(modelName, Model.schema);
    let successCount = 0;
    let errorCount = 0;

    for (const doc of docs) {
        try {
            // Gebruik replaceOne met upsert om bestaande IDs te overschrijven/updaten
            await DestModel.replaceOne({ _id: doc._id }, doc.toObject(), { upsert: true });
            successCount++;
        } catch (err) {
            console.error(`   ❌ Fout bij document ${doc._id}:`, err.message);
            errorCount++;
        }
    }
    console.log(`   ✅ ${successCount} overgezet/geüpdatet. ${errorCount > 0 ? `(${errorCount} fouten)` : ''}`);
};

const migrate = async () => {
    console.log('🚀 Start Datamigratie (Lokaal -> Cloud)');
    console.log('---------------------------------------');

    let localConn, cloudConn;

    try {
        // Verbind met beide databases
        console.log('🔌 Verbinden met Lokaal: ' + LOCAL_URI);
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();

        console.log('🔌 Verbinden met Cloud: ' + CLOUD_URI.split('@')[1]); // Verberg credentials
        cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();

        // Migreer collecties
        await copyCollection('Player', Player, localConn, cloudConn);
        await copyCollection('Team', Team, localConn, cloudConn);
        await copyCollection('Club', Club, localConn, cloudConn);
        await copyCollection('Competition', Competition, localConn, cloudConn);
        await copyCollection('Match', Match, localConn, cloudConn);
        await copyCollection('Availability', Availability, localConn, cloudConn);

        console.log('\n---------------------------------------');
        console.log('✅ Migratie Voltooid!');

    } catch (err) {
        console.error('\n❌ FATALE FOUT:', err);
    } finally {
        if (localConn) await localConn.close();
        if (cloudConn) await cloudConn.close();
        process.exit(0);
    }
};

migrate();
