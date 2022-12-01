const { Certificate } = require('crypto');
const { response } = require('express');
const db = require('../config/db.js');
const { sendReportMail } = require('../utils/sendEmail.js');

const fetchMatch = (request,  response) => {
	console.log('body in fm:', request.body);
	const user1 = request.user.id;
	const user2 = request.body.target;

	console.log('user1 id in fm:', user1);
	console.log('user1 id in fm:', user2);

	const sql = "SELECT * FROM matches WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)";
	db.query(sql, [user1, user2, user2, user1], (error, result) => {
		if (error) console.log('ERROR in fetchMatch');
		else if (result.length === 0)
			response.send('empty');
		else if (result[0].block === 1)
			response.send('blocked')
		else if (result[0].matched === 1)
			response.send('match');
		else if (result[0].user1 === user1)
			response.send('no show');
		else if (result[0].user2 === user1 && (result[0].like2 !== 1 || result[0].like2 !== 0))
			response.send('show')
		else
			response.send('something wrong in fetchMatch')
		console.log(result[0]);
		
	})
}

const likeDislike = (request, response) => {
	const user1 = request.user.id;
	const user2 = request.body.target;
	const like1 = request.body.like;

	if (request.body.report !== undefined) {
		sendReportMail(user2);
	}
	let sql = "SELECT score FROM users WHERE id = ?";
	if (like1 === true) {
		db.query(sql, [user2], (error, result) => {
			if (error) {
				console.log(error)
				response.send('error get score likedislike')
			} else {
				if (result[0].score <= 45) {
					const newScore = result[0].score + 5;
					const sql = "UPDATE users SET score = ? WHERE id = ?";
					db.query(sql, [newScore, user2], (error) => {
						if (error) {
							console.log(error)
							response.sen('error update score view')
						}
					})
				}
			}
		})
	}
	sql = "SELECT * FROM matches WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)";
	db.query(sql, [user1, user2, user2, user1], (error, result) => {
		if (error)  throw error;
		else {
			if (result.length === 0) {
				if (like1 === false) {
					sql = "INSERT INTO matches (user1, user2, block) VALUES (?, ?, 1)"
					db.query(sql, [user1, user2], function(error, result) {
						if (error) 
							console.log('ERROR in matches 44')
						else {
							response.send('OK');
						}
					})
				}
				else {
					sql = "INSERT INTO matches (user1, user2, like1) VALUES (?,?,?)";
					db.query(sql, [user1, user2, like1], (error, result) => {
						if (error)
							response.send('upsi in matches insert :(');
						else
							response.send('good');
					})
				}
			} else {
				const like2 = result[0].like1;
				const matchId = result[0].id;
				if (like1 === true && like2 === 1) {
					sql = "UPDATE matches SET like2 = ?, matched = true WHERE id = ?"
					db.query(sql, [like1, matchId], function (error, result) {
						if (error) {
							// console.log(error)
							response.send('error matches')
						} else {
							const createChatroom = "INSERT INTO chatrooms (user1, user2) VALUES (?, ?);";
							db.query(createChatroom, [user1, user2], function(error, result) {
								if (error) response.send(error)
								else {
									response.send('match')
								}
							})
						}
					})
				} else if (like1 !== true) {
					sql = "UPDATE matches SET like2 = ?, matched = false, block = true WHERE id = ?"
					db.query(sql, [like1, matchId], function (error, result) {
						if (error) {
							response.send('error matches')
						} else {
							response.send('all gucci belushi')
						}
					})
				}
			}
		}
	})

}

const unlike = (request, response) => {
	const user1 = request.user.id;
	const user2 = request.body.target;
	const like1 = request.body.like;
	const content = `${request.user.name} unmatched you!`;
	console.log('unlike', request.body.unlike);
	if (request.body.unlike === 'unlike') {
		const sql = "DELETE FROM matches WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)";
		db.query(sql, [user1, user2, user2, user1], (error, result) => {
			if (error) console.log('ERROR in likeDislike unlike');
			else {
				const sql = "DELETE FROM chatrooms WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)";
				db.query(sql, [user1, user2, user2, user1], (error, result) => {
					if (error) console.log('ERROR in likeDislike unlike 2');
					else {
						let sql = 'SELECT * FROM notifications WHERE `from` = ? AND `to` = ? AND content = ?';
						db.query(sql, [user1, user2, content], (error, result) => {
							if (error) console.log('ERROR in likeDislike unlike 3')
							else {
								if (result.length === 0) {
									const sql = "INSERT INTO notifications (`from`, `to`, content) VALUES (?, ?, ?)";
									db.query(sql, [user1, user2, content], (error, result) => {
										if (error) console.log('ERROR in likeDislike unlike 4')
										else {
											response.send('unlike')
										}
									})
								}
								else if (result.length > 0) {
									const sql = "UPDATE notifications SET time = NOW(), `read` = 0 WHERE id = ?";
									db.query(sql, [result[0].id], (error, result) => {
										if (error) console.log('ERROR in likeDislike unlike 5')
										else {
											response.send('unlike')
										}
									})
								}
							}
						})
					}
				})
			}
		})
	}
}


module.exports = {
	likeDislike,
	fetchMatch,
	unlike,
}