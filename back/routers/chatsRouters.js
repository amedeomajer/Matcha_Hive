const express = require('express');
const chatsController = require('../controllers/chats')

const chatsRouter = express.Router();
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

chatsRouter.route('/api/chat/chatrooms').post(tokenValidator, chatsController.getChatrooms);
chatsRouter.route('/api/chat/authorize').post(tokenValidator, chatsController.authorizeRoomAccess);
chatsRouter.route('/api/chat/send').post(tokenValidator, chatsController.sendMessage);
chatsRouter.route('/api/chat/get-messages').post(tokenValidator, chatsController.getMessages);

module.exports = chatsRouter;