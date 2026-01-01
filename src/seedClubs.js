const mongoose = require('mongoose');
const Club = require('./models/Club');

mongoose.connect('mongodb://localhost:27017/tennis-team-manager')
    .then(() => console.log('MongoDB verbonden voor seed'))
    .catch(err => console.error('MongoDB verbindingsfout:', err));

const clubs = [
    {
        naam: 'Sla Raak',
        plaats: 'Oisterwijk',
        teams: [
            { teamnaam: 'Sla Raak 1', niveau: 'Hoofdklasse', captain: 'Jan de Vries' },
            { teamnaam: 'Sla Raak 2', niveau: '1e klasse', captain: 'Piet Jansen' },
            { teamnaam: 'Sla Raak 3', niveau: '2e klasse' },
        ]
    },
    {
        naam: 'De Korrel',
        plaats: 'Oisterwijk',
        teams: [
            { teamnaam: 'De Korrel 1', niveau: 'Hoofdklasse' },
            { teamnaam: 'De Korrel 2', niveau: '1e klasse' },
        ]
    },
    {
        naam: 'HTC SON',
        plaats: 'Son en Bruegel',
        teams: [
            { teamnaam: 'HTC SON 1', niveau: 'Hoofdklasse' },
            { teamnaam: 'HTC SON 2', niveau: '1e klasse' },
        ]
    },
    {
        naam: 'Volley',
        plaats: 'Eindhoven',
        teams: [
            { teamnaam: 'Volley 1', niveau: 'Hoofdklasse' },
        ]
    },
    {
        naam: 'Westerhoven',
        plaats: 'Oisterwijk',
        teams: [
            { teamnaam: 'Westerhoven 1', niveau: '1e klasse' },
        ]
    },
];

const seedClubs = async () => {
    try {
        await Club.deleteMany({}); // Clear existing
        await Club.insertMany(clubs);
        console.log('Clubs seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding clubs:', error);
        process.exit(1);
    }
};

seedClubs();
