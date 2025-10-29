const express = require('express');
const homeRoute = express.Router();
const upload = require('../utils/multerConfig');
const { uploadResume } = require('../controllers/uploadController');

const checkLogin = (req, res, next) => {
    if(!req.session.user){
        return res.status(401).json({error: "Unauthorized. Please Register or Log In."});
    }
    next();
}

homeRoute.route('/home').get(checkLogin, (req, res) => {
    res.status(200).json({message: "Welcome to the home page!", user: req.session.user});
});

homeRoute.route('/uploadResume').post(checkLogin, upload.single('resume'), uploadResume);



module.exports = homeRoute;