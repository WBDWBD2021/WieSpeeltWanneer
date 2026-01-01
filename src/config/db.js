const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tennis-team-manager';

        // Safe logging to debug the URI format
        if (process.env.MONGODB_URI) {
            const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
            console.log(`Verbinden met database (CLOUD): ${maskedUri}`);
        } else {
            console.log('Verbinden met database (LOKAAL)');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`FATAL DATABASE ERROR: ${error.message}`);
        console.error('Check je MONGODB_URI op typefouten of speciale tekens in het wachtwoord.');
        process.exit(1);
    }
};

module.exports = connectDB; 