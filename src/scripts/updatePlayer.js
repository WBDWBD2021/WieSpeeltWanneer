const mongoose = require('mongoose');
const Player = require('../models/Player');

// MongoDB connection URL
const MONGODB_URI = 'mongodb://localhost:27017/tennis-team-manager';

async function updatePlayer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the player by ID
        const player = await Player.findById('6820ca8e1a40a20fc1863ce7');
        if (!player) {
            console.log('Player not found');
            return;
        }

        // Haal de ruwe data op
        const raw = player.toObject();
        console.log('Current player data:', raw);

        // Create a new player with the Dutch field names
        const updatedPlayer = new Player({
            naam: raw.name,
            email: raw.email,
            telefoon: raw.phone,
            niveau: 5, // Default level since it's required in the new schema
            isActief: raw.isActive
        });

        // Save the new player
        await updatedPlayer.save();
        console.log('Player updated successfully:', updatedPlayer.toObject());

        // Delete the old player
        await Player.findByIdAndDelete(player._id);
        console.log('Old player deleted');

    } catch (error) {
        console.error('Error updating player:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

// Run the update
updatePlayer(); 