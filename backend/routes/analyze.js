const express = require('express');
const analyzeRoute = express.Router();

const { testResponse } = require('../controllers/analyzeController');

analyzeRoute.route('/testOpenAI').get(testResponse);

module.exports = analyzeRoute;