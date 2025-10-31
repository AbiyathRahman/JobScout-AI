const express = require('express');
const logoutRoute = express.Router();

logoutRoute.route('/logout').post((req, res) => {
    res.session.destroy((err) => {
        if(err){
            console.error('Logout error:', err);
            return res.status(500).json({error: "Error logging out"});
        }
        res.json({ message: "Logout successful" });
    });
});

module.exports = logoutRoute;