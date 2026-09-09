const User = require('./User');
const Match = require('./Match');

User.hasMany(Match, {
    foreignKey: 'userId',
    as: 'matches'
});

Match.belongsTo(User, {
    foreignKey: 'userId',
    as: 'player'
});

module.exports = { User, Match };