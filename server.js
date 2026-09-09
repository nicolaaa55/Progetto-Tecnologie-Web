require('dotenv').config();
const express = require('express');
const { User, Match } = require('./models');
const sequelize = require('./models/database'); 

const matchRoutes = require('./routes/matchRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

app.use('/api/matches', matchRoutes);
app.use('/api/auth', authRoutes);

sequelize.sync({ force: false }) 
    .then(() => console.log('Database SQLite sincronizzato con successo.'))
    .catch(err => console.error('Errore DB:', err));

app.listen(3000, () => {
    console.log('Server in esecuzione sulla porta 3000');
});