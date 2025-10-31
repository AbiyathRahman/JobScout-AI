const express = require('express');
const analyzeRoute = express.Router();
const { analyzeResume } = require('../controllers/analyzeController');

const dbo = require('../db/conn');

analyzeRoute.route('/analyzeResume').post(async (req, res) => {
    if(!req.session.user){
        return res.status(401).json({error: "Unauthorized. Please Register or Log In."});
    }
    const dbConnect = dbo.getDb();
    // Session stores user info (e.g. username). Try to find by _id if provided, otherwise by username.
    const { ObjectId } = require('mongodb');
    let user = null;
    // If session contains an _id, try to use it (safe conversion)
    if (req.session.user && req.session.user._id) {
        try {
            user = await dbConnect.collection('users').findOne({ _id: new ObjectId(req.session.user._id) });
        } catch (e) {
            // invalid ObjectId string - ignore and fall back to username lookup
            console.warn('Invalid user _id in session, falling back to username lookup');
        }
    }

    // If not found by id, try username (this is how register/login currently store session)
    if (!user && req.session.user && req.session.user.username) {
        user = await dbConnect.collection('users').findOne({ username: req.session.user.username });
    }

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const resumeText = user.resumeText;
    if (!resumeText) {
        return res.status(400).json({ error: 'No resume text found for user' });
    }
    const { jobDescription } = req.body;
    try{
        const result = await analyzeResume(resumeText, jobDescription);
        await dbConnect.collection('users').updateOne(
              { username: req.session.user.username },
              { $set: { analyzedText: result } }
            );
        res.json(result);
    }catch(err){
        console.error('Analyze error:', err && err.message ? err.message : err);
        res.status(500).json({ answer: err && err.message ? err.message : "Error: Could not analyze resume." });
    }
});

module.exports = analyzeRoute;