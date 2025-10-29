const express = require('express');
const crypto = require('crypto');
const loginRoutes = express.Router();

const dbo = require('../db/conn');

loginRoutes.route('/login').post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        const {username, password} = req.body;
        let hash = function(str, salt){
            if(typeof(str) == 'string' && str.length > 0){
                        let hash = crypto.createHmac('sha256', salt);
                        let update = hash.update(str);
                        let digest = update.digest('hex');
                        return digest;
                    }else{
                        return false;
                    };

        }
        const user = await db_connect.collection('users').findOne({username: username});
        if(!user){
            return res.status(400).json({error: 'User not found'});
        }
        const hashedPassword = hash(password, user.salt);
        if(hashedPassword !== user.password){
            return res.status(400).json({error: 'Invalid Password'});
        }
        req.session.user = { username: user.username};
        return res.status(200).json({message: 'Login successful'});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Server error"});
    }
});

module.exports = loginRoutes;