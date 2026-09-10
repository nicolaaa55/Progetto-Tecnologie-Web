const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accesso negato. Effettua il login per giocare." });
    }

    try {
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = verifiedUser;
        
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token non valido o scaduto. Effettua nuovamente il login." });
    }
}

function optionalAuthenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {}

    next();
}

module.exports = authenticateToken;
module.exports.optionalAuthenticateToken = optionalAuthenticateToken;