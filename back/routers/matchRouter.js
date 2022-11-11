const express = require('express');
const matchController = require('../controllers/match.js')
const verifyToken = require('../utils/verifyToken.js')

const tokenValidator = (request, response, next) => {
	const token = request.cookies.token;
	const user = verifyToken(token)
	request.user = user;
	if (user) {
		next();
	} else {
		response.send('token invalid')
		return null
	}
}

const matchRouter = express.Router();

matchRouter.route('/api/match/match').post(tokenValidator, matchController.likeDislike);
matchRouter.route('/api/match/fetchMatch').post(tokenValidator, matchController.fetchMatch);

module.exports = matchRouter;