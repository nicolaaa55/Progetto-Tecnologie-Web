const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './wikiblank.sqlite',
    logging: false
});

module.exports = sequelize;