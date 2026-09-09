const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    targetTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    guessedWords: {
        type: DataTypes.JSON, 
        defaultValue: []
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    startTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('IN_PROGRESS', 'WON', 'ABANDONED'),
        defaultValue: 'IN_PROGRESS'
    }
}, {
    tableName: 'matches',
    timestamps: false
});

module.exports = Match;