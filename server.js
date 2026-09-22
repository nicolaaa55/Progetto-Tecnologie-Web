require('dotenv').config();
const express = require('express');
const { User, Match } = require('./models');
const sequelize = require('./models/database'); 

const matchRoutes = require('./routes/matchRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const cors = require('cors');
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/matches', matchRoutes);
app.use('/api/auth', authRoutes);

async function startServer() {
    try {
        await sequelize.sync({ force: false });

        const matchColumns = await sequelize.getQueryInterface().describeTable('matches');
        if (!matchColumns.guestId) {
            await sequelize.getQueryInterface().addColumn('matches', 'guestId', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
        }
        if (!matchColumns.selectionMode) {
            await sequelize.getQueryInterface().addColumn('matches', 'selectionMode', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
        }

        app.listen(3000);
    } catch (error) {
        console.error('Errore DB:', error);
        process.exitCode = 1;
    }
}

startServer();